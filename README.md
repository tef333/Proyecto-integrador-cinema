# Proyecto integrador – Altamira Cine

Empresa de cine en Bogotá, Colombia. El proyecto combina un núcleo transaccional en PostgreSQL (Avance 1) con una capa documental en MongoDB (Avance 2).

## Integrantes
| # | Integrante | Usuario GitHub | Avance 1 | Avance 2 |
|---|---|---|---|---|
| 1 | Estefania Paredes | tef333 | Modelo ER, modelo relacional y creación de tablas | Diagrama de arquitectura políglota y sección CAP |
| 2 | Jose Espin | jespinn | Triggers | Colección `requisitos_proyeccion` y sección ACID |
| 3 | Santiago Rojas | Srojas-ga | Procedimientos almacenados | Colección `fichas_tecnicas_peliculas` y sección BASE |
| 4 | Erika Gomez | Eri-02 | Consultas SQL e informe PDF | Colección `resenas_peliculas`, integración e informe |

## Avance 1 – PostgreSQL
Núcleo transaccional. Entrega: jueves 15 de octubre de 2026, 11:59 AM.

Estructura: `avance1-postgresql/` con `modelo-er/`, `modelo-relacional/`, `scripts/` y `evidencias/`.

Cómo ejecutar: correr los scripts de `scripts/` en orden, del 01 al 05, sobre una base de datos vacía. Para repetir la carga se vuelve a correr desde el 01, que borra y recrea las tablas; no se corre solo el 02 con los triggers ya creados.

## Avance 2 – MongoDB
Capa documental y fundamentos teóricos (ACID, BASE, CAP). Entrega: jueves 12 de noviembre de 2026, 11:59 AM.

Colecciones: `fichas_tecnicas_peliculas`, `requisitos_proyeccion`, `resenas_peliculas` y `reportes_incidentes`. Se conectan con PostgreSQL por identificadores compartidos (`id_pelicula`, `id_funcion`, `id_sala`, `id_staff`, `id_espectador`).

Estructura: `avance2-mongodb/` con `diagrama-arquitectura-poliglota/`, `scripts/` y `evidencias/`.

Cómo ejecutar: en mongosh o en la consola de Compass, sobre la base `cinema_avance2`, correr los scripts de `scripts/` en orden: `01_creacion_colecciones.js`, `02_datos_prueba.js` y `03_consultas.js`. El 01 borra y recrea las colecciones, por lo que se puede repetir la carga. La consulta con `$lookup` necesita que `requisitos_proyeccion` esté cargada.

## Flujo de trabajo
Cada integrante trabaja en su rama y entra a `main` con Pull Request.
