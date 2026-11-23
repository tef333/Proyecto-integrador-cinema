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

Migracion final (06_migracion_final.sql)
----------------------------------------
Si la base tiene la tabla boletas, en el paso 1 tambien se guarda la
idempotency_key en la venta y se inserta una boleta por silla (las sillas de
ids_asiento o, si no vienen, sillas libres asignadas automaticamente). Un
trigger diferido exige al COMMIT exactamente 'cantidad' boletas validas.
Sin la migracion, la venta se registra como antes (sin sillas).

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


class ErrorSillaOcupada(ErrorNegocio):
    """Alguna silla ya tiene una boleta valida para esa funcion."""
    codigo = "silla_ocupada"


class ErrorClaveRepetida(ErrorNegocio):
    """La idempotency_key ya se uso en otra venta."""
    codigo = "clave_repetida"


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


def _validar_ids_asiento(ids) -> list[int] | None:
    if ids is None:
        return None
    if not isinstance(ids, list) or not 1 <= len(ids) <= 10:
        raise ErrorValidacion("ids_asiento debe ser una lista de 1 a 10 sillas", {"campo": "ids_asiento"})
    if any(isinstance(i, bool) or not isinstance(i, int) or i < 1 for i in ids):
        raise ErrorValidacion("ids_asiento debe contener enteros positivos", {"campo": "ids_asiento"})
    if len(set(ids)) != len(ids):
        raise ErrorValidacion("ids_asiento no puede repetir sillas", {"campo": "ids_asiento"})
    return list(ids)


def _validar_idempotency_key(clave) -> str | None:
    if clave is None:
        return None
    if not isinstance(clave, str) or not 8 <= len(clave) <= 64:
        raise ErrorValidacion("idempotency_key debe ser un texto de 8 a 64 caracteres",
                              {"campo": "idempotency_key"})
    return clave


def validar_entrada(datos: dict) -> dict:
    if not isinstance(datos, dict):
        raise ErrorValidacion("El cuerpo de la peticion debe ser un objeto JSON")
    ids_asiento = _validar_ids_asiento(datos.get("ids_asiento"))
    if ids_asiento is not None and "cantidad" not in datos:
        datos = {**datos, "cantidad": len(ids_asiento)}       # una boleta por silla
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
    if ids_asiento is not None and limpio["cantidad"] != len(ids_asiento):
        raise ErrorValidacion("cantidad debe ser igual al numero de sillas en ids_asiento",
                              {"campo": "cantidad"})
    limpio["ids_asiento"] = ids_asiento
    limpio["idempotency_key"] = _validar_idempotency_key(datos.get("idempotency_key"))
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
RETURNING id_venta, precio_unitario, fecha_venta, estado
"""

# Con la migracion final: la venta guarda la idempotency_key (UNIQUE; NULL si no vino).
SQL_INSERTAR_VENTA_MIGRADA = """
INSERT INTO ventas (id_funcion, id_espectador, id_tipo_boleta, id_staff,
                    cantidad, precio_unitario, canal_venta, metodo_pago, idempotency_key)
SELECT %(id_funcion)s, %(id_espectador)s, tb.id_tipo_boleta, %(id_staff)s,
       %(cantidad)s, tb.precio, %(canal_venta)s, %(metodo_pago)s, %(idempotency_key)s
FROM tipos_boleta tb
WHERE tb.id_tipo_boleta = %(id_tipo_boleta)s
RETURNING id_venta, precio_unitario, fecha_venta, estado
"""

# Venta ya registrada con esa idempotency_key (para devolverla en vez de duplicarla).
SQL_VENTA_POR_CLAVE = """
SELECT v.id_venta, v.estado, v.cantidad, v.precio_unitario,
       p.titulo, s.nombre AS nombre_sala, e.puntos_acumulados,
       (SELECT array_agg(b.id_asiento ORDER BY b.id_boleta)
        FROM boletas b WHERE b.id_venta = v.id_venta) AS ids_asiento
FROM ventas v
JOIN funciones f    ON f.id_funcion = v.id_funcion
JOIN peliculas p    ON p.id_pelicula = f.id_pelicula
JOIN salas s        ON s.id_sala = f.id_sala
JOIN espectadores e ON e.id_espectador = v.id_espectador
WHERE v.idempotency_key = %s
"""

MENSAJE_REPETIDA = "Esta idempotency_key ya genero la venta; no se duplico."

SQL_HAY_MIGRACION = "SELECT to_regclass('public.boletas') IS NOT NULL AS migrada"

# Sillas libres de la sala de la funcion: activas y sin boleta valida para esa funcion.
# Primero las del tipo que pide la boleta (VIP para el tipo 'VIP', Estandar para los
# demas); en la sala VIP todas son VIP. SKIP LOCKED: dos compras simultaneas no
# eligen la misma silla.
SQL_SILLAS_LIBRES = """
SELECT a.id_asiento
FROM funciones f
JOIN asientos a ON a.id_sala = f.id_sala
WHERE f.id_funcion = %(id_funcion)s
  AND a.estado = 'Activo'
  AND NOT EXISTS (SELECT 1 FROM boletas b
                  WHERE b.id_funcion = f.id_funcion
                    AND b.id_asiento = a.id_asiento
                    AND b.estado = 'Valida')
ORDER BY (a.tipo <> (SELECT CASE WHEN tb.nombre = 'VIP' THEN 'VIP' ELSE 'Estandar' END
                     FROM tipos_boleta tb WHERE tb.id_tipo_boleta = %(id_tipo_boleta)s)),
         a.fila, a.numero
LIMIT %(cantidad)s
FOR UPDATE OF a SKIP LOCKED
"""

SQL_INSERTAR_BOLETAS = """
INSERT INTO boletas (id_venta, id_funcion, id_asiento)
SELECT %s, %s, unnest(%s::int[])
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
                cur.execute(SQL_HAY_MIGRACION)
                migrada = cur.fetchone()["migrada"]
                cur.execute(SQL_INSERTAR_VENTA_MIGRADA if migrada else SQL_INSERTAR_VENTA, d)
                venta = cur.fetchone()
                if venta is None:
                    raise ErrorNoEncontrado(
                        f"El tipo de boleta {d['id_tipo_boleta']} no existe",
                        {"campo": "id_tipo_boleta"})
                cur.execute(SQL_CONTEXTO, d)
                ctx = cur.fetchone()
                if ctx is None:   # no deberia pasar: los FK ya lo habrian rechazado
                    raise ErrorNoEncontrado("No se encontro la funcion o el espectador")
                ids_asiento = d["ids_asiento"]
                if migrada:       # boletas en la misma transaccion, antes de tocar Mongo
                    if ids_asiento is None:
                        cur.execute(SQL_SILLAS_LIBRES, d)
                        ids_asiento = [fila["id_asiento"] for fila in cur.fetchall()]
                        if len(ids_asiento) < d["cantidad"]:
                            raise ErrorNegocio(
                                f"No hay {d['cantidad']} sillas libres para la funcion {d['id_funcion']}",
                                {"sillas_libres": len(ids_asiento)})
                    cur.execute(SQL_INSERTAR_BOLETAS,
                                (venta["id_venta"], d["id_funcion"], ids_asiento))

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
            if ids_asiento is not None:
                documento["ids_asiento"] = ids_asiento
            if d["idempotency_key"] is not None:
                documento["idempotency_key"] = d["idempotency_key"]
            try:                                        # paso 2: Mongo, con PG aun sin commit
                mongo_intentado = True
                coleccion_confirmada(mongo_db, COLECCION).insert_one(documento)
            except PyMongoError as e:
                # Al lanzar la excepcion se sale del bloque transaction() => ROLLBACK
                raise ErrorMongo(
                    "No se pudo guardar el comprobante en MongoDB; la venta fue revertida",
                    {"causa": type(e).__name__}) from e

            resultado = {
                "repetida": False,
                "id_venta": venta["id_venta"],
                "estado": venta["estado"],
                "total": total,
                "puntos_acumulados": ctx["puntos_acumulados"],
                "comprobante_id": str(comprobante_id),
                "titulo_pelicula": ctx["titulo"],
                "nombre_sala": ctx["nombre_sala"],
                "ids_asiento": ids_asiento,
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
    except pgerr.UniqueViolation as e:
        # Ocurre en los INSERT del paso 1 (antes de Mongo); la transaccion ya se revirtio.
        _compensar_si_hace_falta(mongo_db, comprobante_id, mongo_intentado)
        restriccion = e.diag.constraint_name or ""
        if "idempot" in restriccion and d["idempotency_key"] is not None:
            # Misma clave (reintento o peticion simultanea): se devuelve la venta original.
            previa = _venta_por_clave(pg_conn, mongo_db, d["idempotency_key"])
            if previa is not None:
                return previa
            raise ErrorClaveRepetida("Esa idempotency_key ya fue usada en otra venta",
                                     {"restriccion": restriccion}) from e
        raise ErrorSillaOcupada("Una de las sillas ya fue vendida para esta funcion",
                                {"restriccion": restriccion,
                                 "ids_asiento": d["ids_asiento"]}) from e
    except psycopg.Error as e:                     # incluye fallo en el COMMIT
        _compensar_si_hace_falta(mongo_db, comprobante_id, mongo_intentado)
        raise ErrorPostgres("Error inesperado en PostgreSQL; la operacion fue revertida",
                            {"causa": type(e).__name__}) from e
    return resultado


def _venta_por_clave(pg_conn: psycopg.Connection, mongo_db, clave: str) -> dict | None:
    """Venta ya registrada con esa idempotency_key, en el mismo formato que una venta
    nueva mas 'repetida': True (como responde la API a una clave existente). Solo lee:
    no escribe nada en PostgreSQL ni en MongoDB."""
    try:
        pg_conn.rollback()
        with pg_conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
            cur.execute(SQL_VENTA_POR_CLAVE, (clave,))
            v = cur.fetchone()
        pg_conn.rollback()
    except psycopg.Error as e:
        raise ErrorPostgres("Error inesperado en PostgreSQL al buscar la venta original",
                            {"causa": type(e).__name__}) from e
    if v is None:
        return None
    try:
        doc = mongo_db[COLECCION].find_one({"id_venta": v["id_venta"]}, {"_id": 1})
        comprobante_id = str(doc["_id"]) if doc else None
    except PyMongoError:
        comprobante_id = None        # lectura opcional: la venta ya existe en PostgreSQL
    return {
        "repetida": True,
        "id_venta": v["id_venta"],
        "estado": v["estado"],
        "mensaje": MENSAJE_REPETIDA,
        "total": v["precio_unitario"] * v["cantidad"],
        "puntos_acumulados": v["puntos_acumulados"],
        "comprobante_id": comprobante_id,
        "titulo_pelicula": v["titulo"],
        "nombre_sala": v["nombre_sala"],
        "ids_asiento": v["ids_asiento"],
    }


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
