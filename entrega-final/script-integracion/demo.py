"""Demostracion de la transaccion cruzada contra los motores reales.

Uso:
    python demo.py                # corre los 3 escenarios con datos de ejemplo
    python demo.py --funcion 7 --espectador 3 --tipo 1 --cantidad 2

Escenarios (los tres imprimen el estado de PostgreSQL y de MongoDB antes y
despues, para comprobar que los dos motores quedan consistentes):
  1. Venta exitosa            -> 1 fila nueva en ventas y 1 comprobante en Mongo.
  2. Venta rechazada por regla -> funcion ya finalizada: no cambia nada en ningun motor.
  3. Fallo simulado de Mongo   -> la venta se revierte en PostgreSQL.
"""
import argparse
import json
from unittest import mock

from pymongo.errors import AutoReconnect

from db import conectar_mongo, conectar_postgres
from ventas_integradas import ErrorIntegracion, funcion_futura, registrar_venta_integrada


def estado(pg, mongo):
    with pg.cursor() as cur:
        cur.execute("SELECT count(*), coalesce(max(id_venta), 0) FROM ventas")
        n_ventas, max_id = cur.fetchone()
    pg.rollback()  # cierra la transaccion de lectura
    return {"ventas_pg": n_ventas, "ultima_venta_pg": max_id,
            "comprobantes_mongo": mongo.comprobantes_venta.count_documents({})}


def correr(titulo, pg, mongo, datos, simular_fallo_mongo=False):
    print(f"\n=== {titulo} ===")
    antes = estado(pg, mongo)
    print("antes  :", antes)
    try:
        if simular_fallo_mongo:
            with mock.patch("pymongo.collection.Collection.insert_one",
                            side_effect=AutoReconnect("Atlas no responde (simulado)")):
                res = registrar_venta_integrada(pg, mongo, datos)
        else:
            res = registrar_venta_integrada(pg, mongo, datos)
        print("resultado: OK", json.dumps(res, default=str, ensure_ascii=False))
    except ErrorIntegracion as e:
        print(f"resultado: ERROR {e.estado_http} ->", json.dumps(e.como_dict(), ensure_ascii=False))
    despues = estado(pg, mongo)
    print("despues:", despues)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--funcion", type=int, default=None, help="funcion futura; por defecto la proxima programada")
    ap.add_argument("--funcion-cerrada", type=int, default=1,
                    help="funcion finalizada, para el escenario de rechazo")
    ap.add_argument("--espectador", type=int, default=1)
    ap.add_argument("--tipo", type=int, default=1)
    ap.add_argument("--cantidad", type=int, default=2)
    ap.add_argument("--staff", type=int, default=None, help="id_staff; vacio = venta Online")
    ap.add_argument("--solo-uno", action="store_true", help="solo el escenario 1 con estos datos")
    a = ap.parse_args()

    pg = conectar_postgres()
    id_funcion = a.funcion or funcion_futura(pg)
    base = {"id_funcion": id_funcion, "id_espectador": a.espectador, "id_tipo_boleta": a.tipo,
            "cantidad": a.cantidad, "id_staff": a.staff,
            "canal_venta": "Online" if a.staff is None else "Taquilla",
            "metodo_pago": "Tarjeta"}
    cliente, mongo = conectar_mongo()
    try:
        correr("1. Venta exitosa (PostgreSQL + MongoDB)", pg, mongo, base)
        if not a.solo_uno:
            correr("2. Venta rechazada por regla del negocio (funcion ya finalizada)", pg, mongo,
                   {**base, "id_funcion": a.funcion_cerrada})
            correr("3. Fallo simulado de MongoDB (la venta debe revertirse)", pg, mongo, base,
                   simular_fallo_mongo=True)
    finally:
        pg.close()
        cliente.close()


if __name__ == "__main__":
    main()
