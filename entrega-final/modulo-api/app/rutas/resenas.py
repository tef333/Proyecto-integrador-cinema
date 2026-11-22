"""Resenas de funciones (P4). La resena vive en MongoDB; las reglas se validan contra PostgreSQL:
la funcion debe estar finalizada y el espectador debe tener una venta pagada con boleta valida para ella."""
from datetime import datetime, timezone

import psycopg
from fastapi import APIRouter, Depends
from pymongo.errors import DuplicateKeyError

from .. import config as cfg
from ..dependencias import get_mongo, get_pg
from ..schemas_p4 import ResenaIn
from db import coleccion_confirmada
from ventas_integradas import ErrorNegocio, ErrorNoEncontrado

router = APIRouter(tags=["resenas"])

COLECCION = "resenas_peliculas"
REINTENTOS_ID = 5


def validar_resena_contra_postgres(pg, id_funcion: int, id_espectador: int) -> dict:
    """Devuelve la funcion (con id_pelicula) o lanza 404 / 409. Solo lee."""
    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute("SELECT id_funcion, id_pelicula, estado FROM funciones WHERE id_funcion = %s", (id_funcion,))
        funcion = cur.fetchone()
        cur.execute("SELECT 1 FROM espectadores WHERE id_espectador = %s", (id_espectador,))
        espectador = cur.fetchone()
        compro = False
        if funcion and espectador:
            cur.execute(f"""
                SELECT EXISTS (
                    SELECT 1 FROM ventas v
                    WHERE v.id_funcion = %s AND v.id_espectador = %s AND v.estado = %s
                      AND EXISTS (SELECT 1 FROM {cfg.T_BOLETAS} b
                                  WHERE b.id_venta = v.id_venta AND b.estado = 'Valida')
                ) AS compro""", (id_funcion, id_espectador, cfg.ESTADO_VENTA_PAGADA))
            compro = cur.fetchone()["compro"]
    pg.rollback()
    if funcion is None:
        raise ErrorNoEncontrado(f"La funcion {id_funcion} no existe")
    if espectador is None:
        raise ErrorNoEncontrado(f"El espectador {id_espectador} no existe")
    if funcion["estado"] != "Finalizada":
        raise ErrorNegocio(
            f"Solo se reseñan funciones finalizadas; la funcion {id_funcion} esta {funcion['estado']}",
            {"motivo": "funcion_no_finalizada", "estado_funcion": funcion["estado"]})
    if not compro:
        raise ErrorNegocio(
            f"El espectador {id_espectador} no tiene una compra pagada para la funcion {id_funcion}; "
            "no puede reseñarla",
            {"motivo": "resena_sin_compra"})
    return funcion


@router.post("/resenas", status_code=201)
def crear_resena(resena: ResenaIn, pg=Depends(get_pg), mongo=Depends(get_mongo)):
    """Registra una resena en MongoDB (w=majority).
    404 funcion/espectador inexistente · 409 sin compra, funcion no finalizada o resena repetida
    (indice unico) · 422 forma invalida o $jsonSchema de MongoDB incumplido (error 121) · 503 Mongo caido."""
    funcion = validar_resena_contra_postgres(pg, resena.id_funcion, resena.id_espectador)
    col = coleccion_confirmada(mongo, COLECCION)

    if col.find_one({"id_funcion": resena.id_funcion, "id_espectador": resena.id_espectador}, {"_id": 1}):
        raise ErrorNegocio("Este espectador ya reseño esta funcion", {"motivo": "resena_duplicada"})

    doc = {
        "id_pelicula": funcion["id_pelicula"],     # se toma de PostgreSQL, no del cliente
        "id_funcion": resena.id_funcion,
        "id_espectador": resena.id_espectador,
        "calificacion": resena.calificacion,
        "comentario": resena.comentario,
        "fecha": datetime.now(timezone.utc),
    }
    if resena.recomendaria is not None:
        doc["recomendaria"] = resena.recomendaria
    if resena.etiquetas:
        doc["etiquetas"] = resena.etiquetas
    if resena.aspectos:
        aspectos = resena.aspectos.model_dump(exclude_none=True)
        if aspectos:
            doc["aspectos"] = aspectos

    for intento in range(REINTENTOS_ID):
        ultimo = col.find_one({}, {"id_resena": 1}, sort=[("id_resena", -1)])
        doc["id_resena"] = (ultimo["id_resena"] if ultimo else 0) + 1
        try:
            col.insert_one(dict(doc))
            break
        except DuplicateKeyError as e:
            patron = (e.details or {}).get("keyPattern") or {}
            if (patron and "id_resena" not in patron) or intento == REINTENTOS_ID - 1:
                raise                           # duplicado de otro indice: lo traduce el manejador (409)
            # dos resenas simultaneas tomaron el mismo id_resena: se reintenta con el siguiente
    return doc


@router.get("/funciones/finalizadas")
def funciones_finalizadas(pg=Depends(get_pg)):
    """Funciones que ya se proyectaron (las unicas que se pueden reseñar)."""
    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute("""
            SELECT f.id_funcion, p.titulo, s.nombre AS sala, f.fecha_hora_inicio
            FROM funciones f JOIN peliculas p USING (id_pelicula) JOIN salas s USING (id_sala)
            WHERE f.estado = 'Finalizada' ORDER BY f.fecha_hora_inicio DESC LIMIT 200""")
        filas = cur.fetchall()
    pg.rollback()
    return filas
