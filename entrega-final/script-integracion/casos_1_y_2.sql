-- Casos de uso de INTEGRACION 1 y 2: mitad PostgreSQL (la mitad MongoDB esta en casos_1_y_2.js).
-- La API (app/rutas/casos_integracion.py) ejecuta ambas y une los resultados por id_funcion / id_pelicula.
-- Ejecutar en psql o en el editor de Neon.

-- ---------------------------------------------------------------------------
-- CASO 1: funcion con sus resenas (id_funcion = 10).
-- PostgreSQL confirma que la funcion existe y da su contexto; las resenas salen de MongoDB (resenas_peliculas).
-- ---------------------------------------------------------------------------
SELECT f.id_funcion, f.id_pelicula, p.titulo, p.genero, p.clasificacion,
       s.id_sala, s.nombre AS sala, s.tipo_sala, f.idioma, f.fecha_hora_inicio, f.estado
FROM funciones f
JOIN peliculas p ON p.id_pelicula = f.id_pelicula
JOIN salas s     ON s.id_sala = f.id_sala
WHERE f.id_funcion = 10;

-- ---------------------------------------------------------------------------
-- CASO 2: pelicula con sus requisitos tecnicos (id_pelicula = 10).
-- PostgreSQL entrega la pelicula y todas sus funciones; los requisitos de cada funcion salen de MongoDB
-- (requisitos_proyeccion) y se cruzan por id_funcion.
-- ---------------------------------------------------------------------------
SELECT id_pelicula, titulo, genero, clasificacion, duracion_min
FROM peliculas WHERE id_pelicula = 10;

SELECT f.id_funcion, s.id_sala, s.nombre AS sala, s.tipo_sala, f.idioma,
       f.fecha_hora_inicio, f.estado
FROM funciones f
JOIN salas s ON s.id_sala = f.id_sala
WHERE f.id_pelicula = 10
ORDER BY f.fecha_hora_inicio;
