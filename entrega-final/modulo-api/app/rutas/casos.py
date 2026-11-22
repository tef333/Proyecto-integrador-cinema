"""Caso de uso 3: cruce de ventas (PostgreSQL) con incidentes (MongoDB) por sala."""
from datetime import date, datetime, time, timedelta
from typing import Literal, Optional

import psycopg
from fastapi import APIRouter, Depends, Query
from pymongo.errors import PyMongoError

from .. import config as cfg
from ..dependencias import get_mongo, get_pg
from ventas_integradas import ErrorValidacion

router = APIRouter(tags=["casos de uso"])

SEVERIDADES = ["baja", "media", "alta", "critica"]

SQL_VENTAS_POR_SALA = """
SELECT s.id_sala, s.nombre AS sala, s.tipo_sala,
       COUNT(DISTINCT v.id_venta)                      AS ventas,
       COALESCE(SUM(v.cantidad), 0)                    AS boletas,
       COALESCE(SUM(v.cantidad * v.precio_unitario), 0) AS ingresos
FROM salas s
LEFT JOIN funciones f ON f.id_sala = s.id_sala
                     AND f.fecha_hora_inicio >= %(desde)s AND f.fecha_hora_inicio < %(hasta)s
LEFT JOIN ventas v    ON v.id_funcion = f.id_funcion AND v.estado = %(pagada)s
GROUP BY s.id_sala, s.nombre, s.tipo_sala
ORDER BY s.id_sala
"""


def _pipeline(desde: datetime, hasta: datetime, severidad_minima: str, tipo: Optional[str]) -> list:
    niveles = SEVERIDADES[SEVERIDADES.index(severidad_minima):]
    filtro = {"fecha_hora": {"$gte": desde, "$lt": hasta},
              "id_sala": {"$exists": True}, "severidad": {"$in": niveles}}
    if tipo:
        filtro["tipo"] = tipo
    return [
        {"$match": filtro},
        {"$group": {
            "_id": "$id_sala",
            "incidentes": {"$sum": 1},
            "criticos": {"$sum": {"$cond": [{"$eq": ["$severidad", "critica"]}, 1, 0]}},
            "sin_resolver": {"$sum": {"$cond": [{"$in": ["$estado", ["abierto", "en_revision"]]}, 1, 0]}},
            "tipos": {"$addToSet": "$tipo"},
        }},
    ]


@router.get("/casos/3/ventas-con-incidentes")
def ventas_con_incidentes(
    desde: date = Query(description="inicio del periodo (AAAA-MM-DD)"),
    hasta: date = Query(description="fin del periodo, inclusive"),
    severidad_minima: Literal["baja", "media", "alta", "critica"] = "baja",
    tipo: Optional[Literal["falla_tecnica", "queja_servicio", "incidente_seguridad"]] = None,
    solo_con_incidentes: bool = False,
    pg=Depends(get_pg),
    mongo=Depends(get_mongo),
):
    """Por sala: ventas e ingresos de las funciones del periodo (PostgreSQL) junto con los
    incidentes reportados en ese periodo (MongoDB). Si MongoDB no responde se devuelve la
    parte de PostgreSQL con `mongo_disponible: false` (se prefiere disponibilidad)."""
    if desde > hasta:
        raise ErrorValidacion("'desde' no puede ser posterior a 'hasta'", {"campo": "desde"})
    ini = datetime.combine(desde, time.min)
    fin = datetime.combine(hasta + timedelta(days=1), time.min)

    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute(SQL_VENTAS_POR_SALA, {"desde": ini, "hasta": fin, "pagada": cfg.ESTADO_VENTA_PAGADA})
        salas = cur.fetchall()
    pg.rollback()

    mongo_ok, aviso, por_sala = True, None, {}
    try:
        for g in mongo[cfg.COLECCION_INCIDENTES].aggregate(_pipeline(ini, fin, severidad_minima, tipo)):
            por_sala[g["_id"]] = g
    except PyMongoError as e:
        mongo_ok = False
        aviso = f"MongoDB no respondio ({type(e).__name__}); se muestran solo las ventas"

    resultado = []
    for s in salas:
        inc = por_sala.get(s["id_sala"])
        fila = dict(s)
        if mongo_ok:
            fila["incidentes"] = inc["incidentes"] if inc else 0
            fila["incidentes_criticos"] = inc["criticos"] if inc else 0
            fila["incidentes_sin_resolver"] = inc["sin_resolver"] if inc else 0
            fila["tipos_incidente"] = sorted(inc["tipos"]) if inc else []
            fila["incidentes_por_100_boletas"] = (
                round(fila["incidentes"] * 100 / s["boletas"], 2) if s["boletas"] else None)
            if solo_con_incidentes and fila["incidentes"] == 0:
                continue
        resultado.append(fila)
    if mongo_ok:
        resultado.sort(key=lambda f: (-f["incidentes"], f["id_sala"]))

    return {"periodo": {"desde": desde, "hasta": hasta},
            "filtros": {"severidad_minima": severidad_minima, "tipo": tipo},
            "mongo_disponible": mongo_ok, "advertencia": aviso, "salas": resultado}
