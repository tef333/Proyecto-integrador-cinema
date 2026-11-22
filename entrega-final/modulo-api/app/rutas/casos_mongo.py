"""Casos de uso 1 y 2 (P4): cruce de PostgreSQL con MongoDB. Las consultas viven en
script-integracion/consultas_casos.py (las mismas que usa el script de integracion)."""
import psycopg
from fastapi import APIRouter, Depends, Query

from ..dependencias import get_mongo, get_pg
from consultas_casos import NoEncontrado, caso1_funcion_con_resenas, caso2_pelicula_con_requisitos
from ventas_integradas import ErrorNoEncontrado

router = APIRouter(tags=["casos de uso"])


@router.get("/casos/1/funcion-con-resenas")
def caso1(id_funcion: int = Query(ge=1), limite: int = Query(default=20, ge=1, le=100),
          pg=Depends(get_pg), mongo=Depends(get_mongo)):
    """Funcion (PostgreSQL) con el resumen de sus resenas y las resenas mas recientes (MongoDB).
    Si MongoDB no responde se devuelve la funcion con `mongo_disponible: false`."""
    try:
        return caso1_funcion_con_resenas(pg, mongo, id_funcion, limite)
    except NoEncontrado as e:
        raise ErrorNoEncontrado(str(e))


@router.get("/casos/2/pelicula-con-requisitos")
def caso2(id_pelicula: int = Query(ge=1), pg=Depends(get_pg), mongo=Depends(get_mongo)):
    """Pelicula y sus funciones (PostgreSQL) con los requisitos tecnicos de cada una (MongoDB)."""
    try:
        return caso2_pelicula_con_requisitos(pg, mongo, id_pelicula)
    except NoEncontrado as e:
        raise ErrorNoEncontrado(str(e))


@router.get("/peliculas")
def peliculas(pg=Depends(get_pg)):
    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute("SELECT id_pelicula, titulo FROM peliculas ORDER BY titulo")
        filas = cur.fetchall()
    pg.rollback()
    return filas
