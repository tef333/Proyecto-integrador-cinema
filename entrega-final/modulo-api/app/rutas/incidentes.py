"""Incidentes por sala (P4). El incidente vive en MongoDB (esquema variable por tipo); PostgreSQL valida
que el taquillero, la sala, la funcion y el espectador existan y sean coherentes entre si."""
from datetime import datetime, timezone
from typing import Literal, Optional

import psycopg
from fastapi import APIRouter, Depends, Path, Query
from pymongo.errors import DuplicateKeyError

from .. import config as cfg
from ..dependencias import get_mongo, get_pg
from ..schemas_p4 import IncidenteIn
from db import coleccion_confirmada
from ventas_integradas import ErrorNoEncontrado, ErrorValidacion

router = APIRouter(tags=["incidentes"])

SEVERIDADES = ["baja", "media", "alta", "critica"]
REINTENTOS_CODIGO = 5


def _uno(cur, sql, params):
    cur.execute(sql, params)
    return cur.fetchone()


def validar_incidente_contra_postgres(pg, inc: IncidenteIn) -> dict:
    """Comprueba referencias y coherencia sala/funcion. Devuelve cargo, id_sala e id_pelicula resueltos."""
    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        staff = _uno(cur, "SELECT cargo FROM staff WHERE id_staff = %s", (inc.id_staff,))
        if staff is None:
            raise ErrorNoEncontrado(f"El empleado {inc.id_staff} no existe")
        id_sala, id_pelicula = inc.id_sala, None
        if inc.id_sala is not None and _uno(cur, "SELECT 1 FROM salas WHERE id_sala = %s", (inc.id_sala,)) is None:
            raise ErrorNoEncontrado(f"La sala {inc.id_sala} no existe")
        if inc.id_funcion is not None:
            f = _uno(cur, "SELECT id_sala, id_pelicula FROM funciones WHERE id_funcion = %s", (inc.id_funcion,))
            if f is None:
                raise ErrorNoEncontrado(f"La funcion {inc.id_funcion} no existe")
            if inc.id_sala is not None and inc.id_sala != f["id_sala"]:
                raise ErrorValidacion(
                    f"La funcion {inc.id_funcion} se proyecta en la sala {f['id_sala']}, no en la {inc.id_sala}",
                    {"campos": [{"campo": "id_sala", "motivo": "no coincide con la sala de la funcion"}]})
            id_sala, id_pelicula = f["id_sala"], f["id_pelicula"]
        if inc.detalle_queja is not None and _uno(
                cur, "SELECT 1 FROM espectadores WHERE id_espectador = %s", (inc.detalle_queja.id_espectador,)) is None:
            raise ErrorNoEncontrado(f"El espectador {inc.detalle_queja.id_espectador} no existe")
    pg.rollback()
    return {"cargo": staff["cargo"], "id_sala": id_sala, "id_pelicula": id_pelicula}


def _siguiente_codigo(col) -> str:
    numeros = [int(c[4:]) for c in col.distinct("codigo") if c[4:].isdigit()]
    return f"INC-{(max(numeros) if numeros else 0) + 1:03d}"


@router.post("/incidentes", status_code=201)
def crear_incidente(inc: IncidenteIn, pg=Depends(get_pg), mongo=Depends(get_mongo)):
    """Registra un incidente en MongoDB (w=majority) con codigo INC-nnn.
    404 empleado/sala/funcion/espectador inexistente · 422 forma invalida, sala que no corresponde a la
    funcion o $jsonSchema de MongoDB incumplido (error 121) · 409 codigo repetido (indice unico) · 503 Mongo caido."""
    ref = validar_incidente_contra_postgres(pg, inc)
    ahora = datetime.now(timezone.utc)
    cuando = inc.fecha_hora or ahora
    if cuando.tzinfo is None:
        cuando = cuando.replace(tzinfo=timezone.utc)
    doc = {
        "tipo": inc.tipo, "fecha_hora": cuando, "severidad": inc.severidad, "estado": "abierto",
        "descripcion": inc.descripcion,
        "reportado_por": {"id_staff": inc.id_staff, "cargo": ref["cargo"]},
        "acciones": [{"fecha": ahora, "responsable_id_staff": inc.id_staff, "accion": "Incidente reportado"}],
        "actualizado_en": ahora,
    }
    if inc.id_funcion is not None:
        doc["id_funcion"], doc["id_pelicula"] = inc.id_funcion, ref["id_pelicula"]
    if ref["id_sala"] is not None:
        doc["id_sala"] = ref["id_sala"]
    for campo in ("detalle_falla_tecnica", "detalle_queja", "detalle_seguridad"):
        valor = getattr(inc, campo)
        if valor is not None:
            doc[campo] = valor.model_dump(exclude_none=True)

    col = coleccion_confirmada(mongo, cfg.COLECCION_INCIDENTES)
    for intento in range(REINTENTOS_CODIGO):
        doc["codigo"] = _siguiente_codigo(col)
        try:
            col.insert_one(dict(doc))
            break
        except DuplicateKeyError as e:
            patron = (e.details or {}).get("keyPattern") or {}
            if (patron and "codigo" not in patron) or intento == REINTENTOS_CODIGO - 1:
                raise
    return doc


@router.get("/salas")
def salas(pg=Depends(get_pg)):
    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute("SELECT id_sala, nombre, tipo_sala, estado FROM salas ORDER BY id_sala")
        filas = cur.fetchall()
    pg.rollback()
    return filas


@router.get("/staff")
def staff(pg=Depends(get_pg)):
    """Empleados activos (para elegir quien reporta un incidente)."""
    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute("SELECT id_staff, nombres || ' ' || apellidos AS nombre, cargo FROM staff "
                    "WHERE estado = 'Activo' ORDER BY id_staff")
        filas = cur.fetchall()
    pg.rollback()
    return filas


@router.get("/salas/{id_sala}/incidentes")
def incidentes_de_sala(
    id_sala: int = Path(ge=1),
    severidad_minima: Literal["baja", "media", "alta", "critica"] = "baja",
    estado: Optional[Literal["abierto", "en_revision", "resuelto", "cerrado"]] = None,
    pg=Depends(get_pg),
    mongo=Depends(get_mongo),
):
    """Incidentes de una sala (MongoDB) con los datos de la sala (PostgreSQL), mas recientes primero."""
    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        sala = _uno(cur, "SELECT id_sala, nombre, tipo_sala, estado FROM salas WHERE id_sala = %s", (id_sala,))
    pg.rollback()
    if sala is None:
        raise ErrorNoEncontrado(f"La sala {id_sala} no existe")
    filtro = {"id_sala": id_sala, "severidad": {"$in": SEVERIDADES[SEVERIDADES.index(severidad_minima):]}}
    if estado:
        filtro["estado"] = estado
    incidentes = list(mongo[cfg.COLECCION_INCIDENTES].find(filtro, {"_id": 0}).sort("fecha_hora", -1).limit(100))
    return {"sala": sala, "total": len(incidentes), "incidentes": incidentes}
