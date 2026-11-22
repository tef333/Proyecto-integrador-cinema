"""Traduccion de errores a respuestas HTTP uniformes:
{"error": codigo, "mensaje": texto, "request_id": id, ...detalle}

409 = conflicto con el estado/reglas del negocio (silla ocupada, sin cupo, funcion cancelada)
422 = datos invalidos (validacion de la peticion o CHECK de PostgreSQL)
404 = no existe   503 = un motor no responde   500 = error inesperado (sin filtrar detalles)
"""
import logging

import psycopg
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from psycopg import errors as pgerr
from pymongo.errors import DuplicateKeyError, PyMongoError, WriteError

from . import config  # noqa: F401
from db import ErrorConfiguracion
from ventas_integradas import ErrorIntegracion

log = logging.getLogger("modulo-api")


def _resp(request: Request, estado: int, codigo: str, mensaje: str, **detalle) -> JSONResponse:
    cuerpo = {"error": codigo, "mensaje": mensaje, **detalle}
    rid = getattr(request.state, "request_id", None)
    if rid:
        cuerpo["request_id"] = rid
    return JSONResponse(status_code=estado, content=cuerpo)


def _recortar(info, limite=600):
    """Detalle del validador de MongoDB, acotado para no devolver respuestas enormes."""
    texto = str(info)
    return texto if len(texto) <= limite else texto[:limite] + "..."


def registrar_manejadores(app: FastAPI) -> None:
    @app.exception_handler(ErrorIntegracion)
    async def _integracion(request: Request, e: ErrorIntegracion):
        return _resp(request, e.estado_http, e.codigo, e.mensaje, **e.detalle)

    @app.exception_handler(RequestValidationError)
    async def _validacion(request: Request, e: RequestValidationError):
        campos = [{"campo": ".".join(str(p) for p in err["loc"] if p != "body"),
                   "motivo": err["msg"]} for err in e.errors()]
        return _resp(request, 422, "datos_invalidos", "La peticion no cumple el formato esperado",
                     campos=campos)

    @app.exception_handler(pgerr.RaiseException)       # triggers del negocio
    async def _trigger(request: Request, e: pgerr.RaiseException):
        msg = e.diag.message_primary or "Regla de negocio violada"
        if "no existe" in msg:
            return _resp(request, 404, "no_encontrado", msg)
        return _resp(request, 409, "regla_de_negocio", msg)

    @app.exception_handler(pgerr.UniqueViolation)
    async def _unico(request: Request, e: pgerr.UniqueViolation):
        restr = e.diag.constraint_name or ""
        if "idempot" in restr:
            return _resp(request, 409, "clave_repetida", "Esa idempotency_key ya fue usada en otra venta")
        return _resp(request, 409, "silla_ocupada", "Una de las sillas ya fue vendida para esta funcion",
                     restriccion=restr)

    @app.exception_handler(pgerr.ForeignKeyViolation)
    async def _fk(request: Request, e: pgerr.ForeignKeyViolation):
        return _resp(request, 422, "referencia_invalida", "Una referencia (funcion, silla, espectador...) no existe",
                     detalle_bd=e.diag.message_detail)

    @app.exception_handler(pgerr.CheckViolation)
    @app.exception_handler(pgerr.NotNullViolation)
    async def _check(request: Request, e: psycopg.Error):
        return _resp(request, 422, "datos_invalidos", "PostgreSQL rechazo los datos",
                     detalle_bd=e.diag.message_primary)

    @app.exception_handler(psycopg.OperationalError)
    async def _pg_caido(request: Request, e: psycopg.OperationalError):
        return _resp(request, 503, "postgres_no_disponible", "PostgreSQL no responde, intente de nuevo")

    @app.exception_handler(DuplicateKeyError)         # indice unico de MongoDB (E11000)
    async def _mongo_duplicado(request: Request, e: DuplicateKeyError):
        patron = (e.details or {}).get("keyPattern") or {}
        return _resp(request, 409, "documento_duplicado",
                     "Ya existe un documento con esos datos (indice unico de MongoDB)",
                     indice=sorted(patron) or None)

    @app.exception_handler(WriteError)                # $jsonSchema incumplido = codigo 121
    async def _mongo_escritura(request: Request, e: WriteError):
        if e.code == 121:
            info = (e.details or {}).get("errInfo", {}).get("details", {})
            return _resp(request, 422, "documento_invalido",
                         "MongoDB rechazo el documento: no cumple el esquema de la coleccion (error 121)",
                         codigo_mongo=121, detalle_bd=_recortar(info))
        log.error("WriteError de MongoDB no controlado: %s", e)
        return _resp(request, 500, "error_interno", "Error interno; avise al equipo con el request_id")

    @app.exception_handler(PyMongoError)
    async def _mongo_caido(request: Request, e: PyMongoError):
        return _resp(request, 503, "mongo_no_disponible", "MongoDB no responde", causa=type(e).__name__)

    @app.exception_handler(ErrorConfiguracion)
    async def _config(request: Request, e: ErrorConfiguracion):
        return _resp(request, 503, "configuracion_incompleta", str(e))

    @app.exception_handler(Exception)
    async def _inesperado(request: Request, e: Exception):
        log.exception("Error no controlado [%s]", getattr(request.state, "request_id", "-"))
        return _resp(request, 500, "error_interno", "Error interno; avise al equipo con el request_id")
