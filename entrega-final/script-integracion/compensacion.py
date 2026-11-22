"""Compensacion de la transaccion cruzada.

PostgreSQL y MongoDB no comparten un motor de transacciones, asi que no hay
un COMMIT unico para los dos. La operacion se coordina como una saga corta
(ver ventas_integradas.py): si un paso falla, se deshacen los anteriores.

Este modulo contiene el paso que deshace la escritura en MongoDB.

Responsable de extenderlo: Estefania (compensacion y casos de error).
Version minima actual: borrar por _id, que es idempotente (borrar dos veces
no hace dano). Pendiente de mejorar:
  - reintentos con espera si Atlas no responde,
  - bitacora de compensaciones que no se pudieron completar (para revisarlas
    a mano o reprocesarlas),
  - marcar el comprobante como 'anulado' en vez de borrarlo, si se prefiere
    conservar rastro.
"""
from pymongo.errors import PyMongoError

from db import coleccion_confirmada

COLECCION = "comprobantes_venta"


class ErrorCompensacion(Exception):
    """No se pudo deshacer la escritura en MongoDB; queda un dato huerfano."""


def compensar_comprobante(base, comprobante_id) -> bool:
    """Elimina el comprobante creado en MongoDB. Devuelve True si existia y se
    borro, False si no habia nada que borrar (por ejemplo, la escritura nunca
    llego a guardarse)."""
    try:
        res = coleccion_confirmada(base, COLECCION).delete_one({"_id": comprobante_id})
    except PyMongoError as e:
        raise ErrorCompensacion(
            f"No se pudo compensar el comprobante {comprobante_id}: {e}"
        ) from e
    return res.deleted_count == 1
