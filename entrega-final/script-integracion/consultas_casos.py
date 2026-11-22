"""Consultas de los casos de uso 1 y 2 (responsable: Santiago Rojas, P4).

Fuente unica: las usan la API (modulo-api) y el script casos_de_uso.py. Los pipelines son los mismos
de casos_1_y_2.js (para ejecutarlos a mano en mongosh o Compass).

  Caso 1: funcion con sus resenas        -> PostgreSQL (funcion) + MongoDB resenas_peliculas
  Caso 2: pelicula con requisitos tecnicos -> PostgreSQL (pelicula, funciones) + MongoDB requisitos_proyeccion

Cada funcion devuelve datos listos para serializar; si MongoDB no responde se devuelve la parte de
PostgreSQL con mongo_disponible=False (se prefiere disponibilidad, igual que el caso 3).
"""
import psycopg
from pymongo.errors import PyMongoError

COLECCION_RESENAS = "resenas_peliculas"
COLECCION_REQUISITOS = "requisitos_proyeccion"


class NoEncontrado(Exception):
    """La funcion o la pelicula no existe en PostgreSQL."""


# ---------------------------------------------------------------- SQL (PostgreSQL)
SQL_FUNCION = """
SELECT f.id_funcion, f.id_pelicula, p.titulo, p.genero, p.clasificacion,
       s.id_sala, s.nombre AS sala, s.tipo_sala, f.idioma, f.fecha_hora_inicio, f.estado
FROM funciones f
JOIN peliculas p ON p.id_pelicula = f.id_pelicula
JOIN salas s     ON s.id_sala = f.id_sala
WHERE f.id_funcion = %(id)s
"""

SQL_PELICULA = """
SELECT id_pelicula, titulo, genero, clasificacion, duracion_min
FROM peliculas WHERE id_pelicula = %(id)s
"""

SQL_FUNCIONES_DE_PELICULA = """
SELECT f.id_funcion, s.id_sala, s.nombre AS sala, s.tipo_sala, f.idioma,
       f.fecha_hora_inicio, f.estado
FROM funciones f
JOIN salas s ON s.id_sala = f.id_sala
WHERE f.id_pelicula = %(id)s
ORDER BY f.fecha_hora_inicio
"""


# ---------------------------------------------------------------- pipelines (MongoDB)
def pipeline_resumen_resenas(id_funcion: int) -> list:
    """Caso 1: total, promedio, recomendaciones, sin respuesta y promedio por aspecto."""
    return [
        {"$match": {"id_funcion": id_funcion}},
        {"$group": {
            "_id": "$id_funcion",
            "total_resenas": {"$sum": 1},
            "calificacion_promedio": {"$avg": "$calificacion"},
            "recomendarian": {"$sum": {"$cond": [{"$eq": ["$recomendaria", True]}, 1, 0]}},
            "no_recomendarian": {"$sum": {"$cond": [{"$eq": ["$recomendaria", False]}, 1, 0]}},
            "respondidas": {"$sum": {"$cond": [{"$ifNull": ["$respuesta_empresa", False]}, 1, 0]}},
            "imagen": {"$avg": "$aspectos.imagen"},
            "sonido": {"$avg": "$aspectos.sonido"},
            "comodidad": {"$avg": "$aspectos.comodidad"},
            "servicio": {"$avg": "$aspectos.servicio"},
            "ultima_resena": {"$max": "$fecha"},
        }},
        {"$project": {
            "_id": 0,
            "id_funcion": "$_id",
            "total_resenas": 1,
            "calificacion_promedio": 1,
            "recomendarian": 1,
            "no_recomendarian": 1,
            "sin_respuesta": {"$subtract": ["$total_resenas", "$respondidas"]},
            "aspectos_promedio": {"imagen": "$imagen", "sonido": "$sonido",
                                  "comodidad": "$comodidad", "servicio": "$servicio"},
            "ultima_resena": 1,
        }},
    ]


def filtro_resenas(id_funcion: int) -> dict:
    return {"id_funcion": id_funcion}


def _checklist_pendiente():
    return {"$filter": {"input": "$checklist", "as": "i",
                        "cond": {"$and": [{"$eq": ["$$i.obligatorio", True]},
                                          {"$eq": ["$$i.cumplido", False]}]}}}


def pipeline_requisitos_pelicula(id_pelicula: int) -> list:
    """Caso 2: por funcion, requisitos tecnicos y items obligatorios del checklist sin cumplir."""
    return [
        {"$match": {"id_pelicula": id_pelicula}},
        {"$project": {
            "_id": 0, "id_funcion": 1, "id_sala": 1, "titulo_pelicula": 1, "formato_sala": 1,
            "proyeccion": {"resolucion": "$proyeccion.resolucion",
                           "relacion_aspecto": "$proyeccion.relacion_aspecto",
                           "fps": "$proyeccion.fps", "tipo_proyector": "$proyeccion.tipo_proyector"},
            "audio": {"formato": "$audio.formato", "idioma": "$audio.idioma",
                      "subtitulos": "$audio.subtitulos"},
            "requisitos_3d": 1, "requisitos_imax": 1, "requisitos_vip": 1, "ensayo_tecnico": 1,
            "llave_kdm": {"requerida": "$llave_kdm.requerida", "valida_hasta": "$llave_kdm.valida_hasta"},
            "pendientes": {"$map": {"input": _checklist_pendiente(), "as": "p", "in": "$$p.item"}},
            "total_pendientes": {"$size": _checklist_pendiente()},
        }},
        {"$sort": {"id_funcion": 1}},
    ]


# ---------------------------------------------------------------- caso 1
def caso1_funcion_con_resenas(pg, mongo, id_funcion: int, limite: int = 20) -> dict:
    """Datos de la funcion (PostgreSQL) + resumen y resenas (MongoDB)."""
    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute(SQL_FUNCION, {"id": id_funcion})
        funcion = cur.fetchone()
    pg.rollback()
    if funcion is None:
        raise NoEncontrado(f"La funcion {id_funcion} no existe")

    salida = {"funcion": funcion, "mongo_disponible": True, "advertencia": None,
              "resumen": None, "resenas": []}
    try:
        col = mongo[COLECCION_RESENAS]
        resumen = list(col.aggregate(pipeline_resumen_resenas(id_funcion)))
        if resumen:
            r = resumen[0]
            r["calificacion_promedio"] = _redondear(r["calificacion_promedio"])
            r["aspectos_promedio"] = {k: _redondear(v) for k, v in r["aspectos_promedio"].items()}
            salida["resumen"] = r
        salida["resenas"] = list(col.find(filtro_resenas(id_funcion), {"_id": 0})
                                 .sort("fecha", -1).limit(limite))
    except PyMongoError as e:
        salida["mongo_disponible"] = False
        salida["advertencia"] = f"MongoDB no respondio ({type(e).__name__}); se muestra solo la funcion"
    return salida


# ---------------------------------------------------------------- caso 2
def caso2_pelicula_con_requisitos(pg, mongo, id_pelicula: int) -> dict:
    """Pelicula y sus funciones (PostgreSQL) + requisitos tecnicos por funcion (MongoDB)."""
    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute(SQL_PELICULA, {"id": id_pelicula})
        pelicula = cur.fetchone()
        if pelicula is not None:
            cur.execute(SQL_FUNCIONES_DE_PELICULA, {"id": id_pelicula})
            funciones = cur.fetchall()
    pg.rollback()
    if pelicula is None:
        raise NoEncontrado(f"La pelicula {id_pelicula} no existe")

    salida = {"pelicula": pelicula, "mongo_disponible": True, "advertencia": None, "funciones": []}
    requisitos = {}
    try:
        for doc in mongo[COLECCION_REQUISITOS].aggregate(pipeline_requisitos_pelicula(id_pelicula)):
            requisitos[doc["id_funcion"]] = doc
    except PyMongoError as e:
        salida["mongo_disponible"] = False
        salida["advertencia"] = f"MongoDB no respondio ({type(e).__name__}); se muestran solo las funciones"
    for f in funciones:
        fila = dict(f)
        if salida["mongo_disponible"]:
            req = requisitos.get(f["id_funcion"])
            fila["requisitos"] = {k: v for k, v in req.items()
                                  if k not in ("id_funcion", "id_sala", "titulo_pelicula")} if req else None
        salida["funciones"].append(fila)
    return salida


def _redondear(valor):
    return None if valor is None else round(float(valor), 2)
