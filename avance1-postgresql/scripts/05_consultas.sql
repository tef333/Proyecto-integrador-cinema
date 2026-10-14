-- 05_consultas.sql 
-- 05_consultas.sql
-- Avance 1, núcleo transaccional del cine
--
-- 3 consultas con JOIN, agregaciones y subconsultas:
--   1. Funciones con ocupación por debajo del promedio
--   2. Espectadores que gastan más que el promedio (clientes frecuentes)
--   3. Costo de contratos vs. ingresos de taquilla por función especial
--
-- Se corre DESPUÉS de 01, 02, 03 y 04. Solo lee datos (SELECT), no modifica nada.
-- Se cuentan solo ventas 'Pagada' y funciones no canceladas.

SET client_encoding = 'UTF8';


-- ---------------------------------------------------------------------
-- CONSULTA 1: Funciones con ocupación por debajo del promedio
-- Propósito de negocio: detectar las funciones ya realizadas que se
-- llenaron poco, para decidir si conviene programar menos funciones de
-- esa película u horario, usar una sala más pequeña o lanzar promociones.
-- Solo se analizan funciones Finalizada: las futuras todavía están
-- vendiendo y saldrían con ocupación baja sin que sea un problema real.
-- Técnicas: JOIN (funciones-salas), LEFT JOIN (ventas, para incluir
-- funciones sin ventas), SUM + GROUP BY, CTE y subconsulta escalar (AVG).
-- ---------------------------------------------------------------------
WITH ocupacion AS (
    SELECT f.id_funcion,
           f.titulo_pelicula,
           f.fecha_hora_inicio,
           s.nombre                                   AS sala,
           s.capacidad,
           COALESCE(SUM(v.cantidad), 0)               AS boletas_vendidas,
           ROUND(100.0 * COALESCE(SUM(v.cantidad), 0) / s.capacidad, 1) AS ocupacion_pct
    FROM funciones f
    JOIN salas s       ON s.id_sala = f.id_sala
    LEFT JOIN ventas v ON v.id_funcion = f.id_funcion
                      AND v.estado = 'Pagada'
    WHERE f.estado = 'Finalizada'
    GROUP BY f.id_funcion, f.titulo_pelicula, f.fecha_hora_inicio, s.nombre, s.capacidad
)
SELECT id_funcion,
       titulo_pelicula,
       fecha_hora_inicio,
       sala,
       capacidad,
       boletas_vendidas,
       ocupacion_pct,
       (SELECT ROUND(AVG(ocupacion_pct), 1) FROM ocupacion) AS promedio_general_pct
FROM ocupacion
WHERE ocupacion_pct < (SELECT AVG(ocupacion_pct) FROM ocupacion)
ORDER BY ocupacion_pct, fecha_hora_inicio;


-- ---------------------------------------------------------------------
-- CONSULTA 2: Espectadores que gastan más que el promedio
-- Propósito de negocio: identificar a los mejores clientes para
-- programas de fidelización (descuentos, preventas, invitaciones).
-- Técnicas: JOIN (ventas-espectadores), SUM/COUNT + GROUP BY, HAVING
-- con subconsulta que calcula el gasto promedio por espectador.
-- ---------------------------------------------------------------------
SELECT e.id_espectador,
       e.nombres || ' ' || e.apellidos             AS espectador,
       e.puntos_acumulados,
       COUNT(*)                                    AS compras,
       SUM(v.cantidad)                             AS boletas,
       SUM(v.cantidad * v.precio_unitario)         AS total_gastado
FROM espectadores e
JOIN ventas v ON v.id_espectador = e.id_espectador
WHERE v.estado = 'Pagada'
GROUP BY e.id_espectador, e.nombres, e.apellidos, e.puntos_acumulados
HAVING SUM(v.cantidad * v.precio_unitario) > (
        SELECT AVG(gasto)
        FROM (
            SELECT SUM(cantidad * precio_unitario) AS gasto
            FROM ventas
            WHERE estado = 'Pagada'
            GROUP BY id_espectador
        ) t
    )
ORDER BY total_gastado DESC;


-- ---------------------------------------------------------------------
-- CONSULTA 3: Costo de contratos vs. ingresos de taquilla por función
-- Propósito de negocio: saber si las funciones especiales (estrenos,
-- conversatorios, presentaciones) con actores o directores contratados
-- se pagan solas con la taquilla o dan pérdida.
-- Técnicas: JOIN de 3 fuentes, subconsultas en el FROM que agregan
-- contratos y ventas por separado (así los valores no se multiplican
-- por el cruce de filas) y cálculo del balance.
-- Nota: en funciones aún Programada el balance es parcial, porque la
-- taquilla sigue vendiendo; por eso se muestra el estado de la función.
-- ---------------------------------------------------------------------
SELECT f.id_funcion,
       f.titulo_pelicula,
       f.fecha_hora_inicio::DATE                    AS fecha_funcion,
       f.estado                                     AS estado_funcion,
       c.artistas_contratados,
       c.costo_contratos,
       COALESCE(t.ingresos, 0)                      AS ingresos_taquilla,
       COALESCE(t.ingresos, 0) - c.costo_contratos  AS balance
FROM funciones f
JOIN (
    SELECT id_funcion,
           COUNT(*)  AS artistas_contratados,
           SUM(valor) AS costo_contratos
    FROM contratos
    WHERE estado <> 'Cancelado'
    GROUP BY id_funcion
) c ON c.id_funcion = f.id_funcion
LEFT JOIN (
    SELECT id_funcion,
           SUM(cantidad * precio_unitario) AS ingresos
    FROM ventas
    WHERE estado = 'Pagada'
    GROUP BY id_funcion
) t ON t.id_funcion = f.id_funcion
WHERE f.estado <> 'Cancelada'
ORDER BY balance;
