"""Auditoria de consistencia entre PostgreSQL (ventas) y MongoDB (comprobantes_venta).

Solo LEE. PostgreSQL es la fuente de verdad; se compara por id_venta:
- ventas_sin_comprobante: ventas Pagadas creadas desde que existe la saga sin su comprobante.
- comprobantes_sin_venta: comprobantes cuyo id_venta no existe en PostgreSQL.
- comprobantes_de_ventas_anuladas: la venta esta Anulada pero el comprobante no quedo
  marcado como 'anulado' (por ejemplo, si Mongo fallo despues de anular).

Las ventas anteriores a la saga no tienen comprobante: se consideran historicas las ventas
con id_venta menor que el primer id_venta que tiene comprobante, y se devuelven aparte en
ventas_historicas_sin_comprobante sin contarlas como inconsistencia.
Si MongoDB no responde, el PyMongoError llega al manejador comun: 503 mongo_no_disponible.
"""
import psycopg
from fastapi import APIRouter, Depends

from .. import config as cfg
from ..dependencias import get_mongo, get_pg

router = APIRouter(tags=["auditoria"])

ESTADO_COMPROBANTE_ANULADO = "anulado"


@router.get("/auditoria/consistencia")
def consistencia(pg=Depends(get_pg), mongo=Depends(get_mongo)):
    """Compara las ventas de PostgreSQL con los comprobantes de MongoDB (solo lectura)."""
    comprobantes = list(mongo[cfg.COLECCION_COMPROBANTES].find(
        {}, {"_id": 0, "id_venta": 1, "estado": 1}))

    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute("SELECT id_venta, estado FROM ventas")
        ventas = {v["id_venta"]: v["estado"] for v in cur.fetchall()}
    pg.rollback()  # cierra la transaccion de lectura

    estado_comprobante = {c["id_venta"]: c.get("estado") for c in comprobantes if "id_venta" in c}
    pagadas = sorted(i for i, e in ventas.items() if e == cfg.ESTADO_VENTA_PAGADA)
    inicio_saga = min(estado_comprobante) if estado_comprobante else None

    sin_comprobante, historicas = [], []
    for id_venta in pagadas:
        if id_venta in estado_comprobante:
            continue
        if inicio_saga is None or id_venta < inicio_saga:
            historicas.append(id_venta)
        else:
            sin_comprobante.append(id_venta)

    sin_venta = sorted(i for i in estado_comprobante if i not in ventas)
    de_anuladas = sorted(
        i for i, e in estado_comprobante.items()
        if ventas.get(i) == cfg.ESTADO_VENTA_ANULADA and e != ESTADO_COMPROBANTE_ANULADO)

    return {
        "total_ventas_pagadas": len(pagadas),
        "total_comprobantes": len(comprobantes),
        "ventas_sin_comprobante": sin_comprobante,
        "comprobantes_sin_venta": sin_venta,
        "comprobantes_de_ventas_anuladas": de_anuladas,
        "ventas_historicas_sin_comprobante": historicas,
        "primer_id_venta_con_comprobante": inicio_saga,
        "consistente": not (sin_comprobante or sin_venta or de_anuladas),
    }
