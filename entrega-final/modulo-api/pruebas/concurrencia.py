
"""Prueba de concurrencia: N compradores intentan la MISMA silla al mismo tiempo.

Resultado esperado: exactamente 1 respuesta 201 y las demas 409
(UNIQUE(id_funcion, id_asiento)).

Uso (con la API encendida):
  python pruebas/concurrencia.py --funcion 28 --hilos 10
  python pruebas/concurrencia.py --funcion 28 --asiento 5 --url http://localhost:8000 --salida evidencias_concurrencia.txt

Opcional: --espectadores 1,2,3 reparte compradores distintos (por defecto usa 1..N).

Crea ventas reales: al terminar, anula la ganadora para dejar la silla libre
(--conservar para no hacerlo).
"""

import argparse
import json
import threading
import time
import urllib.error
import urllib.request
import uuid
from collections import Counter


def post(url, cuerpo):
    req = urllib.request.Request(
        url,
        data=json.dumps(cuerpo).encode(),
        method="POST",
        headers={"Content-Type": "application/json"},
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


def get(url):
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.loads(r.read())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://localhost:8000")
    ap.add_argument("--funcion", type=int, required=True)
    ap.add_argument(
        "--asiento",
        type=int,
        help="id_asiento; por defecto la primera silla libre y desbloqueada",
    )
    ap.add_argument("--hilos", type=int, default=10)
    ap.add_argument("--espectadores", default="")
    ap.add_argument("--tipo-boleta", type=int, default=1)
    ap.add_argument(
        "--salida",
        help="guardar el resultado en este archivo (evidencia para el informe)",
    )
    ap.add_argument(
        "--conservar",
        action="store_true",
        help="no anular la venta ganadora",
    )

    a = ap.parse_args()

    if a.hilos < 2:
        ap.error("--hilos debe ser al menos 2 para probar concurrencia")

    # Obtener y validar la silla que utilizaran todos los compradores.
    try:
        sillas = get(
            f"{a.url}/funciones/{a.funcion}/sillas"
        )["sillas"]
    except (urllib.error.URLError, KeyError, json.JSONDecodeError) as e:
        raise SystemExit(f"No se pudo consultar el mapa de sillas: {e}")

    if a.asiento is None:
        disponibles = [
            s for s in sillas
            if not s["ocupada"] and not s["bloqueada"]
        ]

        if not disponibles:
            raise SystemExit(
                "No hay sillas disponibles y desbloqueadas para la prueba."
            )

        asiento = disponibles[0]["id_asiento"]

    else:
        seleccionada = next(
            (s for s in sillas if s["id_asiento"] == a.asiento),
            None,
        )

        if seleccionada is None:
            raise SystemExit(
                f"La silla {a.asiento} no pertenece a la funcion {a.funcion}."
            )

        if seleccionada["ocupada"]:
            raise SystemExit(f"La silla {a.asiento} ya esta ocupada.")

        if seleccionada["bloqueada"]:
            raise SystemExit(f"La silla {a.asiento} esta bloqueada.")

        asiento = a.asiento

    espectadores = [
        int(x) for x in a.espectadores.split(",") if x
    ] or list(range(1, a.hilos + 1))

    espectadores = (espectadores * a.hilos)[:a.hilos]

    barrera = threading.Barrier(a.hilos)
    resultados = [None] * a.hilos

    def comprador(i):
        cuerpo = {
            "id_funcion": a.funcion,
            "id_espectador": espectadores[i],
            "id_tipo_boleta": a.tipo_boleta,
            "ids_asiento": [asiento],
            "canal_venta": "Online",
            "metodo_pago": "Tarjeta",
            "idempotency_key": f"conc-{uuid.uuid4().hex[:16]}",
        }

        try:
            barrera.wait(timeout=30)
            t0 = time.perf_counter()

            estado, resp = post(
                f"{a.url}/ventas",
                cuerpo,
            )

            resultados[i] = (
                i + 1,
                espectadores[i],
                estado,
                resp,
                time.perf_counter() - t0,
            )

        except Exception as e:
            resultados[i] = (
                i + 1,
                espectadores[i],
                0,
                {"error": type(e).__name__, "mensaje": str(e)},
                0,
            )

    hilos = [
        threading.Thread(target=comprador, args=(i,))
        for i in range(a.hilos)
    ]

    for h in hilos:
        h.start()

    for h in hilos:
        h.join()

    lineas = [
        f"Prueba de concurrencia: {a.hilos} compradores, "
        f"funcion {a.funcion}, silla {asiento}",
        "",
    ]

    lineas.append(
        f"{'#':>2} {'espectador':>10} {'HTTP':>5} "
        f"{'segundos':>9}  resultado"
    )

    for n, esp, estado, resp, seg in resultados:
        if estado == 201:
            detalle = f"venta #{resp.get('id_venta', 'sin ID')}"
        else:
            detalle = (
                f"{resp.get('error', 'error')}: "
                f"{resp.get('mensaje', 'sin detalle')}"
            )

        lineas.append(
            f"{n:>2} {esp:>10} {estado:>5} "
            f"{seg:>9.2f}  {detalle}"
        )

    conteo = Counter(r[2] for r in resultados)

    lineas += [
        "",
        "Resumen: " + ", ".join(
            f"{k} x{v}" for k, v in sorted(conteo.items())
        ),
    ]

    correcto = (
        conteo.get(201, 0) == 1
        and conteo.get(409, 0) == a.hilos - 1
    )

    lineas.append(
        "RESULTADO: "
        + (
            "CORRECTO - una sola venta, el resto rechazado con 409"
            if correcto
            else "REVISAR - se esperaba 1 x 201 y el resto 409"
        )
    )

    # Identificar y anular la venta ganadora, si corresponde.
    ganadora = next(
        (
            r[3]["id_venta"]
            for r in resultados
            if r[2] == 201 and "id_venta" in r[3]
        ),
        None,
    )

    if ganadora and not a.conservar:
        try:
            estado, _ = post(
                f"{a.url}/ventas/{ganadora}/anular",
                {},
            )

            lineas.append(
                f"Limpieza: venta #{ganadora} anulada "
                f"(HTTP {estado}); la silla vuelve a quedar libre"
            )

        except Exception as e:
            lineas.append(
                f"ADVERTENCIA: no se pudo anular la venta "
                f"#{ganadora}: {e}"
            )

    texto = "\n".join(lineas)

    print(texto)

    if a.salida:
        with open(a.salida, "w", encoding="utf-8") as archivo:
            archivo.write(texto + "\n")

    raise SystemExit(0 if correcto else 1)


if __name__ == "__main__":
    main()
