"""Cartelera: funciones que se pueden comprar (solo lectura sobre PostgreSQL) y detalle de pelicula."""
from datetime import date
from typing import Optional

import psycopg
from fastapi import APIRouter, Depends, Query

from .. import config as cfg
from ..dependencias import get_pg
from ventas_integradas import ErrorNoEncontrado

router = APIRouter(tags=["cartelera"])


@router.get("/cartelera")
def cartelera(
    fecha: Optional[date] = Query(None, description="Solo funciones de ese dia (AAAA-MM-DD)"),
    id_pelicula: Optional[int] = Query(None, ge=1, description="Solo funciones de esa pelicula"),
    pg=Depends(get_pg),
):
    """Funciones Programadas que aun no empiezan, con sillas disponibles = capacidad - boletas Validas.

    Errores: 422 si un filtro viene mal escrito (fecha invalida, id no numerico) · 503 si PostgreSQL no responde."""
    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute(f"""
            SELECT f.id_funcion, f.fecha_hora_inicio, f.idioma,
                   p.id_pelicula, p.titulo, p.genero, p.clasificacion, p.duracion_min,
                   s.nombre AS sala, s.tipo_sala, s.capacidad,
                   s.capacidad - COUNT(b.id_asiento) AS sillas_disponibles
            FROM funciones f
            JOIN peliculas p ON p.id_pelicula = f.id_pelicula
            JOIN salas s     ON s.id_sala = f.id_sala
            LEFT JOIN {cfg.T_BOLETAS} b ON b.id_funcion = f.id_funcion AND b.estado = 'Valida'
            WHERE f.estado = 'Programada' AND f.fecha_hora_inicio > now()
              AND (%(fecha)s::date IS NULL OR f.fecha_hora_inicio::date = %(fecha)s::date)
              AND (%(pel)s::int IS NULL OR f.id_pelicula = %(pel)s::int)
            GROUP BY f.id_funcion, p.id_pelicula, s.id_sala
            ORDER BY f.fecha_hora_inicio, f.id_funcion""", {"fecha": fecha, "pel": id_pelicula})
        filas = cur.fetchall()
    pg.rollback()
    return filas


@router.get("/peliculas/{id_pelicula}")
def detalle_pelicula(id_pelicula: int, pg=Depends(get_pg)):
    """Detalle de una pelicula. 404 si no existe."""
    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute("""SELECT id_pelicula, titulo, genero, clasificacion, duracion_min
                       FROM peliculas WHERE id_pelicula = %s""", (id_pelicula,))
        fila = cur.fetchone()
    pg.rollback()
    if not fila:
        raise ErrorNoEncontrado(f"La pelicula {id_pelicula} no existe")
    return fila
