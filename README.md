# Proyecto integrador – Altamira Cine

Grupo: Cinemas 3 (Altamira Cine)

Altamira Cine es una empresa de cine de Bogotá, Colombia, con cartelera comercial de estrenos combinada con cine colombiano y latinoamericano. Opera en un solo complejo de 6 salas (780 sillas, 700 en operación mientras la sala 4DX está en mantenimiento) y tiene 30 actores y directores registrados.

El proyecto combina un núcleo transaccional en PostgreSQL (Avance 1), una capa documental en MongoDB (Avance 2) y la integración funcional de ambos motores con un módulo en Python y una API con front (Entrega final). Cada fase se apoya en la anterior. Los dos motores se conectan mediante identificadores compartidos, sin llaves foráneas entre ellos.

## Integrantes

| # | Integrante | Usuario GitHub | Avance 1 | Avance 2 | Entrega final |
|---|---|---|---|---|---|
| 1 | Estefania Paredes | tef333 | Modelo ER, modelo relacional y creación de tablas | Colección `reportes_incidentes`, diagrama de arquitectura políglota y sección CAP | API y front de ventas y sillas (comprar, anular, mapa de sillas), caso 3, prueba de concurrencia y sección de casos de uso y concurrencia del informe |
| 2 | Jose Espin | jespinn | Triggers | Colección `requisitos_proyeccion` y sección ACID | Módulo de integración (conexión a ambos motores y transacción cruzada) |
| 3 | Santiago Rojas | Srojas-ga y Shellingbump85 | Procedimientos almacenados | Colección `fichas_tecnicas_peliculas` y sección BASE | Casos de uso con reseñas, requisitos e incidentes |
| 4 | Erika Gomez | Eri-02 | Consultas SQL e informe PDF | Colección `resenas_peliculas`, integración e informe del Avance 2 | PostgreSQL y migración, informe final consolidado |

## Estructura del repositorio

```
avance1-postgresql/
├── avance1-informe.pdf
├── modelo-er/                  Modelo Entidad Cinema.drawio.pdf
├── modelo-relacional/          modelo relacional corregido feedback.pdf
├── scripts/                    01_creacion_tablas.sql … 06 (sillas, boletas e idempotencia)
└── evidencias/                 capturas de ejecución
avance2-mongodb/
├── diagrama-arquitectura-poliglota/   diagrama-arquitectura-poliglota.pdf
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

El modelo tiene 9 tablas: las 8 entidades del enunciado (`actores_directores`, `contratos`, `salas`, `funciones`, `tipos_boleta`, `ventas`, `espectadores`, `staff`) más `peliculas`. La tabla `peliculas` guarda el título, género, clasificación y duración una sola vez, para que `funciones` no repita esos datos; además es la fuente del identificador `id_pelicula` que se comparte con MongoDB.

Contenido de `scripts/`:

| Script | Contenido |
|---|---|
| `01_creacion_tablas.sql` | 9 tablas con llaves primarias y foráneas, restricciones de integridad e índices |
| `02_datos_prueba.sql` | Datos de prueba: 37 películas, 30 funciones, 30 espectadores, 30 actores/directores, entre otros |
| `03_triggers.sql` | 8 triggers sobre 6 tablas, más la función `pruebas_triggers()` |
| `04_procedimientos.sql` | `sp_cancelar_funcion`, `sp_reporte_ventas` y `sp_mantenimiento_diario` |
| `05_consultas.sql` | 3 consultas con JOIN, agregaciones y subconsultas |
| `06` (agregado en la Entrega final) | Sillas, boletas y clave de idempotencia de las ventas |

Cómo ejecutar: correr los scripts de `scripts/` en orden, del 01 al 06, sobre una base de datos vacía. Para repetir la carga se vuelve a correr desde el 01, que borra y recrea las tablas; no se corre solo el 02 con los triggers ya creados.

## Avance 2 – MongoDB

Capa documental y fundamentos teóricos (ACID, BASE, CAP).

| Colección | Identificadores compartidos con PostgreSQL | Validación `$jsonSchema` | Documentos |
|---|---|---|---|
| `fichas_tecnicas_peliculas` | `id_pelicula` | Sí | 37 |
| `requisitos_proyeccion` | `id_funcion`, `id_pelicula`, `id_sala` | Sí | 30 |
| `reportes_incidentes` | `id_funcion`, `id_pelicula`, `id_sala`, `id_staff`, `id_espectador` | Sí | 30 |
| `resenas_peliculas` | `id_pelicula`, `id_funcion`, `id_espectador`, `id_staff` (en `respuesta_empresa`) | Sí | 32 |

Las 4 colecciones tienen validación `$jsonSchema` y todos los identificadores de los datos de prueba existen en las tablas de PostgreSQL.

### Diagrama de arquitectura políglota

El diagrama de `diagrama-arquitectura-poliglota/` fue realizado por **Estefania Paredes**. Muestra las 9 tablas de PostgreSQL, las 4 colecciones de MongoDB y los identificadores que las unen. No hay llaves foráneas entre motores: la coherencia entre ambos la mantiene la aplicación.

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
| `evidencias/` | Capturas y salidas de ejecución |
| `informe-final-consolidado.pdf` | Informe final del proyecto |
| `portafolio-individual/` | Una reflexión en PDF por integrante |

### Módulo de integración

| Archivo o comando | Contenido |
|---|---|
| `preparar_mongo.py` | Crea la colección `comprobantes_venta`; se corre una sola vez |
| `demo.py` | Tres escenarios con las bases reales: venta exitosa, venta rechazada por una regla del negocio y fallo de MongoDB con la venta revertida |
| `python -m pytest -v` | Corre las 20 pruebas automáticas |
| `casos_1_y_2.sql` y `casos_1_y_2.js` | Casos de uso 1 y 2 |

### Transacción cruzada

La venta y sus boletas se guardan en PostgreSQL sin confirmar, después se guarda el comprobante en MongoDB y al final se confirma.

| Situación | Resultado |
|---|---|
| Falla MongoDB al guardar el comprobante | La venta se revierte en PostgreSQL |
| Falla la confirmación en PostgreSQL | Se borra el comprobante de MongoDB |
| Llega la misma `idempotency_key` otra vez | Se devuelve la venta original sin duplicarla |

### API y front

| Recurso | Dirección |
|---|---|
| Front | `http://localhost:8000/` |
| Documentación | `http://localhost:8000/docs` |
| Caso 3: ventas con incidentes por sala | `GET /casos/3/ventas-con-incidentes` |

La API responde los errores con los códigos 404, 409, 422 y 503.

### Cómo ejecutar

Las tres fases se corren en este orden:

1. Avance 1: scripts del 01 al 06 en PostgreSQL, sobre una base vacía.
2. Avance 2: cargar las colecciones en la base `cinema_avance2` de MongoDB.
3. Entrega final: en `script-integracion/` y en `modulo-api/`, instalar las dependencias con `pip install -r requirements.txt` y copiar `.env.example` a `.env`, con las cadenas de conexión de Neon (`PG_DSN`) y de Atlas (`MONGO_URI`). El archivo `.env` no se sube a GitHub.

Para iniciar la API, desde `modulo-api/`:

```
uvicorn app.main:app --reload --port 8000
```

En Windows se usa `py` en lugar de `python` si el comando no se reconoce.

Dependencias entre fases:

- La Entrega final necesita las tablas de PostgreSQL con el script 06 (sillas, boletas e idempotencia) ya aplicado.
- El caso 3 necesita que `reportes_incidentes` esté cargada en MongoDB.
- Si se vuelve a correr el Avance 1 desde el 01, hay que volver a aplicar el 06 y repetir las cargas que dependan de esas tablas.

## Flujo de trabajo

Cada integrante trabaja en su rama y entra a `main` con Pull Request.
