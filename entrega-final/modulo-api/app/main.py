"""API de Altamira Cine: expone el modulo de integracion PostgreSQL + MongoDB.

Ejecutar (desde entrega-final/modulo-api):  uvicorn app.main:app --reload --port 8000
Documentacion interactiva:  http://localhost:8000/docs   |   Front:  http://localhost:8000/
"""
import uuid
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import config  # noqa: F401
from .errores import registrar_manejadores
from .rutas import cartelera, casos, casos_integracion, catalogo, incidentes, resenas, ventas, sillas
from .dependencias import _mongo
from db import conectar_postgres

app = FastAPI(title="Altamira Cine - API de integracion", version="1.0")
registrar_manejadores(app)


@app.middleware("http")
async def request_id(request: Request, call_next):
    # Si Espin ya agrega request_id en su version, este middleware se puede quitar.
    request.state.request_id = request.headers.get("x-request-id") or uuid.uuid4().hex[:8]
    respuesta = await call_next(request)
    respuesta.headers["X-Request-ID"] = request.state.request_id
    return respuesta


@app.get("/health", tags=["salud"])
def health():
    """Estado de cada motor; 200 si ambos responden, 503 si alguno falla."""
    from fastapi.responses import JSONResponse
    estado = {"postgres": "ok", "mongo": "ok"}
    try:
        with conectar_postgres() as c:
            c.execute("SELECT 1")
    except Exception as e:
        estado["postgres"] = f"error: {type(e).__name__}"
    try:
        _mongo()[0].admin.command("ping")
    except Exception as e:
        estado["mongo"] = f"error: {type(e).__name__}"
    ok = all(v == "ok" for v in estado.values())
    return JSONResponse(status_code=200 if ok else 503, content=estado)


for r in (cartelera.router, catalogo.router, sillas.router, ventas.router, casos.router,
          casos_integracion.router, resenas.router, incidentes.router):
    app.include_router(r)

_estaticos = Path(__file__).resolve().parents[1] / "static"
app.mount("/static", StaticFiles(directory=_estaticos), name="static")


@app.get("/", include_in_schema=False)
def inicio():
    return FileResponse(_estaticos / "index.html")
