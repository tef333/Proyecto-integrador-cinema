"""Transaccion cruzada: registrar una venta en PostgreSQL y generar, en la misma
operacion, su comprobante en MongoDB.

Por que se hace asi
-------------------
PostgreSQL y MongoDB no comparten un coordinador de transacciones (no hay
commit de dos fases entre ellos), asi que la operacion se coordina como una
SAGA corta, ordenada para que el caso normal sea simple y el caso de error se
pueda deshacer:

  1. PostgreSQL: se abre una transaccion y se inserta la venta. Los triggers
     validan cupo, edad, estado de la funcion y suman puntos de fidelizacion.
     La transaccion queda ABIERTA (todavia sin commit).
  2. MongoDB: se inserta el comprobante con writeConcern 'majority'.
  3. PostgreSQL: se hace COMMIT.

Si falla el paso 1  -> nada se escribio en Mongo; se devuelve el motivo.
Si falla el paso 2  -> se hace ROLLBACK en PostgreSQL; la venta no existe.
Si falla el paso 3  -> la venta se revierte y se COMPENSA en Mongo borrando el
                       comprobante (compensacion.py).
Asi PostgreSQL (la fuente de verdad del dinero) nunca queda con una venta sin
comprobante, y el unico dato que puede quedar huerfano es un comprobante de
Mongo, que se detecta por su id_venta y se corrige con la compensacion.

Los errores se devuelven como excepciones con un 'codigo' y un 'estado_http'
sugerido, para que la API (FastAPI) los traduzca sin repetir logica.
"""
from datetime import datetime, timezone
from decimal import Decimal

import psycopg
from bson import Decimal128, ObjectId
from psycopg import errors as pgerr
from pymongo.errors import PyMongoError

from compensacion import COLECCION, ErrorCompensacion, compensar_comprobante
from db import coleccion_confirmada


# ---------------------------------------------------------------- errores ---
class ErrorIntegracion(Exception):
    codigo = "error_integracion"
    estado_http = 500

    def __init__(self, mensaje: str, detalle: dict | None = None):
        super().__init__(mensaje)
        self.mensaje = mensaje
        self.detalle = detalle or {}

    def como_dict(self) -> dict:
        return {"error": self.codigo, "mensaje": self.mensaje, **self.detalle}


class ErrorValidacion(ErrorIntegracion):
    """Datos de entrada incorrectos (campo faltante, tipo o valor invalido)."""
    codigo, estado_http = "datos_invalidos", 422


class ErrorNegocio(ErrorIntegracion):
    """PostgreSQL rechazo la venta por una regla del negocio (sin cupo, edad,
    funcion cancelada...). Usa el mensaje del trigger."""
    codigo, estado_http = "regla_de_negocio", 409


class ErrorNoEncontrado(ErrorIntegracion):
    """La funcion, el espectador o el taquillero no existe."""
    codigo, estado_http = "no_encontrado", 404


class ErrorMongo(ErrorIntegracion):
    """MongoDB no pudo guardar el comprobante; la venta se revirtio."""
    codigo, estado_http = "mongo_no_disponible", 503


class ErrorPostgres(ErrorIntegracion):
    """Fallo inesperado de PostgreSQL."""
    codigo, estado_http = "postgres_no_disponible", 503


# ------------------------------------------------------------- validacion ---
CAMPOS_ENTERO = ("id_funcion", "id_espectador", "id_tipo_boleta", "cantidad")
CANALES = ("Taquilla", "Online")
METODOS = ("Efectivo", "Tarjeta", "Transferencia")


def validar_entrada(datos: dict) -> dict:
    if not isinstance(datos, dict):
        raise ErrorValidacion("El cuerpo de la peticion debe ser un objeto JSON")
    faltan = [c for c in (*CAMPOS_ENTERO, "canal_venta", "metodo_pago") if c not in datos]
    if faltan:
        raise ErrorValidacion("Faltan campos obligatorios", {"campos": faltan})
    limpio = {}
    for c in CAMPOS_ENTERO:
        v = datos[c]
        if isinstance(v, bool) or not isinstance(v, int) or v < 1:
            raise ErrorValidacion(f"{c} debe ser un entero positivo", {"campo": c})
        limpio[c] = v
    if not 1 <= limpio["cantidad"] <= 10:
        raise ErrorValidacion("cantidad debe estar entre 1 y 10", {"campo": "cantidad"})
    if datos["canal_venta"] not in CANALES:
        raise ErrorValidacion(f"canal_venta debe ser uno de {CANALES}", {"campo": "canal_venta"})
    if datos["metodo_pago"] not in METODOS:
        raise ErrorValidacion(f"metodo_pago debe ser uno de {METODOS}", {"campo": "metodo_pago"})
    limpio["canal_venta"], limpio["metodo_pago"] = datos["canal_venta"], datos["metodo_pago"]
    id_staff = datos.get("id_staff")
    if id_staff is not None and (isinstance(id_staff, bool) or not isinstance(id_staff, int) or id_staff < 1):
        raise ErrorValidacion("id_staff debe ser un entero positivo o null", {"campo": "id_staff"})
    # Misma regla que el CHECK de PostgreSQL: Online <=> sin taquillero
    if (limpio["canal_venta"] == "Online") != (id_staff is None):
        raise ErrorValidacion(
            "Las ventas Online no llevan id_staff y las de Taquilla si", {"campo": "id_staff"})
    if limpio["canal_venta"] == "Online" and limpio["metodo_pago"] == "Efectivo":
        raise ErrorValidacion("El efectivo solo aplica en taquilla", {"campo": "metodo_pago"})
    limpio["id_staff"] = id_staff
    return limpio


# ------------------------------------------------------------------- SQL ---
SQL_INSERTAR_VENTA = """
INSERT INTO ventas (id_funcion, id_espectador, id_tipo_boleta, id_staff,
                    cantidad, precio_unitario, canal_venta, metodo_pago)
SELECT %(id_funcion)s, %(id_espectador)s, tb.id_tipo_boleta, %(id_staff)s,
       %(cantidad)s, tb.precio, %(canal_venta)s, %(metodo_pago)s
FROM tipos_boleta tb
WHERE tb.id_tipo_boleta = %(id_tipo_boleta)s
RETURNING id_venta, precio_unitario, fecha_venta
"""

SQL_CONTEXTO = """
SELECT f.id_pelicula, f.id_sala, f.fecha_hora_inicio,
       p.titulo, s.nombre AS nombre_sala, e.puntos_acumulados
FROM funciones f
JOIN peliculas p ON p.id_pelicula = f.id_pelicula
JOIN salas s     ON s.id_sala = f.id_sala
JOIN espectadores e ON e.id_espectador = %(id_espectador)s
WHERE f.id_funcion = %(id_funcion)s
"""


def _como_decimal128(valor: Decimal) -> Decimal128:
    return Decimal128(valor)


# ---------------------------------------------------------- operacion ------
def registrar_venta_integrada(pg_conn: psycopg.Connection, mongo_db, datos: dict) -> dict:
    """Registra la venta en PostgreSQL y su comprobante en MongoDB.

    Devuelve un dict con lo que quedo en cada motor. Lanza ErrorIntegracion (o
    una subclase) si algo falla; en ese caso ninguno de los dos motores conserva
    la operacion a medias.
    """
    d = validar_entrada(datos)
    comprobante_id = ObjectId()      # se genera antes de escribir: permite compensar aunque
    mongo_intentado = False          # la respuesta de Mongo se pierda (borrado idempotente)
    resultado: dict = {}

    try:
        with pg_conn.transaction():                       # paso 1 y 3 (commit al salir)
            with pg_conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
                cur.execute(SQL_INSERTAR_VENTA, d)
                venta = cur.fetchone()
                if venta is None:
                    raise ErrorNoEncontrado(
                        f"El tipo de boleta {d['id_tipo_boleta']} no existe",
                        {"campo": "id_tipo_boleta"})
                cur.execute(SQL_CONTEXTO, d)
                ctx = cur.fetchone()
                if ctx is None:   # no deberia pasar: los FK ya lo habrian rechazado
                    raise ErrorNoEncontrado("No se encontro la funcion o el espectador")

            total = venta["precio_unitario"] * d["cantidad"]
            documento = {
                "_id": comprobante_id,
                "id_venta": venta["id_venta"],
                "id_funcion": d["id_funcion"],
                "id_pelicula": ctx["id_pelicula"],
                "id_sala": ctx["id_sala"],
                "id_espectador": d["id_espectador"],
                "id_tipo_boleta": d["id_tipo_boleta"],
                "id_staff": d["id_staff"],
                "canal_venta": d["canal_venta"],
                "metodo_pago": d["metodo_pago"],
                "cantidad": d["cantidad"],
                "precio_unitario": _como_decimal128(venta["precio_unitario"]),
                "total": _como_decimal128(total),
                "estado": "emitido",
                "titulo_pelicula": ctx["titulo"],
                "nombre_sala": ctx["nombre_sala"],
                "fecha_hora_funcion": ctx["fecha_hora_inicio"],
                "fecha_venta": venta["fecha_venta"],
                "creado_en": datetime.now(timezone.utc),
                "origen": "integracion-python",
            }
            try:                                          # paso 2: Mongo, con PG aun sin commit
                mongo_intentado = True
                coleccion_confirmada(mongo_db, COLECCION).insert_one(documento)
            except PyMongoError as e:
                # Al lanzar la excepcion se sale del bloque transaction() => ROLLBACK
                raise ErrorMongo(
                    "No se pudo guardar el comprobante en MongoDB; la venta fue revertida",
                    {"causa": type(e).__name__}) from e

            resultado = {
                "id_venta": venta["id_venta"],
                "total": total,
                "puntos_acumulados": ctx["puntos_acumulados"],
                "comprobante_id": str(comprobante_id),
                "titulo_pelicula": ctx["titulo"],
                "nombre_sala": ctx["nombre_sala"],
            }
        # aqui PostgreSQL ya hizo COMMIT (paso 3)
    except ErrorIntegracion:
        _compensar_si_hace_falta(mongo_db, comprobante_id, mongo_intentado)
        raise
    except pgerr.RaiseException as e:               # triggers: cupo, edad, funcion cancelada...
        _compensar_si_hace_falta(mongo_db, comprobante_id, mongo_intentado)
        raise ErrorNegocio(e.diag.message_primary) from e
    except pgerr.ForeignKeyViolation as e:
        _compensar_si_hace_falta(mongo_db, comprobante_id, mongo_intentado)
        raise ErrorNoEncontrado("La funcion, el espectador o el taquillero no existe",
                                {"detalle_bd": e.diag.message_detail}) from e
    except (pgerr.CheckViolation, pgerr.NotNullViolation) as e:
        _compensar_si_hace_falta(mongo_db, comprobante_id, mongo_intentado)
        raise ErrorValidacion("PostgreSQL rechazo los datos",
                              {"detalle_bd": e.diag.message_primary}) from e
    except psycopg.Error as e:                      # incluye fallo en el COMMIT
        _compensar_si_hace_falta(mongo_db, comprobante_id, mongo_intentado)
        raise ErrorPostgres("Error inesperado en PostgreSQL; la operacion fue revertida",
                            {"causa": type(e).__name__}) from e
    return resultado


def _compensar_si_hace_falta(mongo_db, comprobante_id, mongo_intentado: bool) -> None:
    """Paso de compensacion: si ya se intento escribir en Mongo y la operacion
    termino mal, se borra el comprobante. Si la compensacion tambien falla, se
    informa (queda un dato huerfano que hay que revisar)."""
    if not mongo_intentado:
        return
    try:
        compensar_comprobante(mongo_db, comprobante_id)
    except ErrorCompensacion as e:
        raise ErrorIntegracion(
            "La venta se revirtio pero no se pudo limpiar el comprobante en MongoDB",
            {"comprobante_id": str(comprobante_id)}) from e


def funcion_futura(pg_conn: psycopg.Connection) -> int:
    """Id de la proxima funcion programada que aun no empieza (para demos y pruebas).
    Si no hay ninguna, ejecutar funcion_para_demo.sql."""
    with pg_conn.cursor() as cur:
        cur.execute("""SELECT f.id_funcion FROM funciones f
                       WHERE f.estado = 'Programada' AND f.fecha_hora_inicio > now()
                       ORDER BY f.fecha_hora_inicio LIMIT 1""")
        fila = cur.fetchone()
    pg_conn.rollback()
    if fila is None:
        raise ErrorNoEncontrado("No hay funciones futuras; ejecutar funcion_para_demo.sql")
    return fila[0]
