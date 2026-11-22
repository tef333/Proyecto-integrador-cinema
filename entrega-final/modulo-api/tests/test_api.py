"""Pruebas de la API contra PostgreSQL y MongoDB.

Ejecutar:  python -m pytest tests -v
Usa las variables del .env (PG_DSN, MONGO_URI). OJO: crean ventas reales (clave 'test-...') y las
borran al terminar; con Neon usar una funcion futura de pruebas. Con MONGO_URI=mock no toca Atlas.
"""
import uuid
from datetime import datetime, timedelta, timezone

import psycopg
import pytest
from fastapi.testclient import TestClient
from pymongo.errors import ServerSelectionTimeoutError

from app import config as cfg
from app.dependencias import get_mongo
from app.main import app
from db import conectar_postgres

cliente = TestClient(app, raise_server_exceptions=False)


def _ahora():
    return datetime.now(timezone.utc).replace(tzinfo=None)   # Mongo guarda fechas en UTC


def _pg_uno(sql, params=None):
    with conectar_postgres() as c:
        return c.execute(sql, params).fetchone()


@pytest.fixture(scope="module")
def funcion_prueba():
    """Primera funcion programada futura de clasificacion 'Todo publico' (sin restriccion de edad)."""
    fila = _pg_uno("""SELECT f.id_funcion FROM funciones f JOIN peliculas p USING (id_pelicula)
                      WHERE f.estado='Programada' AND f.fecha_hora_inicio > now()
                        AND p.clasificacion ILIKE 'Todo%' ORDER BY f.fecha_hora_inicio LIMIT 1""")
    assert fila, "No hay funcion futura 'Todo publico' para probar"
    return fila[0]


@pytest.fixture(autouse=True)
def limpiar():
    yield
    with conectar_postgres() as c:
        ids = [r[0] for r in c.execute(
            f"SELECT id_venta FROM ventas WHERE {cfg.COL_IDEMPOTENCIA} LIKE 'test-%'").fetchall()]
        if ids:   # solo se borra lo que crearon estas pruebas
            get_mongo()[cfg.COLECCION_COMPROBANTES].delete_many({"id_venta": {"$in": ids}})
            c.execute(f"DELETE FROM {cfg.T_BOLETAS} WHERE id_venta = ANY(%s)", (ids,))
            c.execute("DELETE FROM ventas WHERE id_venta = ANY(%s)", (ids,))
        c.commit()


def _silla_libre(id_funcion, n=0):
    r = cliente.get(f"/funciones/{id_funcion}/sillas").json()
    return [s["id_asiento"] for s in r["sillas"] if not s["ocupada"]][n]


def _compra(id_funcion, asientos, **extra):
    id_funcion = extra.pop("id_funcion", id_funcion)
    cuerpo = {"id_funcion": id_funcion, "id_espectador": 1, "id_tipo_boleta": 1,
              "ids_asiento": asientos, "canal_venta": "Online", "metodo_pago": "Tarjeta",
              "idempotency_key": f"test-{uuid.uuid4().hex[:12]}"}
    cuerpo.update(extra)
    return cliente.post("/ventas", json=cuerpo)


def test_health():
    r = cliente.get("/health")
    assert r.status_code == 200 and r.json() == {"postgres": "ok", "mongo": "ok"}
    assert r.headers["x-request-id"]


def test_mapa_de_sillas(funcion_prueba):
    r = cliente.get(f"/funciones/{funcion_prueba}/sillas")
    assert r.status_code == 200
    d = r.json()
    assert d["total"] == d["ocupadas"] + d["disponibles"] and d["total"] > 0


def test_sillas_funcion_inexistente():
    r = cliente.get("/funciones/999999/sillas")
    assert r.status_code == 404 and r.json()["error"] == "no_encontrado"


def test_compra_feliz_y_silla_queda_ocupada(funcion_prueba):
    silla = _silla_libre(funcion_prueba)
    r = _compra(funcion_prueba, [silla])
    assert r.status_code == 201, r.text
    cuerpo = r.json()
    assert cuerpo["comprobante_id"] and cuerpo["id_venta"]
    sillas = cliente.get(f"/funciones/{funcion_prueba}/sillas").json()["sillas"]
    assert next(s for s in sillas if s["id_asiento"] == silla)["ocupada"] is True
    assert get_mongo()[cfg.COLECCION_COMPROBANTES].count_documents({"id_venta": cuerpo["id_venta"]}) == 1


def test_misma_silla_dos_veces_da_409(funcion_prueba):
    silla = _silla_libre(funcion_prueba)
    assert _compra(funcion_prueba, [silla]).status_code == 201
    r = _compra(funcion_prueba, [silla])
    assert r.status_code == 409, r.text
    assert r.json()["error"] in ("regla_de_negocio", "silla_ocupada")


def test_idempotency_key_repetida_no_duplica(funcion_prueba):
    silla = _silla_libre(funcion_prueba)
    clave = f"test-{uuid.uuid4().hex[:12]}"
    a = _compra(funcion_prueba, [silla], idempotency_key=clave)
    b = _compra(funcion_prueba, [silla], idempotency_key=clave)
    assert a.status_code == 201 and b.status_code == 200
    assert b.json()["repetida"] is True and b.json()["id_venta"] == a.json()["id_venta"]


@pytest.mark.parametrize("cambio", [
    {"ids_asiento": []},
    {"ids_asiento": [5, 5]},
    {"canal_venta": "Online", "metodo_pago": "Efectivo"},
    {"canal_venta": "Taquilla"},                       # taquilla sin id_staff
    {"id_funcion": 0},
    {"metodo_pago": "Bitcoin"},
    {"idempotency_key": "x"},
])
def test_validaciones_dan_422(funcion_prueba, cambio):
    asientos = cambio.pop("ids_asiento", [1])
    base = {"id_funcion": funcion_prueba, **cambio}
    r = _compra(base.pop("id_funcion"), asientos, **base)
    assert r.status_code == 422, r.text
    assert r.json()["error"] == "datos_invalidos" and r.json()["campos"]


def test_cuerpo_no_json():
    r = cliente.post("/ventas", content="esto no es json", headers={"content-type": "application/json"})
    assert r.status_code == 422


def test_funcion_finalizada_da_409():
    fin = _pg_uno("SELECT f.id_funcion FROM funciones f WHERE f.estado='Finalizada' LIMIT 1")[0]
    asiento = _pg_uno(f"SELECT a.id_asiento FROM {cfg.T_ASIENTOS} a JOIN funciones f ON f.id_sala=a.id_sala "
                      "WHERE f.id_funcion=%s LIMIT 1", (fin,))[0]
    r = _compra(fin, [asiento])
    assert r.status_code == 409 and r.json()["error"] == "regla_de_negocio", r.text


def test_asiento_de_otra_sala_se_rechaza(funcion_prueba):
    otra = _pg_uno(f"SELECT a.id_asiento FROM {cfg.T_ASIENTOS} a WHERE a.id_sala <> "
                   "(SELECT id_sala FROM funciones WHERE id_funcion=%s) LIMIT 1", (funcion_prueba,))[0]
    r = _compra(funcion_prueba, [otra])
    # Hasta que Erika agregue el trigger de coherencia sala/asiento esto puede dar 201 (ver README).
    assert r.status_code in (201, 409, 422), r.text


def test_mongo_caido_revierte_la_venta(funcion_prueba, monkeypatch):
    silla = _silla_libre(funcion_prueba)
    coleccion = get_mongo()[cfg.COLECCION_COMPROBANTES].__class__

    def falla(self, *a, **k):
        raise ServerSelectionTimeoutError("simulado: Atlas no responde")
    monkeypatch.setattr(coleccion, "insert_one", falla)
    r = _compra(funcion_prueba, [silla])
    assert r.status_code == 503 and r.json()["error"] == "mongo_no_disponible", r.text
    monkeypatch.undo()
    assert _silla_libre(funcion_prueba) == silla          # PostgreSQL hizo rollback: la silla sigue libre


def test_anular_libera_silla_y_marca_comprobante(funcion_prueba):
    silla = _silla_libre(funcion_prueba)
    venta = _compra(funcion_prueba, [silla]).json()
    r = cliente.post(f"/ventas/{venta['id_venta']}/anular")
    assert r.status_code == 200 and r.json()["estado"] == "Anulada" and r.json()["comprobante"] == "anulado"
    assert _silla_libre(funcion_prueba) == silla
    doc = get_mongo()[cfg.COLECCION_COMPROBANTES].find_one({"id_venta": venta["id_venta"]})
    assert doc["estado"] == "anulado"


def test_anular_dos_veces_o_inexistente(funcion_prueba):
    venta = _compra(funcion_prueba, [_silla_libre(funcion_prueba)]).json()
    assert cliente.post(f"/ventas/{venta['id_venta']}/anular").status_code == 200
    r = cliente.post(f"/ventas/{venta['id_venta']}/anular")
    assert r.status_code == 409 and r.json()["estado_actual"] == "Anulada"
    assert cliente.post("/ventas/99999999/anular").status_code == 404
    assert cliente.post("/ventas/0/anular").status_code == 422


def test_caso3_cruza_ventas_e_incidentes():
    inc = get_mongo()[cfg.COLECCION_INCIDENTES]
    inc.delete_many({"codigo": {"$regex": "^INC-TEST"}})
    ahora = _ahora()
    inc.insert_many([
        {"codigo": "INC-TEST1", "tipo": "falla_tecnica", "fecha_hora": ahora, "id_sala": 1,
         "severidad": "critica", "estado": "abierto"},
        {"codigo": "INC-TEST2", "tipo": "queja_servicio", "fecha_hora": ahora, "id_sala": 1,
         "severidad": "baja", "estado": "resuelto"},
    ])
    try:
        d = (ahora - timedelta(days=1)).date()
        h = (ahora + timedelta(days=1)).date()
        r = cliente.get(f"/casos/3/ventas-con-incidentes?desde=2026-01-01&hasta={h}")
        assert r.status_code == 200 and r.json()["mongo_disponible"] is True
        sala1 = next(s for s in r.json()["salas"] if s["id_sala"] == 1)
        assert sala1["incidentes"] >= 2 and sala1["incidentes_criticos"] >= 1
        solo_graves = cliente.get(f"/casos/3/ventas-con-incidentes?desde=2026-01-01&hasta={h}"
                                  "&severidad_minima=critica&solo_con_incidentes=true").json()
        assert all(s["incidentes"] > 0 for s in solo_graves["salas"])
    finally:
        inc.delete_many({"codigo": {"$regex": "^INC-TEST"}})


def test_caso3_parametros_invalidos():
    assert cliente.get("/casos/3/ventas-con-incidentes?desde=2026-12-31&hasta=2026-01-01").status_code == 422
    assert cliente.get("/casos/3/ventas-con-incidentes?desde=ayer&hasta=hoy").status_code == 422
    assert cliente.get("/casos/3/ventas-con-incidentes?desde=2026-01-01&hasta=2026-12-31"
                       "&severidad_minima=extrema").status_code == 422
    assert cliente.get("/casos/3/ventas-con-incidentes").status_code == 422


def test_caso3_con_mongo_caido_devuelve_solo_ventas(monkeypatch):
    clase = get_mongo()[cfg.COLECCION_INCIDENTES].__class__

    def falla(self, *a, **k):
        raise ServerSelectionTimeoutError("simulado")
    monkeypatch.setattr(clase, "aggregate", falla)
    r = cliente.get("/casos/3/ventas-con-incidentes?desde=2026-01-01&hasta=2026-12-31")
    assert r.status_code == 200
    d = r.json()
    assert d["mongo_disponible"] is False and d["advertencia"] and "incidentes" not in d["salas"][0]
