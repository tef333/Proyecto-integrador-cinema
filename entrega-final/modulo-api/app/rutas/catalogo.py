"""Catalogos de apoyo para el front: funciones a la venta y tipos de boleta."""
import psycopg
from fastapi import APIRouter, Depends

from ..dependencias import get_pg

router = APIRouter(tags=["catalogo"])


@router.get("/funciones")
def funciones_a_la_venta(pg=Depends(get_pg)):
    """Funciones programadas que aun no empiezan."""
    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute("""
            SELECT f.id_funcion, p.titulo, p.clasificacion, s.nombre AS sala, s.tipo_sala,
                   f.fecha_hora_inicio
            FROM funciones f
            JOIN peliculas p ON p.id_pelicula = f.id_pelicula
            JOIN salas s     ON s.id_sala = f.id_sala
            WHERE f.estado = 'Programada' AND f.fecha_hora_inicio > now()
            ORDER BY f.fecha_hora_inicio""")
        return cur.fetchall()


@router.get("/tipos-boleta")
def tipos_boleta(pg=Depends(get_pg)):
    with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute("SELECT id_tipo_boleta, nombre, precio FROM tipos_boleta WHERE activo ORDER BY precio")
        return cur.fetchall()
