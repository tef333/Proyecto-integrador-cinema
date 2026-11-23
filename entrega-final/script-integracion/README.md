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
| `test_integracion.py` | 20 pruebas automáticas (5 requieren la migración final) |
| `funcion_para_demo.sql` | Crea una función futura si las de los datos de prueba ya pasaron |

## Instalación y configuración

Todos los comandos se ejecutan dentro de la carpeta del módulo:

```bash
cd entrega-final/script-integracion
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

También se pueden enviar dos campos opcionales. El primero es ids_asiento, una lista
de 1 a 10 sillas sin repetir; si viene, la cantidad debe ser igual al número de sillas
y se puede omitir. El segundo es idempotency_key, un texto de 8 a 64 caracteres.

Con la migración final, el módulo la detecta en cada venta. Dentro de la misma
transacción y antes de escribir en Mongo, guarda la idempotency_key en la venta e
inserta una boleta por cada silla. Si no se enviaron sillas, asigna sillas libres de
la sala: VIP para el tipo de boleta VIP y Estándar para los demás. Si no alcanzan, la
venta se rechaza con error 409.

Si una silla ya fue vendida para esa función, la venta se rechaza con error 409
silla_ocupada y no queda comprobante en Mongo. Si la idempotency_key ya se usó, por un
reintento o por dos peticiones al mismo tiempo, se devuelve la venta original marcada
como repetida y no se escribe nada en Mongo. El comprobante guarda las sillas y la
idempotency_key cuando existen. Sin la migración todo funciona como antes.

## Pruebas

```bash
cd entrega-final/script-integracion
pip install -r requirements-dev.txt
PG_DSN="..." pytest -v
```

> **Nota:** para correr las 15 pruebas hay que usar la cadena **directa** de Neon,
> sin `-pooler` en el host. Con la cadena del pooler, la prueba
> `test_fallo_en_commit_compensa_el_comprobante_de_mongo` se salta (el pooler
> oculta la caída de la conexión) y el resultado es 14 aprobadas y 1 saltada.

En total son 20 pruebas. Cinco de ellas requieren la migración final y se saltan solas
si la base no la tiene, así que sin la migración el resultado es 15 aprobadas y 5
saltadas, y con la migración son 20 aprobadas.

PostgreSQL es real; MongoDB se simula con `mongomock` para poder probar caídas.
Cada prueba deja la base como estaba. Cubren: venta exitosa y consistencia entre
motores, regla de negocio, datos faltantes e inválidos, función o tipo de boleta
inexistente, caída de Mongo (rollback), caída de PostgreSQL en el COMMIT
(compensación real, cerrando la conexión con `pg_terminate_backend`) y no duplicar comprobantes.

## Pendiente de otros integrantes

- **Estefanía:** extender `compensacion.py` (reintentos, bitácora de compensaciones fallidas) y sus pruebas de fallo. Hay una versión mínima para que la transacción funcione.
- **Santiago:** la API (FastAPI) sobre `registrar_venta_integrada` y las pruebas de fallo con capturas de ejecución real.
- **Erika:** los 3 casos de uso de lectura (función con reseñas, película con requisitos, ventas vs. incidentes por sala).
