"""Pruebas de P4: resenas e incidentes (API sobre PostgreSQL + MongoDB).

Ejecutar:  python -m pytest tests/test_resenas_incidentes.py -v
Usa PG_DSN y MONGO_URI del .env. Con MONGO_URI=mock Mongo es en memoria (no toca Atlas); con Atlas real
las pruebas borran los documentos que crean (resenas con comentario 'test-p4...' e incidentes 'test-p4...').
mongomock no aplica el $jsonSchema: el error 121 se simula; con Atlas real se comprueba de verdad.
"""
import os
from unittest import mock

import pytest
from fastapi.testclient import TestClient
from pymongo.errors import AutoReconnect, WriteError

from app import config as cfg
from app.dependencias import get_mongo
from app.main import app
from db import conectar_postgres

cliente = TestClient(app, raise_server_exceptions=False)
MARCA = "test-p4"


def _metodo(nombre):
    """Ruta del metodo de coleccion a simular: mongomock con MONGO_URI=mock, pymongo con Atlas."""
    if os.getenv("MONGO_URI", "").strip().lower() == "mock":
        return f"mongomock.collection.Collection.{nombre}"
    return f"pymongo.collection.Collection.{nombre}"


def _pg(sql, params=None):
    with conectar_postgres() as c:
        return c.execute(sql, params).fetchall()


@pytest.fixture(scope="module")
def par_con_compra():
    """(funcion finalizada, espectador con venta pagada y boleta valida) sin resena previa."""
    filas = _pg(f"""SELECT v.id_funcion, v.id_espectador FROM ventas v JOIN funciones f USING (id_funcion)
                    WHERE f.estado='Finalizada' AND v.estado=%s
                      AND EXISTS (SELECT 1 FROM {cfg.T_BOLETAS} b WHERE b.id_venta=v.id_venta AND b.estado='Valida')
                    ORDER BY v.id_venta DESC LIMIT 1""", (cfg.ESTADO_VENTA_PAGADA,))
    assert filas, "No hay una compra pagada de una funcion finalizada"
    return filas[0]


@pytest.fixture(scope="module")
def par_sin_compra(par_con_compra):
    """Espectador que NO compro la funcion finalizada elegida."""
    fn = par_con_compra[0]
    filas = _pg("""SELECT id_espectador FROM espectadores e WHERE NOT EXISTS
                   (SELECT 1 FROM ventas v WHERE v.id_espectador=e.id_espectador AND v.id_funcion=%s) LIMIT 1""", (fn,))
    return fn, filas[0][0]


@pytest.fixture(autouse=True)
def limpiar():
    yield
    base = get_mongo()
    base[cfg.COLECCION_INCIDENTES].delete_many({"descripcion": {"$regex": MARCA}})
    base["resenas_peliculas"].delete_many({"comentario": {"$regex": MARCA}})


def _resena(fn, esp, **extra):
    return {"id_funcion": fn, "id_espectador": esp, "calificacion": 4,
            "comentario": f"{MARCA}: muy buena funcion", "recomendaria": True, **extra}


# ------------------------------------------------------------------ resenas
def test_resena_valida_se_guarda_con_pelicula_de_postgres(par_con_compra):
    fn, esp = par_con_compra
    r = cliente.post("/resenas", json=_resena(fn, esp, aspectos={"imagen": 5, "sonido": 4}))
    assert r.status_code == 201, r.text
    cuerpo = r.json()
    assert cuerpo["id_resena"] >= 1
    assert cuerpo["id_pelicula"] == _pg("SELECT id_pelicula FROM funciones WHERE id_funcion=%s", (fn,))[0][0]
    assert get_mongo()["resenas_peliculas"].count_documents({"id_resena": cuerpo["id_resena"]}) == 1


def test_resena_sin_compra_se_rechaza_409(par_sin_compra):
    fn, esp = par_sin_compra
    antes = get_mongo()["resenas_peliculas"].count_documents({})
    r = cliente.post("/resenas", json=_resena(fn, esp))
    assert r.status_code == 409
    assert r.json()["motivo"] == "resena_sin_compra"
    assert get_mongo()["resenas_peliculas"].count_documents({}) == antes    # nada se escribio


def test_resena_de_funcion_no_finalizada_409(par_con_compra):
    esp = par_con_compra[1]
    fn = _pg("SELECT id_funcion FROM funciones WHERE estado='Programada' LIMIT 1")[0][0]
    r = cliente.post("/resenas", json=_resena(fn, esp))
    assert r.status_code == 409 and r.json()["motivo"] == "funcion_no_finalizada"


def test_resena_repetida_409(par_con_compra):
    fn, esp = par_con_compra
    assert cliente.post("/resenas", json=_resena(fn, esp)).status_code == 201
    r = cliente.post("/resenas", json=_resena(fn, esp))
    assert r.status_code == 409 and r.json()["motivo"] == "resena_duplicada"


def test_indice_unico_de_mongo_se_traduce_a_409(par_con_compra):
    """Si el duplicado llega al indice unico (E11000) la API responde 409, no 500."""
    from pymongo.errors import DuplicateKeyError
    fn, esp = par_con_compra
    error = DuplicateKeyError("E11000 duplicate key", 11000,
                              {"keyPattern": {"id_espectador": 1, "id_funcion": 1}})
    with mock.patch(_metodo("insert_one"), side_effect=error):
        r = cliente.post("/resenas", json=_resena(fn, esp))
    assert r.status_code == 409
    assert r.json()["error"] == "documento_duplicado"
    assert r.json()["indice"] == ["id_espectador", "id_funcion"]


def test_error_121_de_mongo_se_traduce_a_422(par_con_compra):
    fn, esp = par_con_compra
    error = WriteError("Document failed validation", 121,
                       {"errInfo": {"details": {"operatorName": "$jsonSchema"}}})
    with mock.patch(_metodo("insert_one"), side_effect=error):
        r = cliente.post("/resenas", json={**_resena(fn, esp), "calificacion": 9})
    assert r.status_code == 422
    assert r.json()["error"] == "documento_invalido" and r.json()["codigo_mongo"] == 121


@pytest.mark.parametrize("cambio", [{"calificacion": "cinco"}, {"comentario": None}, {"id_funcion": 0},
                                    {"aspectos": {"imagen": "alta"}}])
def test_resena_con_forma_invalida_422(par_con_compra, cambio):
    fn, esp = par_con_compra
    r = cliente.post("/resenas", json={**_resena(fn, esp), **cambio})
    assert r.status_code == 422 and r.json()["error"] == "datos_invalidos"


def test_resena_funcion_o_espectador_inexistente_404(par_con_compra):
    fn, esp = par_con_compra
    assert cliente.post("/resenas", json=_resena(999999, esp)).status_code == 404
    assert cliente.post("/resenas", json=_resena(fn, 999999)).status_code == 404


def test_resena_con_mongo_caido_503(par_con_compra):
    fn, esp = par_con_compra
    with mock.patch(_metodo("find_one"), side_effect=AutoReconnect("caido")):
        r = cliente.post("/resenas", json=_resena(fn, esp))
    assert r.status_code == 503 and r.json()["error"] == "mongo_no_disponible"


# ---------------------------------------------------------------- incidentes
def _falla(**extra):
    return {"tipo": "falla_tecnica", "severidad": "alta", "descripcion": f"{MARCA}: proyector sin senal",
            "id_staff": 1, "id_sala": 1,
            "detalle_falla_tecnica": {"equipo": "Proyector 1", "codigo_error": "E-01",
                                      "minutos_interrupcion": 5, "funcion_cancelada": False}, **extra}


def test_incidente_valido_genera_codigo_y_cargo():
    r = cliente.post("/incidentes", json=_falla())
    assert r.status_code == 201, r.text
    c = r.json()
    assert c["codigo"].startswith("INC-") and c["estado"] == "abierto" and c["id_sala"] == 1
    assert c["reportado_por"]["cargo"] == _pg("SELECT cargo FROM staff WHERE id_staff=1")[0][0]


def test_incidente_con_funcion_toma_sala_y_pelicula_de_postgres():
    fn, sala, peli = _pg("SELECT id_funcion, id_sala, id_pelicula FROM funciones WHERE id_funcion=1")[0]
    cuerpo = _falla(id_funcion=fn)
    cuerpo.pop("id_sala")
    r = cliente.post("/incidentes", json=cuerpo)
    assert r.status_code == 201
    assert (r.json()["id_sala"], r.json()["id_pelicula"]) == (sala, peli)


def test_incidente_sala_incoherente_con_la_funcion_422():
    fn, sala = _pg("SELECT id_funcion, id_sala FROM funciones WHERE id_funcion=1")[0]
    otra = _pg("SELECT id_sala FROM salas WHERE id_sala <> %s LIMIT 1", (sala,))[0][0]
    r = cliente.post("/incidentes", json=_falla(id_funcion=fn, id_sala=otra))
    assert r.status_code == 422 and r.json()["campos"][0]["campo"] == "id_sala"


def test_incidente_referencias_inexistentes_404():
    assert cliente.post("/incidentes", json=_falla(id_staff=999999)).status_code == 404
    assert cliente.post("/incidentes", json=_falla(id_sala=999999)).status_code == 404
    assert cliente.post("/incidentes", json=_falla(id_funcion=999999, id_sala=None)).status_code == 404


def test_incidente_sin_el_detalle_de_su_tipo_422():
    cuerpo = _falla()
    cuerpo.pop("detalle_falla_tecnica")
    r = cliente.post("/incidentes", json=cuerpo)
    assert r.status_code == 422 and r.json()["error"] == "datos_invalidos"


def test_incidente_con_detalle_de_otro_tipo_422():
    cuerpo = _falla(detalle_queja={"id_espectador": 1, "categoria": "atencion", "canal": "web"})
    assert cliente.post("/incidentes", json=cuerpo).status_code == 422


def test_incidente_error_121_de_mongo_a_422():
    error = WriteError("Document failed validation", 121, {"errInfo": {"details": {}}})
    with mock.patch(_metodo("insert_one"), side_effect=error):
        r = cliente.post("/incidentes", json=_falla(severidad="gravisima"))
    assert r.status_code == 422 and r.json()["codigo_mongo"] == 121


def test_incidentes_de_una_sala_incluyen_el_recien_creado():
    cod = cliente.post("/incidentes", json=_falla()).json()["codigo"]
    r = cliente.get("/salas/1/incidentes", params={"severidad_minima": "alta"})
    assert r.status_code == 200
    assert cod in [i["codigo"] for i in r.json()["incidentes"]]
    assert cliente.get("/salas/999999/incidentes").status_code == 404


def test_catalogos_para_el_front():
    assert cliente.get("/funciones/finalizadas").json()
    assert cliente.get("/salas").json()
    assert cliente.get("/staff").json()
