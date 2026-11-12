# Proyecto integrador – Altamira Cine

Altamira Cine es una empresa de cine de Bogotá, Colombia, con cartelera comercial de estrenos combinada con cine colombiano y latinoamericano. Opera en un solo complejo de 6 salas (780 sillas, 700 en operación mientras la sala 4DX está en mantenimiento) y tiene 30 actores y directores registrados.

El proyecto combina un núcleo transaccional en PostgreSQL (Avance 1) con una capa documental en MongoDB (Avance 2). Los dos motores se conectan mediante identificadores compartidos, sin llaves foráneas entre ellos.

## Integrantes

| # | Integrante | Usuario GitHub | Avance 1 | Avance 2 |
|---|---|---|---|---|
| 1 | Estefania Paredes | tef333 | Modelo ER, modelo relacional y creación de tablas | Colección `reportes_incidentes`, diagrama de arquitectura políglota y sección CAP |
| 2 | Jose Espin | jespinn | Triggers | Colección `requisitos_proyeccion` y sección ACID |
| 3 | Santiago Rojas | Srojas-ga | Procedimientos almacenados | Colección `fichas_tecnicas_peliculas` y sección BASE |
| 4 | Erika Gomez | Eri-02 | Consultas SQL e informe PDF | Colección `resenas_peliculas`, integración e informe del Avance 2 |

## Estructura del repositorio

```
avance1-postgresql/
├── avance1-informe.pdf
├── modelo-er/                  modelo-entidad-relacion.pdf
├── modelo-relacional/          modelo_relacional_3fn_final.pdf
├── scripts/                    01_creacion_tablas.sql … 05_consultas.sql
└── evidencias/                 capturas de ejecución
avance2-mongodb/
├── diagrama-arquitectura-poliglota/   diagrama-arquitectura-poliglota.pdf
├── scripts/
│   ├── fichas_tecnicas_peliculas/     01_crear_fichas.js, 02_datos_fichas.js, 03_consulta_fichas.js
│   ├── requisitos_proyeccion/         01_crear_coleccion.js, 02_insertar_documentos.js, 03_consulta_find.js
│   ├── reportes_incidentes/           01_crear_coleccion.js, 02_insertar_documentos.js, 03_consultas.js
│   └── resenas_peliculas/             creación, datos de prueba y consultas
└── evidencias/                        capturas de ejecución
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

Cómo ejecutar: correr los scripts de `scripts/` en orden, del 01 al 05, sobre una base de datos vacía. Para repetir la carga se vuelve a correr desde el 01, que borra y recrea las tablas; no se corre solo el 02 con los triggers ya creados.

## Avance 2 – MongoDB

Capa documental y fundamentos teóricos (ACID, BASE, CAP). Entrega: jueves 12 de noviembre de 2026, 11:59 AM.

| Colección | Identificadores compartidos con PostgreSQL | Validación `$jsonSchema` | Documentos |
|---|---|---|---|
| `fichas_tecnicas_peliculas` | `id_pelicula` | Sí | 37 |
| `requisitos_proyeccion` | `id_funcion`, `id_pelicula`, `id_sala` | Sí | 30 |
| `reportes_incidentes` | `id_funcion`, `id_pelicula`, `id_sala`, `id_staff`, `id_espectador` | Sí | 30 |
| `resenas_peliculas` | `id_pelicula`, `id_espectador` | — | — |

El diagrama de `diagrama-arquitectura-poliglota/` muestra las 9 tablas de PostgreSQL, las 4 colecciones y los identificadores que las unen. No hay llaves foráneas entre motores: la coherencia entre ambos la mantiene la aplicación.

Cómo ejecutar: abrir mongosh o la consola de Compass, seleccionar la base `cinema_avance2` y correr, dentro de la carpeta de cada colección, sus tres scripts en orden (creación, datos de prueba y consultas). El script de creación borra y recrea la colección, por lo que se puede repetir la carga. La consulta con `$lookup` de `reportes_incidentes` necesita que `requisitos_proyeccion` ya esté cargada.

## Flujo de trabajo

Cada integrante trabaja en su rama y entra a `main` con Pull Request.
