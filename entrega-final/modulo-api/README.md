# modulo-api — API de Altamira Cine (PostgreSQL + MongoDB)

API FastAPI que expone el modulo de integracion (`../script-integracion`) con manejo de errores
(409, 422, 404, 503, 500). Incluye un front simple de mapa de sillas y compra.

## Ejecutar
```bash
cd entrega-final/modulo-api
python -m venv .venv && source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # poner PG_DSN (Neon) y MONGO_URI (Atlas) reales; .env NO se sube
uvicorn app.main:app --reload --port 8000
```
- Front: http://localhost:8000/  ·  Documentacion interactiva: http://localhost:8000/docs
- Reutiliza `db.py` y `ventas_integradas.py` de `../script-integracion` (se localiza solo; o `INTEGRACION_DIR`).

## Endpoints
| Metodo y ruta | Que hace | Errores |
|---|---|---|
| `GET /health` | Estado de PostgreSQL y MongoDB | 503 si alguno falla |
| `GET /funciones` · `GET /tipos-boleta` | Catalogos para el front | |
| `GET /funciones/{id}/sillas` | Mapa de sillas (libre/ocupada) | 404 funcion inexistente |
| `POST /ventas` | Compra: venta en PostgreSQL + comprobante en MongoDB (saga). Repetir `idempotency_key` devuelve la venta original (200) | 422 datos, 409 silla ocupada/sin cupo/funcion cancelada/edad, 404, 503 Mongo caido (venta revertida) |
| `POST /ventas/{id}/anular` | Anula, libera sillas y marca el comprobante `anulado` | 404, 409 (ya anulada), 422 |
| `GET /casos/3/ventas-con-incidentes` | Caso 3: ventas por sala (PG) + incidentes por sala (Mongo). Parametros: `desde`, `hasta`, `severidad_minima`, `tipo`, `solo_con_incidentes` | 422 parametros; si Mongo cae responde 200 con `mongo_disponible:false` |

Formato de error: `{"error": codigo, "mensaje": texto, "request_id": id, ...}`.

## Pruebas
```bash
pip install -r requirements-dev.txt
python -m pytest tests -v                  # 22 pruebas; crean ventas 'test-...' y las borran
python pruebas/concurrencia.py --funcion <id_funcion_futura> --hilos 10 --salida concurrencia.txt
```
La de concurrencia dispara 10 compras simultaneas de la misma silla: esperado 1 x 201 y 9 x 409.

## Decisiones tecnicas (para el informe)
- **Compra**: PostgreSQL manda. Se inserta venta + boletas sin commit, luego el comprobante en Mongo
  (`w=majority`) y al final el commit; si algo falla se revierte/compensa (saga de Espin).
- **Anulacion**: se confirma primero en PostgreSQL y despues se actualiza Mongo. Si Mongo falla la
  anulacion se mantiene y se avisa (`comprobante: pendiente`): consistencia eventual aceptada (BASE).
- **Caso 3**: lectura de dos motores unida en la API; si Mongo no responde se prioriza disponibilidad.
- **Silla ocupada** la decide la restriccion `UNIQUE(id_funcion, id_asiento)`, no el codigo: es lo que
  hace segura la concurrencia.
- Los nombres de `asientos`/`boletas`/`idempotency_key` estan en `app/config.py`; si Erika los cambia
  en `06_migracion_final.sql`, se ajustan alli.
