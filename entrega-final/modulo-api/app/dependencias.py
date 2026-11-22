"""Conexiones por peticion. Todo el acceso a los motores pasa por aqui: cuando Espin
deje listos los pools (db.py), solo se cambia este archivo."""
from functools import lru_cache

from . import config  # noqa: F401  (agrega script-integracion al path)
from db import conectar_mongo, conectar_postgres


def get_pg():
    conn = conectar_postgres()
    try:
        yield conn
    finally:
        conn.close()


@lru_cache(maxsize=1)
def _mongo():
    return conectar_mongo()


def get_mongo():
    """Base de MongoDB (cliente reutilizado entre peticiones)."""
    _, base = _mongo()
    return base


def reiniciar_mongo():
    """Descarta el cliente cacheado (util tras un fallo de red)."""
    _mongo.cache_clear()
