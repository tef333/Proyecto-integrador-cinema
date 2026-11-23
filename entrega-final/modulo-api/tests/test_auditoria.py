"""Pruebas de GET /auditoria/consistencia.

Reutilizan los fixtures de test_api.py: funcion_prueba y limpiar (borra las ventas 'test-...',
sus boletas y sus comprobantes al terminar cada prueba).
Ejecutar:  python -m pytest tests -v   (con MONGO_URI=mock no toca Atlas)
"""
import os

from pymongo.errors import ServerSelectionTimeoutError

from app import config as cfg
from app.dependencias import get_mongo

from .test_api import _compra, _silla_libre, cliente, funcion_prueba, limpiar  # noqa: F401

MOCK = os.getenv("MONGO_URI", "").strip().lower() == "mock"
ID_INEXISTENTE = 999_999_999


def _auditoria():
    r = cliente.get("/auditoria/consistencia")
    assert r.status_code == 200, r.text
    return r.json()


def _listas(d):
    return d["ventas_sin_comprobante"] + d["comprobantes_sin_venta"] + d["comprobantes_de_ventas_anuladas"]


def test_auditoria_consistente(funcion_prueba):
    venta = _compra(funcion_prueba, [_silla_libre(funcion_prueba)])
    assert venta.status_code == 201, venta.text
    d = _auditoria()
    assert venta.json()["id_venta"] not in _listas(d)
    assert d["total_ventas_pagadas"] >= 1 and d["total_comprobantes"] >= 1
    assert d["consistente"] is (not _listas(d))
    if MOCK:   # en la Mongo simulada solo esta el comprobante recien creado
        assert d["consistente"] is True
        assert d["primer_id_venta_con_comprobante"] == venta.json()["id_venta"]


def test_auditoria_detecta_venta_sin_comprobante(funcion_prueba):
    a = _compra(funcion_prueba, [_silla_libre(funcion_prueba, 0)]).json()
    b = _compra(funcion_prueba, [_silla_libre(funcion_prueba, 0)]).json()
    get_mongo()[cfg.COLECCION_COMPROBANTES].delete_one({"id_venta": b["id_venta"]})
    d = _auditoria()
    assert b["id_venta"] in d["ventas_sin_comprobante"]
    assert b["id_venta"] not in d["ventas_historicas_sin_comprobante"]
    assert a["id_venta"] not in d["ventas_sin_comprobante"]
    assert d["consistente"] is False


def test_auditoria_detecta_comprobante_huerfano_y_de_venta_anulada(funcion_prueba):
    comprobantes = get_mongo()[cfg.COLECCION_COMPROBANTES]
    venta = _compra(funcion_prueba, [_silla_libre(funcion_prueba)]).json()
    assert cliente.post(f"/ventas/{venta['id_venta']}/anular").status_code == 200
    assert venta["id_venta"] not in _auditoria()["comprobantes_de_ventas_anuladas"]  # quedo 'anulado'

    # Simula que Mongo fallo al anular (comprobante sigue 'emitido') y un comprobante sin venta
    comprobantes.update_one({"id_venta": venta["id_venta"]}, {"$set": {"estado": "emitido"}})
    comprobantes.insert_one({"id_venta": ID_INEXISTENTE, "estado": "emitido"},
                            bypass_document_validation=True)
    try:
        d = _auditoria()
        assert venta["id_venta"] in d["comprobantes_de_ventas_anuladas"]
        assert ID_INEXISTENTE in d["comprobantes_sin_venta"]
        assert d["consistente"] is False
    finally:
        comprobantes.delete_many({"id_venta": ID_INEXISTENTE})


def test_auditoria_con_mongo_caido_da_503(monkeypatch):
    coleccion = get_mongo()[cfg.COLECCION_COMPROBANTES].__class__

    def falla(self, *a, **k):
        raise ServerSelectionTimeoutError("simulado: Atlas no responde")
    monkeypatch.setattr(coleccion, "find", falla)
    r = cliente.get("/auditoria/consistencia")
    assert r.status_code == 503, r.text
    cuerpo = r.json()
    assert cuerpo["error"] == "mongo_no_disponible" and cuerpo["causa"] == "ServerSelectionTimeoutError"
    assert cuerpo["request_id"]
