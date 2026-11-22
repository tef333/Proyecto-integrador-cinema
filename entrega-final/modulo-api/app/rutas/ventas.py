"""Comprar y anular. La compra delega en la saga de Espin (PostgreSQL -> Mongo -> commit);
la anulacion es la operacion inversa: PostgreSQL manda y Mongo se actualiza despues."""
from datetime import datetime, timezone

import psycopg
from fastapi import APIRouter, Depends, Path
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError

from .. import config as cfg
from ..dependencias import get_mongo, get_pg
from ..schemas import CompraIn
from ventas_integradas import ErrorNegocio, ErrorNoEncontrado, registrar_venta_integrada

router = APIRouter(tags=["ventas"])


@router.post("/ventas", status_code=201)
def comprar(compra: CompraIn, pg=Depends(get_pg), mongo=Depends(get_mongo)):
    """Registra la venta (PostgreSQL) y su comprobante (MongoDB) como una sola operacion.
    Si se repite la idempotency_key devuelve la venta original con 200 en vez de duplicarla."""
    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute(f"SELECT id_venta, estado FROM ventas WHERE {cfg.COL_IDEMPOTENCIA} = %s",
                    (compra.idempotency_key,))
        previa = cur.fetchone()
    pg.rollback()
    if previa:
        return JSONResponse(status_code=200, content={
            "repetida": True, "id_venta": previa["id_venta"], "estado": previa["estado"],
            "mensaje": "Esta idempotency_key ya genero la venta; no se duplico."})

    datos = compra.model_dump()
    datos["cantidad"] = len(compra.ids_asiento)
    return registrar_venta_integrada(pg, mongo, datos)


@router.post("/ventas/{id_venta}/anular")
def anular(id_venta: int = Path(ge=1), pg=Depends(get_pg), mongo=Depends(get_mongo)):
    """Anula una venta pagada: libera las sillas (PostgreSQL) y marca el comprobante
    como 'anulado' en MongoDB. PostgreSQL es la fuente de verdad; si Mongo falla despues
    del commit la anulacion SE MANTIENE y se avisa (consistencia eventual del comprobante)."""
    with pg.transaction():
        with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
            cur.execute("SELECT estado FROM ventas WHERE id_venta = %s FOR UPDATE", (id_venta,))
            venta = cur.fetchone()
            if venta is None:
                raise ErrorNoEncontrado(f"La venta {id_venta} no existe")
            if venta["estado"] != cfg.ESTADO_VENTA_PAGADA:
                raise ErrorNegocio(
                    f"La venta {id_venta} esta {venta['estado']}; solo se anulan ventas pagadas",
                    {"estado_actual": venta["estado"]})
            cur.execute(f"DELETE FROM {cfg.T_BOLETAS} WHERE id_venta = %s", (id_venta,))
            cur.execute("UPDATE ventas SET estado = %s WHERE id_venta = %s",
                        (cfg.ESTADO_VENTA_ANULADA, id_venta))
    respuesta = {"id_venta": id_venta, "estado": cfg.ESTADO_VENTA_ANULADA, "comprobante": "anulado"}
    try:
        mongo[cfg.COLECCION_COMPROBANTES].update_many(
            {"id_venta": id_venta},
            {"$set": {"estado": "anulado", "anulado_en": datetime.now(timezone.utc)}})
    except PyMongoError as e:
        respuesta["comprobante"] = "pendiente"
        respuesta["advertencia"] = ("La venta quedo anulada en PostgreSQL pero no se pudo marcar "
                                    f"el comprobante en MongoDB ({type(e).__name__}); revisar con /auditoria/consistencia")
    return respuesta
