"""Configuracion comun del modulo API.

Localiza el modulo de integracion de Espin (entrega-final/script-integracion) y lo
agrega al sys.path para reutilizar db.py (conexiones) y ventas_integradas.py (saga).
Tambien concentra los nombres del esquema de asientos/boletas que define Erika en
06_migracion_final.sql: si ella los cambia, se ajustan SOLO aqui.
"""
import os
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]  # carpeta entrega-final/

_candidatos = [os.getenv("INTEGRACION_DIR", ""), RAIZ / "script-integracion", RAIZ / "integracion"]
for _ruta in _candidatos:
    if _ruta and Path(_ruta).is_dir():
        sys.path.insert(0, str(_ruta))
        break
else:
    raise ImportError(
        "No encuentro el modulo de integracion (entrega-final/script-integracion). "
        "Defina INTEGRACION_DIR con su ruta."
    )

# ---- Nombres del esquema de Erika (plan del equipo; confirmar con 06_migracion_final.sql)
T_ASIENTOS = "asientos"            # id_asiento, id_sala, fila, numero, tipo, estado (Activo/Bloqueado)
T_BOLETAS = "boletas"              # id_venta, id_funcion, id_asiento, estado (Valida/Anulada);
                                   # indice unico parcial (id_funcion, id_asiento) WHERE estado='Valida'
COL_IDEMPOTENCIA = "idempotency_key"   # ventas.idempotency_key (UNIQUE)
ESTADO_VENTA_PAGADA = "Pagada"
ESTADO_VENTA_ANULADA = "Anulada"
COLECCION_COMPROBANTES = "comprobantes_venta"   # la crea Espin (preparar_mongo.py)
COLECCION_INCIDENTES = "reportes_incidentes"    # Avance 2
