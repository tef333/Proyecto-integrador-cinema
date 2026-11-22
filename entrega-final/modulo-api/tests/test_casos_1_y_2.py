"""Pruebas de P4: casos de uso 1 y 2 (API sobre PostgreSQL + MongoDB).

Ejecutar:  python -m pytest tests/test_casos_1_y_2.py -v
Usa PG_DSN y MONGO_URI del .env. Con MONGO_URI=mock Mongo es en memoria (no toca Atlas); con Atlas real
las pruebas insertan y borran sus propios documentos (resenas 9001 y 9002, requisitos con titulo 'x').
"""
import os
from datetime import datetime, timezone
from unittest import mock

import pytest
from fastapi.testclient import TestClient
from pymongo.errors import AutoReconnect

from app.dependencias import get_mongo
from app.main import app

cliente = TestClient(app, raise_server_exceptions=False)
MARCA = "test-p4"


def _metodo(nombre):
    """Ruta del metodo de coleccion a simular: mongomock con MONGO_URI=mock, pymongo con Atlas."""
    if os.getenv("MONGO_URI", "").strip().lower() == "mock":
        return f"mongomock.collection.Collection.{nombre}"
    return f"pymongo.collection.Collection.{nombre}"


# ------------------------------------------------------- casos de uso 1 y 2
@pytest.fixture
def datos_mongo():
    base = get_mongo()
    ahora = datetime.now(timezone.utc)
    base["resenas_peliculas"].insert_many([
        {"id_resena": 9001, "id_pelicula": 1, "id_funcion": 1, "id_espectador": 1, "calificacion": 5,
         "comentario": f"{MARCA} a", "fecha": ahora, "recomendaria": True, "aspectos": {"imagen": 5, "sonido": 3},
         "respuesta_empresa": {"id_staff": 1, "fecha": ahora, "texto": "gracias"}},
        {"id_resena": 9002, "id_pelicula": 1, "id_funcion": 1, "id_espectador": 2, "calificacion": 2,
         "comentario": f"{MARCA} b", "fecha": ahora, "recomendaria": False, "aspectos": {"imagen": 3}}])
    base["requisitos_proyeccion"].insert_one({
        "id_funcion": 1, "id_pelicula": 1, "id_sala": 1, "titulo_pelicula": "x", "formato_sala": "2D",
        "proyeccion": {"resolucion": "4K", "relacion_aspecto": "2.39:1", "fps": 24, "tipo_proyector": "Láser"},
        "audio": {"formato": "5.1", "idioma": "Español", "subtitulos": "Ninguno"},
        "llave_kdm": {"requerida": True, "valida_hasta": ahora},
        "checklist": [{"item": "KDM cargada", "obligatorio": True, "cumplido": False},
                      {"item": "Limpieza", "obligatorio": True, "cumplido": True},
                      {"item": "Extra", "obligatorio": False, "cumplido": False}]})
    yield
    base["resenas_peliculas"].delete_many({"id_resena": {"$in": [9001, 9002]}})
    base["requisitos_proyeccion"].delete_many({"titulo_pelicula": "x"})


def test_caso1_resumen_y_resenas(datos_mongo):
    r = cliente.get("/casos/1/funcion-con-resenas", params={"id_funcion": 1})
    assert r.status_code == 200, r.text
    c = r.json()
    res = c["resumen"]
    assert c["funcion"]["id_funcion"] == 1 and c["funcion"]["titulo"]
    assert res["total_resenas"] == 2 and res["calificacion_promedio"] == 3.5
    assert (res["recomendarian"], res["no_recomendarian"], res["sin_respuesta"]) == (1, 1, 1)
    assert res["aspectos_promedio"]["imagen"] == 4.0 and res["aspectos_promedio"]["servicio"] is None
    assert len(c["resenas"]) == 2


def test_caso1_funcion_inexistente_404():
    assert cliente.get("/casos/1/funcion-con-resenas", params={"id_funcion": 999999}).status_code == 404


def test_caso1_con_mongo_caido_devuelve_la_funcion():
    with mock.patch(_metodo("aggregate"), side_effect=AutoReconnect("caido")):
        r = cliente.get("/casos/1/funcion-con-resenas", params={"id_funcion": 1})
    assert r.status_code == 200
    assert r.json()["mongo_disponible"] is False and r.json()["funcion"]["id_funcion"] == 1


def test_caso2_requisitos_y_pendientes(datos_mongo):
    r = cliente.get("/casos/2/pelicula-con-requisitos", params={"id_pelicula": 1})
    assert r.status_code == 200, r.text
    c = r.json()
    f1 = next(f for f in c["funciones"] if f["id_funcion"] == 1)
    assert c["pelicula"]["id_pelicula"] == 1
    assert f1["requisitos"]["pendientes"] == ["KDM cargada"] and f1["requisitos"]["total_pendientes"] == 1
    assert f1["requisitos"]["proyeccion"]["resolucion"] == "4K"


def test_caso2_pelicula_inexistente_404():
    assert cliente.get("/casos/2/pelicula-con-requisitos", params={"id_pelicula": 999999}).status_code == 404


def test_catalogo_de_peliculas_para_el_front():
    assert cliente.get("/peliculas").json()
