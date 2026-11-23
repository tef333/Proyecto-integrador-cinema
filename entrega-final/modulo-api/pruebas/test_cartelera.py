"""Pruebas de la cartelera: GET /cartelera y GET /peliculas/{id}.

Ejecutar:  python -m pytest tests/test_cartelera.py -v   (usa PG_DSN del .env; solo lectura)
"""
from unittest import mock

import psycopg
from fastapi.testclient import TestClient

from app import config as cfg
from app.main import app
from db import conectar_postgres

cliente = TestClient(app, raise_server_exceptions=False)


def _pg(sql, params=None):
    with conectar_postgres() as c:
        return c.execute(sql, params).fetchall()


def test_cartelera_solo_programadas_futuras_con_sillas_correctas():
    r = cliente.get("/cartelera")
    assert r.status_code == 200
    filas = r.json()
    esperadas = {f[0] for f in _pg("SELECT id_funcion FROM funciones WHERE estado='Programada' AND fecha_hora_inicio > now()")}
    assert {f["id_funcion"] for f in filas} == esperadas
    for f in filas[:5]:
        ocupadas = _pg(f"SELECT count(*) FROM {cfg.T_BOLETAS} WHERE id_funcion=%s AND estado='Valida'", (f["id_funcion"],))[0][0]
        assert f["sillas_disponibles"] == f["capacidad"] - ocupadas
        assert {"titulo", "genero", "clasificacion", "duracion_min", "sala", "tipo_sala", "capacidad", "idioma"} <= f.keys()


def test_filtro_por_fecha_y_pelicula():
    todas = cliente.get("/cartelera").json()
    assert todas, "No hay funciones programadas para probar"
    dia = todas[0]["fecha_hora_inicio"][:10]
    r = cliente.get("/cartelera", params={"fecha": dia})
    assert r.status_code == 200 and r.json()
    assert all(f["fecha_hora_inicio"].startswith(dia) for f in r.json())
    pel = todas[0]["id_pelicula"]
    r = cliente.get("/cartelera", params={"id_pelicula": pel})
    assert r.status_code == 200 and all(f["id_pelicula"] == pel for f in r.json())


def test_filtros_mal_escritos_dan_422():
    assert cliente.get("/cartelera", params={"fecha": "2026-13-45"}).status_code == 422
    assert cliente.get("/cartelera", params={"id_pelicula": "abc"}).status_code == 422
    assert cliente.get("/cartelera", params={"id_pelicula": 0}).status_code == 422


def test_sin_resultados_devuelve_lista_vacia():
    r = cliente.get("/cartelera", params={"fecha": "2000-01-01"})
    assert r.status_code == 200 and r.json() == []


def test_detalle_pelicula_y_404():
    r = cliente.get("/peliculas/10")
    assert r.status_code == 200 and r.json()["id_pelicula"] == 10
    r = cliente.get("/peliculas/999999")
    assert r.status_code == 404 and r.json()["error"] == "no_encontrado"


def test_postgres_caido_da_503():
    with mock.patch("app.dependencias.conectar_postgres", side_effect=psycopg.OperationalError("caido")):
        r = cliente.get("/cartelera")
    assert r.status_code == 503 and r.json()["error"] == "postgres_no_disponible"
