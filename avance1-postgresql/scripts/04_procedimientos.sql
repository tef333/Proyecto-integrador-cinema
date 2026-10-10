-- 04_procedimientos.sql
-- Avance 1, núcleo transaccional del cine
--
-- 3 procedimientos almacenados:
--   1. sp_cancelar_funcion         cálculo / transacción
--   2. sp_reporte_ventas           reporte con agregación
--   3. sp_mantenimiento_diario     mantenimiento / operación
SET client_encoding = 'UTF8';

-- 1. sp_cancelar_funcion
-- Cálculo / transacción: cancela una función programada y todo lo que
-- depende de ella, en una sola transacción:
--   - calcula el valor a reembolsar (ventas pagadas de la función)
--   - anula las ventas pagadas
--   - cancela los contratos vigentes de la función
--   - marca la función como Cancelada
CREATE OR REPLACE PROCEDURE sp_cancelar_funcion(
    p_id_funcion INTEGER,
    p_motivo     VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado    funciones.estado%TYPE;
    v_ventas    INTEGER;
    v_reembolso NUMERIC(14,2);
    v_contratos INTEGER;
BEGIN
    SELECT estado INTO v_estado
    FROM funciones
    WHERE id_funcion = p_id_funcion
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La función % no existe', p_id_funcion;
    END IF;

    IF v_estado <> 'Programada' THEN
        RAISE EXCEPTION 'Solo se cancelan funciones programadas; la función % está %',
            p_id_funcion, v_estado;
    END IF;

    SELECT COUNT(*), COALESCE(SUM(cantidad * precio_unitario), 0)
    INTO v_ventas, v_reembolso
    FROM ventas
    WHERE id_funcion = p_id_funcion
      AND estado = 'Pagada';

    UPDATE ventas
    SET estado = 'Anulada'
    WHERE id_funcion = p_id_funcion
      AND estado = 'Pagada';

    UPDATE contratos
    SET estado = 'Cancelado'
    WHERE id_funcion = p_id_funcion
      AND estado = 'Vigente';
    GET DIAGNOSTICS v_contratos = ROW_COUNT;

    UPDATE funciones
    SET estado = 'Cancelada'
    WHERE id_funcion = p_id_funcion;

    RAISE NOTICE 'Función % cancelada (motivo: %). Ventas anuladas: %, reembolso total: $%, contratos cancelados: %',
        p_id_funcion, COALESCE(p_motivo, 'sin motivo'), v_ventas, v_reembolso, v_contratos;

EXCEPTION
    WHEN raise_exception THEN
        RAISE;   -- errores de negocio y de triggers, con su mensaje original
    WHEN OTHERS THEN
        RAISE EXCEPTION 'sp_cancelar_funcion: error inesperado (%): %', SQLSTATE, SQLERRM;
END;
$$;


-- 2. sp_reporte_ventas
-- Reporte con agregación: por película, en un rango de fechas de función,
-- muestra cuántas funciones tuvo, boletas vendidas, ingresos y el
-- porcentaje de ocupación (boletas vendidas / capacidad de las salas).
-- No cuenta funciones canceladas ni ventas anuladas.
-- El resultado sale por mensajes (NOTICE).
CREATE OR REPLACE PROCEDURE sp_reporte_ventas(
    p_desde DATE,
    p_hasta DATE
)
LANGUAGE plpgsql
AS $$
DECLARE
    r                RECORD;
    v_filas          INTEGER := 0;
    v_total_boletas  BIGINT  := 0;
    v_total_ingresos NUMERIC := 0;
BEGIN
    IF p_desde IS NULL OR p_hasta IS NULL THEN
        RAISE EXCEPTION 'Las fechas del reporte son obligatorias';
    END IF;

    IF p_desde > p_hasta THEN
        RAISE EXCEPTION 'Rango inválido: la fecha inicial (%) es posterior a la final (%)',
            p_desde, p_hasta;
    END IF;

    RAISE NOTICE '=== Reporte de ventas del % al % ===', p_desde, p_hasta;

    FOR r IN
        WITH por_funcion AS (
            SELECT f.id_funcion,
                   f.titulo_pelicula,
                   s.capacidad,
                   COALESCE(SUM(v.cantidad), 0)                     AS boletas,
                   COALESCE(SUM(v.cantidad * v.precio_unitario), 0) AS ingresos
            FROM funciones f
            JOIN salas s ON s.id_sala = f.id_sala
            LEFT JOIN ventas v ON v.id_funcion = f.id_funcion
                              AND v.estado <> 'Anulada'
            WHERE f.estado <> 'Cancelada'
              AND f.fecha_hora_inicio::DATE BETWEEN p_desde AND p_hasta
            GROUP BY f.id_funcion, f.titulo_pelicula, s.capacidad
        )
        SELECT titulo_pelicula,
               COUNT(*)                                          AS funciones,
               SUM(boletas)                                      AS boletas,
               SUM(ingresos)                                     AS ingresos,
               ROUND(100.0 * SUM(boletas) / SUM(capacidad), 1)   AS ocupacion
        FROM por_funcion
        GROUP BY titulo_pelicula
        ORDER BY SUM(ingresos) DESC, titulo_pelicula
    LOOP
        v_filas          := v_filas + 1;
        v_total_boletas  := v_total_boletas + r.boletas;
        v_total_ingresos := v_total_ingresos + r.ingresos;
        RAISE NOTICE '% | funciones: % | boletas: % | ingresos: $% | ocupación: %',
            r.titulo_pelicula, r.funciones, r.boletas, r.ingresos, r.ocupacion || '%';
    END LOOP;

    IF v_filas = 0 THEN
        RAISE NOTICE 'No hay funciones en ese rango de fechas';
    ELSE
        RAISE NOTICE 'TOTAL: % películas, % boletas, $% en ingresos',
            v_filas, v_total_boletas, v_total_ingresos;
    END IF;

EXCEPTION
    WHEN raise_exception THEN
        RAISE;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'sp_reporte_ventas: error inesperado (%): %', SQLSTATE, SQLERRM;
END;
$$;


-- 3. sp_mantenimiento_diario
-- Mantenimiento / operación: pensado para correr periódicamente.
--   - funciones programadas o en curso cuya hora de fin ya pasó -> Finalizada
--   - funciones programadas que ya empezaron y no terminan -> En curso
--   - contratos vigentes con fecha_fin anterior a hoy -> Finalizado
CREATE OR REPLACE PROCEDURE sp_mantenimiento_diario()
LANGUAGE plpgsql
AS $$
DECLARE
    v_finalizadas INTEGER;
    v_en_curso    INTEGER;
    v_contratos   INTEGER;
BEGIN
    UPDATE funciones
    SET estado = 'Finalizada'
    WHERE estado IN ('Programada', 'En curso')
      AND fecha_hora_inicio + duracion_min * INTERVAL '1 minute' <= NOW();
    GET DIAGNOSTICS v_finalizadas = ROW_COUNT;

    UPDATE funciones
    SET estado = 'En curso'
    WHERE estado = 'Programada'
      AND fecha_hora_inicio <= NOW();
    GET DIAGNOSTICS v_en_curso = ROW_COUNT;

    UPDATE contratos
    SET estado = 'Finalizado'
    WHERE estado = 'Vigente'
      AND fecha_fin < CURRENT_DATE;
    GET DIAGNOSTICS v_contratos = ROW_COUNT;

    RAISE NOTICE 'Mantenimiento: % funciones finalizadas, % pasaron a en curso, % contratos finalizados',
        v_finalizadas, v_en_curso, v_contratos;

EXCEPTION
    WHEN raise_exception THEN
        RAISE;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'sp_mantenimiento_diario: error inesperado (%): %', SQLSTATE, SQLERRM;
END;
$$;
