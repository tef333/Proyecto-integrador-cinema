# Proyecto integrador – Altamira Cine

Grupo: Cinemas 3 (Altamira Cine)

Altamira Cine es una empresa de cine de Bogotá, Colombia, con cartelera comercial de estrenos combinada con cine colombiano y latinoamericano. Opera en un solo complejo de 6 salas (780 sillas, 700 en operación mientras la sala 4DX está en mantenimiento) y tiene 30 actores y directores registrados.

El proyecto combina un núcleo transaccional en PostgreSQL (Avance 1), una capa documental en MongoDB (Avance 2) y la integración funcional de ambos motores con un módulo en Python y una API con front (Entrega final). Cada fase se apoya en la anterior. Los dos motores se conectan mediante identificadores compartidos, sin llaves foráneas entre ellos.

## Integrantes

| # | Integrante | Usuario GitHub | Avance 1 | Avance 2 | Entrega final |
|---|---|---|---|---|---|
| 1 | Estefania Paredes | tef333 | Modelo ER, modelo relacional y creación de tablas | Colección `reportes_incidentes`, diagrama de arquitectura políglota y sección CAP | Ventas y sillas en API y front (sillas, comprar, anular y mapa de sillas, con errores HTTP 409 y 422), consulta SQL y caso 3 (ventas con incidentes por sala), prueba de concurrencia sobre la misma silla y sección de casos de uso y concurrencia del informe |
| 2 | Jose Espin | jespinn | Triggers | Colección `requisitos_proyeccion` y sección ACID | Conexión entre motores: saga de venta, validación cruzada, cancelación propagada, `/health`, `request_id` y `.env`; ajuste de la saga a boletas e `idempotency_key`; análisis de índices del caso 3; evidencias de ejecución del módulo de integración; prueba de MongoDB caído durante una venta y sección de arquitectura de integración, flujo de datos y conexión |
| 3 | Santiago Rojas | Srojas-ga y Shellingbump85 | Procedimientos almacenados | Colección `fichas_tecnicas_peliculas` y sección BASE | Reseñas, requisitos e incidentes en API y front; consultas de los casos 1 y 2 (función con reseñas y película con requisitos); endpoints de reseñas e incidentes (error 121 → 422, duplicado → 409); pestañas del front; prueba de reseña sin compra; corrección de las fichas técnicas (duración por versión y clasificación por país) y sección de sus casos de uso con capturas |
| 4 | Erika Gomez | Eri-02 | Consultas SQL e informe PDF | Colección `resenas_peliculas`, integración e informe del Avance 2 | PostgreSQL: sillas, boletas, trigger de cupo, estados, `idempotency_key`, migración y pruebas SQL; endpoint y front de cartelera; informe final consolidado (portada, avances, conclusiones, ensamblaje, README y GitHub) |

## Estructura del repositorio

```
avance1-postgresql/
├── avance1-informe.pdf
├── modelo-er/                  Modelo Entidad Relacion Final Cinema.drawio (1).pdf
├── modelo-relacional/          Diagrama Relacional Final2.pgerd.png
├── scripts/                    01_creacion_tablas.sql … 05_consultas.sql, 06_migracion_final.sql
└── evidencias/                 capturas de ejecución (01 a 06)
avance2-mongodb/
├── avance2-informe.pdf
├── diagrama-arquitectura-poliglota/   diagrama-arquitectura-poliglota.pdf y diagrama-arquitectura-poliglota-final1.png
├── scripts/
│   ├── fichas_tecnicas_peliculas/     01_crear_fichas.js, 02_datos_fichas.js, 03_consulta_fichas.js
│   ├── requisitos_proyeccion/         01_crear_coleccion.js, 02_insertar_documentos.js, 03_consulta_find.js
│   ├── reportes_incidentes/           01_crear_coleccion.js, 02_insertar_documentos.js, 03_consultas.js
│   └── resenas_peliculas/             01_crear_coleccion.js, 02_insertar_documentos.js, 03_consultas.js
└── evidencias/                        capturas de ejecución
entrega-final/
├── script-integracion/                módulo en Python: venta con comprobante en ambos motores
├── modulo-api/                        API FastAPI y front simple
├── evidencias/                        capturas y salidas de ejecución
├── informe-final-consolidado.pdf
└── portafolio-individual/             una reflexión en PDF por integrante
```

## Avance 1 – PostgreSQL

Núcleo transaccional. Entrega: jueves 15 de octubre de 2026, 11:59 AM.

El script `01_creacion_tablas.sql` crea 9 tablas: las 8 entidades del enunciado (`actores_directores`, `contratos`, `salas`, `funciones`, `tipos_boleta`, `ventas`, `espectadores`, `staff`) más `peliculas`. La tabla `peliculas` guarda el título, género, clasificación y duración una sola vez, para que `funciones` no repita esos datos; además es la fuente del identificador `id_pelicula` que se comparte con MongoDB.

En la Entrega final, el script `06_migracion_final.sql` agrega 2 tablas más, así que el modelo completo tiene **11 tablas**:

- `asientos`: mapa de sillas de cada sala (780 sillas, la suma por sala coincide con `salas.capacidad`).
- `boletas`: una fila por silla vendida, con un índice único por función y silla mientras la boleta esté vigente.

Contenido de `scripts/`:

| Script | Contenido |
|---|---|
| `01_creacion_tablas.sql` | 9 tablas con llaves primarias y foráneas, restricciones de integridad e índices |
| `02_datos_prueba.sql` | Datos de prueba: 37 películas, 30 funciones, 30 espectadores, 30 actores/directores, entre otros |
| `03_triggers.sql` | 8 triggers sobre 6 tablas, más la función `pruebas_triggers()` |
| `04_procedimientos.sql` | `sp_cancelar_funcion`, `sp_reporte_ventas` y `sp_mantenimiento_diario` |
| `05_consultas.sql` | 3 consultas con JOIN, agregaciones y subconsultas |
| `06_migracion_final.sql` | Tablas `asientos` y `boletas`, columna `idempotency_key` en `ventas` (única), boletas para las ventas del Avance 1, vista `v_estado_asientos`, 6 triggers nuevos (validación de boletas, cupo por boletas, liberación de sillas al anular y estados de funciones y ventas) y la función de pruebas `pruebas_migracion()` |

Con el script 06 el total es de 14 triggers.

Cómo ejecutar: correr los scripts de `scripts/` en orden, del 01 al 06, sobre una base de datos vacía. Para repetir la carga se vuelve a correr desde el 01, que borra y recrea las tablas; no se corre solo el 02 con los triggers ya creados. El 06 se corre siempre después de los cinco anteriores.

## Avance 2 – MongoDB

Capa documental y fundamentos teóricos (ACID, BASE, CAP).

| Colección | Identificadores compartidos con PostgreSQL | Validación `$jsonSchema` | Documentos |
|---|---|---|---|
| `fichas_tecnicas_peliculas` | `id_pelicula` | Sí | 37 |
| `requisitos_proyeccion` | `id_funcion`, `id_pelicula`, `id_sala` | Sí | 30 |
| `reportes_incidentes` | `id_funcion`, `id_pelicula`, `id_sala`, `id_staff`, `id_espectador` | Sí | 30 |
| `resenas_peliculas` | `id_pelicula`, `id_funcion`, `id_espectador`, `id_staff` (en `respuesta_empresa`) | Sí | 32 |

Las 4 colecciones tienen validación `$jsonSchema` y todos los identificadores de los datos de prueba existen en las tablas de PostgreSQL.

Cambio posterior a la entrega del Avance 2: las fichas técnicas se corrigieron para que cada versión lleve su propia duración y la ficha traiga la clasificación por país (`clasificaciones`). La clasificación de Colombia debe coincidir con la de PostgreSQL. Las capturas de la corrección están en `evidencias/` (archivos `ft_*_correcion*.png`).

La Entrega final agrega una quinta colección, `comprobantes_venta`, creada por el módulo de integración (ver más abajo).

### Diagrama de arquitectura políglota

El diagrama de `diagrama-arquitectura-poliglota/` fue realizado por **Estefania Paredes** y se actualizó para la Entrega final (`diagrama-arquitectura-poliglota-final1.png`). Muestra las 11 tablas de PostgreSQL, las 5 colecciones de MongoDB (las 4 del Avance 2 más `comprobantes_venta`), los identificadores que las unen y los flujos de venta, registro de reseñas e incidentes y lectura cruzada. No hay llaves foráneas entre motores: la coherencia entre ambos la mantiene la aplicación.

### Consultas MongoDB

| Colección | Consulta | Tipo |
|---|---|---|
| `fichas_tecnicas_peliculas` | Películas con más idiomas y versiones | Aggregation pipeline (`$unwind`, `$group`) |
| `requisitos_proyeccion` | Funciones en sala IMAX o 3D con su requisito técnico | `find` |
| `reportes_incidentes` | Incidentes graves sin cerrar | `find` |
| `reportes_incidentes` | Impacto de las fallas técnicas por sala | Aggregation pipeline |
| `reportes_incidentes` | Fallas técnicas por formato de sala, cruzadas con `requisitos_proyeccion` | Aggregation pipeline (`$lookup`) |
| `resenas_peliculas` | Calificación promedio por película con datos de su ficha técnica | Aggregation pipeline (`$group`, `$lookup`) |

En total son 6 consultas, 4 de ellas con aggregation pipeline.

### Cómo ejecutar

Abrir mongosh o la consola de Compass, seleccionar la base `cinema_avance2` y correr, dentro de la carpeta de cada colección, sus tres scripts en orden (creación, datos de prueba y consultas). El script de creación borra y recrea la colección, por lo que se puede repetir la carga.

Dependencias entre colecciones:

- La consulta con `$lookup` de `reportes_incidentes` necesita que `requisitos_proyeccion` ya esté cargada.
- La consulta con `$lookup` de `resenas_peliculas` necesita que `fichas_tecnicas_peliculas` ya esté cargada.

Al final de cada script `03` hay una inserción inválida que se rechaza con `Document failed validation`; es la evidencia de que el `$jsonSchema` funciona.

## Entrega final – Integración funcional

Conecta PostgreSQL (Neon) con MongoDB (Atlas) mediante un módulo en Python y una API con un front simple. Se construye sobre las dos fases anteriores: usa las tablas del Avance 1 (con el script 06) y las colecciones del Avance 2. Todo está en `entrega-final/`.

| Carpeta o archivo | Contenido |
|---|---|
| `script-integracion/` | Módulo en Python: venta con comprobante en ambos motores |
| `modulo-api/` | API FastAPI y front simple |
| `evidencias/` | Capturas (Swagger, `/health`, mapa de sillas, prueba de concurrencia) y salidas de ejecución en texto (casos 1 y 2, pruebas, demo y análisis de índices del caso 3) |
| `informe-final-consolidado.pdf` | Informe final del proyecto |
| `portafolio-individual/` | Una reflexión en PDF por integrante |

### Módulo de integración

| Archivo o comando | Contenido |
|---|---|
| `db.py` | Conexiones a PostgreSQL y MongoDB, con las claves en variables de entorno |
| `ventas_integradas.py` | La venta integrada: la saga entre PostgreSQL y MongoDB |
| `compensacion.py` | Deshace en MongoDB lo escrito si la venta falla |
| `preparar_mongo.py` | Crea la colección `comprobantes_venta` con `$jsonSchema` e índice único por `id_venta`; se corre una sola vez |
| `demo.py` | Tres escenarios con las bases reales: venta exitosa, venta rechazada por una regla del negocio y fallo de MongoDB con la venta revertida |
| `funcion_para_demo.sql` | Crea una función futura si las de los datos de prueba ya pasaron |
| `python -m pytest -v` | Corre las 20 pruebas automáticas (`test_integracion.py`) |
| `casos_1_y_2.sql` y `casos_1_y_2.js` | Casos de uso 1 y 2 |

La venta acepta opcionalmente una lista de sillas (`ids_asiento`) y una `idempotency_key`. Si no se envían sillas, el módulo asigna sillas libres de la sala (VIP para el tipo de boleta VIP, estándar para los demás).

Las pruebas usan PostgreSQL real y simulan MongoDB con `mongomock`. Para que corran todas hay que usar la cadena directa de Neon (sin `-pooler`); con el pooler una prueba se salta. Cinco de las 20 pruebas necesitan el script 06 y se saltan solas si la base no lo tiene.

### Transacción cruzada

La venta y sus boletas se guardan en PostgreSQL sin confirmar, después se guarda el comprobante en MongoDB y al final se confirma. Este flujo es la saga de venta.

| Situación | Resultado |
|---|---|
| Falla MongoDB al guardar el comprobante | La venta se revierte en PostgreSQL |
| Falla la confirmación en PostgreSQL | Se borra el comprobante de MongoDB |
| Llega la misma `idempotency_key` otra vez | Se devuelve la venta original sin duplicarla |
| Una silla ya está vendida para esa función | Se rechaza con error 409 y no queda comprobante |
| Se anula una venta | Se confirma en PostgreSQL (el trigger libera las sillas) y después se marca el comprobante como anulado en MongoDB |

Si MongoDB falla durante una anulación, la anulación se mantiene en PostgreSQL y el comprobante queda pendiente de actualizar (consistencia eventual).

### API y front

| Recurso | Dirección |
|---|---|
| Front | `http://localhost:8000/` |
| Documentación | `http://localhost:8000/docs` |
| Estado del servicio | `GET /health` |
| Cartelera | `GET /cartelera` y `GET /peliculas/{id_pelicula}` |
| Mapa de sillas de una función | `GET /funciones/{id}/sillas` |
| Compra y anulación | `POST /ventas` y `POST /ventas/{id}/anular` |
| Reseñas | `POST /resenas` y `GET /funciones/finalizadas` |
| Incidentes | `POST /incidentes` y `GET /salas/{id}/incidentes` |
| Caso 1: función con reseñas | `GET /casos/1/funcion-con-resenas` |
| Caso 2: película con requisitos | `GET /casos/2/pelicula-con-requisitos` |
| Caso 3: ventas con incidentes por sala | `GET /casos/3/ventas-con-incidentes` |
| Catálogos de apoyo | `GET /funciones`, `/tipos-boleta`, `/salas`, `/staff` y `/peliculas` |

Cada respuesta de error incluye un `request_id`, que también viaja en el encabezado `X-Request-ID`.

Códigos de error de la API:

| Código | Cuándo se responde |
|---|---|
| 409 | Conflicto, por ejemplo una silla ya ocupada, una reseña duplicada o una reseña sin compra |
| 422 | Datos que no pasan la validación, por ejemplo el error 121 de MongoDB |
| 404 y 503 | Recurso no encontrado y servicio no disponible |

Pantallas del front:

| Pantalla | Contenido |
|---|---|
| Compra | Mapa de sillas, selección, compra y anulación, con el resultado de cada operación y sus errores |
| Cartelera | Funciones que se pueden comprar, con sus sillas disponibles |
| Reseñas | Función con reseñas (caso 1) y formulario para registrar una reseña |
| Requisitos técnicos | Película con requisitos y pendientes por función (caso 2) |
| Incidentes por sala | Listado con filtros y registro de incidentes |
| Consistencia | Pantalla de revisión entre motores; llama a `/auditoria/consistencia`, un endpoint que todavía no está implementado en la API |

### Cómo ejecutar

Las tres fases se corren en este orden:

1. Avance 1: scripts del 01 al 06 en PostgreSQL, sobre una base vacía.
2. Avance 2: cargar las colecciones en la base `cinema_avance2` de MongoDB.
3. Entrega final: en `script-integracion/` y en `modulo-api/`, instalar las dependencias con `pip install -r requirements.txt` y copiar `.env.example` a `.env`, con las cadenas de conexión de Neon (`PG_DSN`) y de Atlas (`MONGO_URI`). El archivo `.env` no se sube a GitHub. Después, en `script-integracion/`, correr `python preparar_mongo.py` una sola vez.

Para iniciar la API, desde `modulo-api/`:

```
uvicorn app.main:app --reload --port 8000
```

Pruebas de la API, desde `modulo-api/` (con `pip install -r requirements-dev.txt`):

```
python -m pytest tests -v
python pruebas/concurrencia.py --funcion <id_funcion_futura> --hilos 10 --salida concurrencia.txt
```

La última ejecución guardada en `evidencias/` pasó las 51 pruebas de la API. La prueba de concurrencia lanza 10 compras simultáneas de la misma silla y espera una venta (201) y nueve rechazos (409).

En Windows se usa `py` en lugar de `python` si el comando no se reconoce.

Dependencias entre fases:

- La Entrega final necesita las tablas de PostgreSQL con el script 06 (sillas, boletas, cupo, estados e idempotencia) ya aplicado.
- Los casos 1, 2 y 3 necesitan las colecciones del Avance 2 cargadas en MongoDB (el caso 3, en particular, `reportes_incidentes`).
- Si se vuelve a correr el Avance 1 desde el 01, hay que volver a aplicar el 06 y repetir las cargas que dependan de esas tablas.

## Flujo de trabajo

Cada integrante trabaja en su rama y entra a `main` con Pull Request.
