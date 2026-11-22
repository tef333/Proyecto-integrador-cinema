"""Mapa de sillas de una funcion."""
import psycopg
from fastapi import APIRouter, Depends, Path

from .. import config as cfg
from ..dependencias import get_pg
from ventas_integradas import ErrorNoEncontrado

router = APIRouter(tags=["sillas"])

SQL_SILLAS = f"""
SELECT a.id_asiento, a.fila, a.numero, a.tipo,
       (a.estado = 'Bloqueado')    AS bloqueada,
       (b.id_asiento IS NOT NULL)  AS ocupada
FROM funciones f
JOIN {cfg.T_ASIENTOS} a ON a.id_sala = f.id_sala
LEFT JOIN (
    SELECT b.id_asiento
    FROM {cfg.T_BOLETAS} b
    JOIN ventas v ON v.id_venta = b.id_venta AND v.estado = %(pagada)s
    WHERE b.id_funcion = %(f)s AND b.estado = 'Valida'
) b ON b.id_asiento = a.id_asiento
WHERE f.id_funcion = %(f)s
ORDER BY a.fila, a.numero
"""


@router.get("/funciones/{id_funcion}/sillas")
def sillas_de_la_funcion(id_funcion: int = Path(ge=1), pg=Depends(get_pg)):
    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute("SELECT estado, id_sala FROM funciones WHERE id_funcion = %s", (id_funcion,))
        funcion = cur.fetchone()
        if funcion is None:
            raise ErrorNoEncontrado(f"La funcion {id_funcion} no existe")
        cur.execute(SQL_SILLAS, {"f": id_funcion, "pagada": cfg.ESTADO_VENTA_PAGADA})
        sillas = cur.fetchall()
    ocupadas = sum(1 for s in sillas if s["ocupada"])
    bloqueadas = sum(1 for s in sillas if s["bloqueada"] and not s["ocupada"])
    return {
        "id_funcion": id_funcion,
        "estado_funcion": funcion["estado"],
        "total": len(sillas),
        "ocupadas": ocupadas,
        "bloqueadas": bloqueadas,
        "disponibles": len(sillas) - ocupadas - bloqueadas,
        "sillas": sillas,
    }
