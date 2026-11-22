"""Pruebas automaticas de la transaccion cruzada.

PostgreSQL: base real (la de pruebas o Neon) indicada en PG_DSN.
MongoDB:    se simula con mongomock para poder probar fallos sin depender de
            Atlas (para la demo real se usa demo.py).

Ejecutar:  pip install pytest mongomock  &&  pytest -v test_integracion.py
Cada prueba corre sobre la base y la deja como estaba (borra lo que crea).
"""
import os
from unittest import mock

import mongomock
import psycopg
import pytest
from pymongo.errors import AutoReconnect

import ventas_integradas as vi
from db import conectar_postgres

VENTA = {"id_funcion": None, "id_espectador": 1, "id_tipo_boleta": 1, "cantidad": 2,
         "id_staff": None, "canal_venta": "Online", "metodo_pago": "Tarjeta"}


@pytest.fixture
def pg():
    conn = conectar_postgres()
    VENTA["id_funcion"] = vi.funcion_futura(conn)      # funcion que aun no empieza
    with conn.cursor() as cur:
        cur.execute("SELECT coalesce(max(id_venta), 0) FROM ventas")
        base = cur.fetchone()[0]
        cur.execute("SELECT puntos_acumulados FROM espectadores WHERE id_espectador = 1")
        puntos = cur.fetchone()[0]
    conn.rollback()
    yield conn
    # limpieza con una conexion nueva (la de la prueba puede haber quedado rota)
    try:
        conn.close()
    except Exception:
        pass
    limpia = conectar_postgres()
    with limpia.cursor() as cur:
        cur.execute("DELETE FROM ventas WHERE id_venta > %s", (base,))
        cur.execute("UPDATE espectadores SET puntos_acumulados = %s WHERE id_espectador = 1", (puntos,))
    limpia.commit()
    limpia.close()


@pytest.fixture
def mongo():
    return mongomock.MongoClient()["cinema_avance2"]


def n_ventas(pg):
    with pg.cursor() as cur:
        cur.execute("SELECT count(*) FROM ventas")
        n = cur.fetchone()[0]
    pg.rollback()
    return n


def test_venta_exitosa_deja_ambos_motores_consistentes(pg, mongo):
    antes = n_ventas(pg)
    res = vi.registrar_venta_integrada(pg, mongo, VENTA)
    assert n_ventas(pg) == antes + 1
    doc = mongo.comprobantes_venta.find_one({"id_venta": res["id_venta"]})
    assert doc is not None
    assert doc["cantidad"] == 2 and doc["canal_venta"] == "Online"
    assert float(doc["total"].to_decimal()) == 36000.0       # 2 x 18000
    assert doc["titulo_pelicula"]                             # dato traido de PostgreSQL
    assert res["puntos_acumulados"] >= 0


def test_regla_de_negocio_no_escribe_en_ningun_motor(pg, mongo):
    antes = n_ventas(pg)
    with pytest.raises(vi.ErrorNegocio) as e:             # funcion 1 esta Finalizada
        vi.registrar_venta_integrada(pg, mongo, {**VENTA, "id_funcion": 1})
    assert e.value.estado_http == 409
    assert n_ventas(pg) == antes
    assert mongo.comprobantes_venta.count_documents({}) == 0


def test_funcion_inexistente_es_404(pg, mongo):
    with pytest.raises(vi.ErrorIntegracion) as e:
        vi.registrar_venta_integrada(pg, mongo, {**VENTA, "id_funcion": 99999})
    assert e.value.estado_http in (404, 409)
    assert mongo.comprobantes_venta.count_documents({}) == 0


def test_tipo_boleta_inexistente_es_404(pg, mongo):
    with pytest.raises(vi.ErrorNoEncontrado):
        vi.registrar_venta_integrada(pg, mongo, {**VENTA, "id_tipo_boleta": 999})


@pytest.mark.parametrize("cambio", [
    {"cantidad": 0}, {"cantidad": 11}, {"cantidad": "2"}, {"canal_venta": "Web"},
    {"metodo_pago": "Bitcoin"}, {"id_staff": 3},                  # Online con staff
    {"metodo_pago": "Efectivo"},                                  # efectivo online
])
def test_entradas_invalidas_son_422(pg, mongo, cambio):
    with pytest.raises(vi.ErrorValidacion) as e:
        vi.registrar_venta_integrada(pg, mongo, {**VENTA, **cambio})
    assert e.value.estado_http == 422


def test_campos_faltantes(pg, mongo):
    datos = dict(VENTA)
    del datos["id_funcion"]
    with pytest.raises(vi.ErrorValidacion) as e:
        vi.registrar_venta_integrada(pg, mongo, datos)
    assert "id_funcion" in e.value.detalle["campos"]


def test_fallo_de_mongo_revierte_la_venta_en_postgres(pg, mongo):
    antes = n_ventas(pg)
    with mock.patch("mongomock.collection.Collection.insert_one",
                    side_effect=AutoReconnect("Atlas no responde")):
        with pytest.raises(vi.ErrorMongo) as e:
            vi.registrar_venta_integrada(pg, mongo, VENTA)
    assert e.value.estado_http == 503
    assert n_ventas(pg) == antes                               # ROLLBACK
    assert mongo.comprobantes_venta.count_documents({}) == 0


@pytest.mark.skipif(
    "-pooler" in os.environ.get("PG_DSN", ""),   # db.py ya cargo el .env al importarse
    reason="el pooler de Neon oculta la caída de la conexión; correr con la cadena directa (sin -pooler)",
)
def test_fallo_en_commit_compensa_el_comprobante_de_mongo(pg, mongo):
    """Si PostgreSQL falla al confirmar, el comprobante ya guardado en Mongo se borra.

    El fallo es real: justo antes del COMMIT se cierra la conexion desde otra
    sesion (pg_terminate_backend), como si se cayera la red."""
    antes = n_ventas(pg)
    # El PID se pide al servidor: el proxy de Neon informa otro en info.backend_pid.
    pid = pg.execute("SELECT pg_backend_pid()").fetchone()[0]
    pg.rollback()
    original = psycopg.transaction.BaseTransaction._commit_gen

    def commit_con_conexion_caida(self):
        with conectar_postgres() as otra:
            otra.autocommit = True
            otra.execute("SELECT pg_terminate_backend(%s)", (pid,))
        yield from original(self)

    with mock.patch("psycopg.transaction.BaseTransaction._commit_gen", commit_con_conexion_caida):
        with pytest.raises(vi.ErrorPostgres):
            vi.registrar_venta_integrada(pg, mongo, VENTA)
    assert mongo.comprobantes_venta.count_documents({}) == 0   # compensado
    nueva = conectar_postgres()                                 # la venta no quedo en PostgreSQL
    with nueva.cursor() as cur:
        cur.execute("SELECT count(*) FROM ventas")
        assert cur.fetchone()[0] == antes
    nueva.close()


def test_no_se_duplica_el_comprobante_de_una_venta(pg, mongo):
    mongo.comprobantes_venta.create_index("id_venta", unique=True)
    res = vi.registrar_venta_integrada(pg, mongo, VENTA)
    assert mongo.comprobantes_venta.count_documents({"id_venta": res["id_venta"]}) == 1
