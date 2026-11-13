# Altamira Cine — Proyecto Integrador (Cinemas 3)

Sistema de información para **Altamira Cine**, un complejo de cine en Bogotá, Colombia. Combina cartelera comercial de estrenos con cine colombiano y latinoamericano, y organiza funciones especiales con artistas invitados (estrenos con elenco, conversatorios con directores y presentaciones en vivo).

El nombre viene de la cueva de Altamira (España), donde están algunas de las primeras imágenes pintadas por seres humanos: contar historias con imágenes es mucho más antiguo que el cine.

Proyecto integrador de **Bases de Datos 2** — Universidad El Bosque, 2026-2. Grupo **Cinemas 3** (4 integrantes).

---

## Arquitectura políglota

El sistema usa dos motores, cada uno para lo que mejor hace:

| Motor | Rol | Qué almacena |
| --- | --- | --- |
| **PostgreSQL** | Núcleo transaccional (ACID) | Películas, funciones, salas, boletas, tarifas, clientes, puntos de fidelización, artistas y contratos |
| **MongoDB** | Capa documental (BASE) | Fichas técnicas, requisitos de proyección, reseñas e incidentes |

Ambos motores se conectan mediante **identificadores compartidos** (`id_pelicula`, `id_funcion`), que existen como llaves en PostgreSQL y como campos de referencia en las colecciones de MongoDB.

El **diagrama de arquitectura políglota fue realizado por Estefania Paredes** y se encuentra en `avance2-mongodb/diagrama-arquitectura-poliglota/`.

---

## Avances del proyecto

### Avance 1 — Núcleo relacional (PostgreSQL)

Carpeta `avance1-postgresql/`: modelo entidad-relación, modelo relacional (9 tablas, incluida `peliculas` con FK desde `funciones`), scripts de creación, datos de prueba, triggers y procedimientos.

### Avance 2 — Capa documental (MongoDB) y fundamentos teóricos

Carpeta `avance2-mongodb/`. Incluye:

- Diseño de las 4 colecciones con justificación de embebido vs referenciado.
- Scripts de creación (con `$jsonSchema`), datos de prueba (mínimo 30 documentos por colección) y consultas (con `aggregation pipeline`).
- Diagrama de arquitectura políglota.
- Evidencias de ejecución real (capturas con comando y resultado).
- Justificación teórica ACID / BASE / CAP aplicada al dominio del cine.

| Colección | Contenido | Identificador compartido |
| --- | --- | --- |
| `fichas_tecnicas_peliculas` | Elenco, duración por versión, idiomas, subtítulos, clasificación por país | `id_pelicula` |
| `requisitos_proyeccion` | Requerimientos técnicos por función especial (IMAX, 3D, Dolby Atmos, subtitulado) | `id_funcion` |
| `resenas_peliculas` | Texto libre, calificación, fecha, respuesta de la empresa | `id_pelicula` |
| `reportes_incidentes` | Fallas técnicas, quejas de servicio, incidentes de seguridad | `id_funcion` / sala |

> Al ser un grupo de 4 integrantes, no aplican los elementos adicionales del grupo de 5.

---

## Estructura del repositorio

```
Proyecto-integrador-cinema/
├── README.md
├── avance1-postgresql/
│   └── scripts/                      (creación, datos, triggers, procedimientos)
└── avance2-mongodb/
    ├── diagrama-arquitectura-poliglota/   (imagen o PDF)
    ├── scripts/
    │   ├── 01_creacion_colecciones.js
    │   ├── 02_datos_prueba.js
    │   ├── 03_consultas.js
    │   └── reportes_incidentes/
    └── evidencias/                        (capturas de ejecución real)
```

---

## Reglas de negocio principales

- **Tarifas diferenciadas:** general, estudiante, niño, adulto mayor y VIP. El precio queda guardado en cada venta, así un cambio de tarifa no altera las ventas anteriores.
- **Fidelización:** cada espectador tiene un saldo de puntos asociado a su registro.
- **Control de edad:** cada película tiene clasificación (todo público, +7, +12, +15, +18) verificada al vender la boleta.
- **Contratos con artistas:** ligados a una función específica, gestionados por un administrador o coordinador, con vigencia definida.
- **Control de aforo:** nunca se venden más boletas que la capacidad de la sala, ni para funciones iniciadas o canceladas.
- **Pagos:** en efectivo solo en taquilla; la venta en línea no requiere intervención de un empleado.

### Salas

| Sala | Formato | Sillas |
| --- | --- | --- |
| Sala 1 | 2D | 150 |
| Sala 2 | 2D | 150 |
| Sala 3 | 3D | 120 |
| Sala VIP | Preferencial | 60 |
| Sala IMAX | IMAX | 220 |
| Sala 4DX | 4DX (en mantenimiento) | 80 |

Capacidad total: 780 sillas; 700 en operación mientras la Sala 4DX siga en mantenimiento.

---

## Integrantes y responsabilidades

| Integrante | Responsabilidades |
| --- | --- |
| **Estefania Paredes (tef333)** | Script 01 y datos de catálogo (02) en PostgreSQL; modelos ER y relacional (9 tablas); **diagrama de arquitectura políglota**; sección CAP; colección `reportes_incidentes` |
| **Jose (jespinn)** | Script 03 (triggers con JOIN a `peliculas`, `pruebas_triggers()`); sección ACID; colección `requisitos_proyeccion` |
| **Santiago Rojas (Srojas-ga)** | Script 04 e INSERT de funciones con `id_pelicula`; colección `fichas_tecnicas_peliculas`; sección BASE |
| **Erika Gómez (Eri-02)** | Script 05; colección `resenas_peliculas`; integración, portada y formato del informe PDF; actualización del informe del Avance 1 |

---

## Cómo ejecutar

**PostgreSQL:** ejecutar en orden los scripts de `avance1-postgresql/scripts/`.

**MongoDB** (mongosh, Compass o Atlas):

```bash
mongosh "<cadena-de-conexión>" avance2-mongodb/scripts/01_creacion_colecciones.js
mongosh "<cadena-de-conexión>" avance2-mongodb/scripts/02_datos_prueba.js
mongosh "<cadena-de-conexión>" avance2-mongodb/scripts/03_consultas.js
```

Los scripts de `reportes_incidentes/` se ejecutan igual desde su subcarpeta.
