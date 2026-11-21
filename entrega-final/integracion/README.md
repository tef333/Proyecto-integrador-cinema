# Integración PostgreSQL + MongoDB (transacción cruzada)

Módulo en Python que conecta a los dos motores y registra una **venta de boletas**
en PostgreSQL y, en la misma operación, su **comprobante** en MongoDB
(colección nueva `comprobantes_venta`).

## Archivos

| Archivo | Qué hace |
|---|---|
| `db.py` | Conexiones a PostgreSQL (Neon) y MongoDB (Atlas). Claves por variables de entorno |
| `ventas_integradas.py` | `registrar_venta_integrada(pg, mongo, datos)`: la transacción cruzada |
| `compensacion.py` | Deshace en MongoDB si algo falla (**pendiente de extender: Estefanía**) |
| `preparar_mongo.py` | Crea `comprobantes_venta` con `$jsonSchema` e índice único por `id_venta` |
| `demo.py` | Corre 3 escenarios contra los motores reales (éxito, rechazo, fallo de Mongo) |
| `test_integracion.py` | 15 pruebas automáticas |
| `funcion_para_demo.sql` | Crea una función futura si las de los datos de prueba ya pasaron |

## Instalación y configuración

```bash
pip install -r requirements.txt
cp .env.example .env     # poner PG_DSN y MONGO_URI reales; .env NO se sube a GitHub
python preparar_mongo.py # una sola vez: crea comprobantes_venta
```

## Ejecutar la demo

```bash
python demo.py                          # 3 escenarios
python demo.py --funcion 29 --espectador 3 --tipo 2 --cantidad 3 --solo-uno
```

Si no se indica `--funcion`, usa la próxima función futura. Cada ejecución del escenario 1 crea **una venta real** en Neon y un comprobante en
Atlas. Los escenarios 2 y 3 no dejan nada. Antes de la sustentación hay que
comprobar que la función usada siga siendo futura (`funcion_para_demo.sql`).

## Modo simulado (sin Atlas)

Poner `MONGO_URI=mock` en `.env` para usar una MongoDB en memoria (PostgreSQL sigue siendo
el real). Sirve para probar `demo.py` sin Atlas; **no se usa en la sustentación**.

## Cómo funciona la transacción cruzada

No existe un COMMIT único entre PostgreSQL y MongoDB, así que se coordina como
una saga corta:

1. PostgreSQL: se abre una transacción y se inserta la venta. Los triggers del
   Avance 1 validan cupo, edad y estado de la función, y suman puntos. **Sin commit todavía.**
2. MongoDB: se inserta el comprobante con `writeConcern: majority`.
3. PostgreSQL: `COMMIT`.

| Si falla… | Resultado |
|---|---|
| el paso 1 (regla de negocio, datos) | no se escribió nada en Mongo; error 409/404/422 |
| el paso 2 (Atlas no responde) | `ROLLBACK` en PostgreSQL; error 503 |
| el paso 3 (cae PostgreSQL al confirmar) | se compensa borrando el comprobante en Mongo; error 503 |

PostgreSQL (el dinero) nunca queda con una venta sin comprobante. El único dato
que podría quedar huérfano es un comprobante en Mongo, y la compensación lo borra
(por `_id`, es idempotente).

## Uso del módulo desde otro código (Santiago)

```python
from db import conectar_postgres, conectar_mongo
from ventas_integradas import registrar_venta_integrada, ErrorIntegracion

try:
    resultado = registrar_venta_integrada(pg, mongo_db, cuerpo_json)   # 201
except ErrorIntegracion as e:
    # e.estado_http: 422 datos inválidos, 404 no existe, 409 regla de negocio, 503 un motor caído
    # e.como_dict():  {"error": "...", "mensaje": "...", ...}  -> cuerpo de la respuesta
    ...
```

Campos del cuerpo: `id_funcion`, `id_espectador`, `id_tipo_boleta`, `cantidad` (1–10),
`canal_venta` (`Taquilla`/`Online`), `metodo_pago`, `id_staff` (obligatorio en
Taquilla, `null` en Online). El precio se toma del catálogo, no del cliente.

## Pruebas

```bash
pip install -r requirements-dev.txt
PG_DSN="..." pytest -v
```

PostgreSQL es real; MongoDB se simula con `mongomock` para poder probar caídas.
Cada prueba deja la base como estaba. Cubren: venta exitosa y consistencia entre
motores, regla de negocio, datos faltantes e inválidos, función o tipo de boleta
inexistente, caída de Mongo (rollback), caída de PostgreSQL en el COMMIT
(compensación real, cerrando la conexión con `pg_terminate_backend`) y no duplicar comprobantes.

## Pendiente de otros integrantes

- **Estefanía:** extender `compensacion.py` (reintentos, bitácora de compensaciones fallidas) y sus pruebas de fallo. Hay una versión mínima para que la transacción funcione.
- **Santiago:** la API (FastAPI) sobre `registrar_venta_integrada` y las pruebas de fallo con capturas de ejecución real.
- **Erika:** los 3 casos de uso de lectura (función con reseñas, película con requisitos, ventas vs. incidentes por sala).
