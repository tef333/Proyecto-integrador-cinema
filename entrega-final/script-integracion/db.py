"""Conexiones a los dos motores del proyecto.

PostgreSQL (Neon)  -> nucleo transaccional (ventas, funciones, espectadores...)
MongoDB (Atlas)    -> capa documental (fichas, resenas, incidentes, comprobantes)

Las cadenas de conexion se leen de variables de entorno (archivo .env) para no
dejar claves en el repositorio.
"""
import os

import psycopg
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.write_concern import WriteConcern

load_dotenv()

_CLIENTE_MOCK = None  # una sola MongoDB en memoria por proceso (modo simulado)


class ErrorConfiguracion(Exception):
    """Falta una variable de entorno necesaria para conectarse."""


def _variable(nombre: str) -> str:
    valor = os.getenv(nombre)
    if not valor:
        raise ErrorConfiguracion(f"Falta la variable de entorno {nombre} (ver .env.example)")
    return valor


def conectar_postgres() -> psycopg.Connection:
    """Conexion a PostgreSQL con transacciones manuales (sin autocommit)."""
    return psycopg.connect(_variable("PG_DSN"), autocommit=False, connect_timeout=10)


def conectar_mongo():
    """Devuelve (cliente, base). Falla pronto si Atlas no responde.

    Modo simulado: con MONGO_URI=mock se usa una MongoDB en memoria (mongomock)
    para ver funcionar la API sin Atlas. Los datos se pierden al apagar el
    servidor y NO sirve para la sustentacion (alli se usa Atlas real)."""
    uri = _variable("MONGO_URI")
    if uri.strip().lower() == "mock":
        import mongomock
        global _CLIENTE_MOCK
        if _CLIENTE_MOCK is None:
            _CLIENTE_MOCK = mongomock.MongoClient()
        return _CLIENTE_MOCK, _CLIENTE_MOCK[os.getenv("MONGO_DB", "cinema_avance2")]
    cliente = MongoClient(uri, serverSelectionTimeoutMS=5000)
    base = cliente[os.getenv("MONGO_DB", "cinema_avance2")]
    cliente.admin.command("ping")
    return cliente, base


def coleccion_confirmada(base, nombre: str):
    """Coleccion con writeConcern 'majority': Mongo solo responde OK cuando la
    mayoria de los nodos del replica set ya guardo el documento. Es lo que
    permite tratar la escritura en Mongo como un paso confirmado de la
    transaccion cruzada (ver seccion CAP del informe)."""
    return base.get_collection(nombre, write_concern=WriteConcern(w="majority", wtimeout=5000))
