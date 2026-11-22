"""Prueba de concurrencia: N compradores intentan la MISMA silla al mismo tiempo.

Resultado esperado: exactamente 1 respuesta 201 y las demas 409 (UNIQUE(id_funcion, id_asiento)).

Uso (con la API encendida):
  python pruebas/concurrencia.py --funcion 28 --hilos 10
  python pruebas/concurrencia.py --funcion 28 --asiento 5 --url http://localhost:8000 --salida evidencias_concurrencia.txt
Opcional: --espectadores 1,2,3 reparte compradores distintos (por defecto usa 1..N).
Crea ventas reales: al terminar, anula la ganadora para dejar la silla libre (--conservar para no hacerlo).
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
    req = urllib.request.Request(url, data=json.dumps(cuerpo).encode(), method="POST",
                                 headers={"Content-Type": "application/json"})
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
    ap.add_argument("--asiento", type=int, help="id_asiento; por defecto la primera silla libre")
    ap.add_argument("--hilos", type=int, default=10)
    ap.add_argument("--espectadores", default="")
    ap.add_argument("--tipo-boleta", type=int, default=1)
    ap.add_argument("--salida", help="guardar el resultado en este archivo (evidencia para el informe)")
    ap.add_argument("--conservar", action="store_true", help="no anular la venta ganadora")
    a = ap.parse_args()

    asiento = a.asiento
    if asiento is None:
        sillas = get(f"{a.url}/funciones/{a.funcion}/sillas")["sillas"]
        asiento = next(s["id_asiento"] for s in sillas if not s["ocupada"])
    espectadores = [int(x) for x in a.espectadores.split(",") if x] or list(range(1, a.hilos + 1))
    espectadores = (espectadores * a.hilos)[:a.hilos]

    barrera = threading.Barrier(a.hilos)
    resultados = [None] * a.hilos

    def comprador(i):
        cuerpo = {"id_funcion": a.funcion, "id_espectador": espectadores[i], "id_tipo_boleta": a.tipo_boleta,
                  "ids_asiento": [asiento], "canal_venta": "Online", "metodo_pago": "Tarjeta",
                  "idempotency_key": f"conc-{uuid.uuid4().hex[:16]}"}
        barrera.wait()                       # todos disparan a la vez
        t0 = time.perf_counter()
        estado, resp = post(f"{a.url}/ventas", cuerpo)
        resultados[i] = (i + 1, espectadores[i], estado, resp, time.perf_counter() - t0)

    hilos = [threading.Thread(target=comprador, args=(i,)) for i in range(a.hilos)]
    [h.start() for h in hilos]
    [h.join() for h in hilos]

    lineas = [f"Prueba de concurrencia: {a.hilos} compradores, funcion {a.funcion}, silla {asiento}", ""]
    lineas.append(f"{'#':>2} {'espectador':>10} {'HTTP':>5} {'segundos':>9}  resultado")
    for n, esp, estado, resp, seg in resultados:
        detalle = (f"venta #{resp['id_venta']}" if estado == 201
                   else f"{resp.get('error')}: {resp.get('mensaje')}")
        lineas.append(f"{n:>2} {esp:>10} {estado:>5} {seg:>9.2f}  {detalle}")
    conteo = Counter(r[2] for r in resultados)
    lineas += ["", "Resumen: " + ", ".join(f"{k} x{v}" for k, v in sorted(conteo.items()))]
    correcto = conteo.get(201, 0) == 1 and conteo.get(409, 0) == a.hilos - 1
    lineas.append("RESULTADO: " + ("CORRECTO - una sola venta, el resto rechazado con 409" if correcto
                                   else "REVISAR - se esperaba 1 x 201 y el resto 409"))

    ganadora = next((r[3]["id_venta"] for r in resultados if r[2] == 201), None)
    if ganadora and not a.conservar:
        estado, _ = post(f"{a.url}/ventas/{ganadora}/anular", {})
        lineas.append(f"Limpieza: venta #{ganadora} anulada (HTTP {estado}); la silla vuelve a quedar libre")

    texto = "\n".join(lineas)
    print(texto)
    if a.salida:
        open(a.salida, "w", encoding="utf-8").write(texto + "\n")
    raise SystemExit(0 if correcto else 1)


if __name__ == "__main__":
    main()
