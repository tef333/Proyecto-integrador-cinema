-- 03_triggers.sql
-- Avance 1, núcleo transaccional del cine
--
-- 7 triggers sobre 6 de las 8 tablas:
--   1. funciones           trg_funciones_validar_programacion
--   2. ventas              trg_ventas_validar_cupo
--   3. ventas              trg_ventas_validar_edad
--   4. salas               trg_salas_validar_cambios
--   5. contratos           trg_contratos_validar
--   6. actores_directores  trg_actores_validar_inactivacion
--   7. espectadores        trg_espectadores_normalizar
--
-- Cada trigger cubre una regla que un CHECK no puede validar, porque
-- necesita consultar otras filas u otras tablas, o corregir el dato
-- antes de guardarlo.
-- Al final del archivo hay una sección de verificación que prueba cada
-- trigger y deshace los datos de prueba.

SET client_encoding = 'UTF8';


-- 1. FUNCIONES: programación válida
-- Tabla: funciones, antes de insertar o modificar.
-- Regla: una función programada solo puede ir en una sala activa y no
-- puede cruzarse en horario con otra función de la misma sala.
-- Por qué trigger: el cruce depende de las demás funciones de la sala y
-- el estado depende de la tabla salas. El UNIQUE de sala y hora solo
-- detecta funciones que empiezan exactamente a la misma hora.

CREATE OR REPLACE FUNCTION fn_funciones_validar_programacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_sala salas.estado%TYPE;
    v_choque      funciones.id_funcion%TYPE;
    v_fin_nueva   TIMESTAMP;
BEGIN
    -- Solo se valida lo que va a ocupar la sala.
    IF NEW.estado <> 'Programada' THEN
        RETURN NEW;
    END IF;

    -- FOR UPDATE bloquea la sala: si dos personas programan en la misma
    -- sala al mismo tiempo, la segunda espera y sí ve la función de la primera.
    SELECT estado INTO v_estado_sala
    FROM salas
    WHERE id_sala = NEW.id_sala
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La sala % no existe', NEW.id_sala;
    END IF;

    IF v_estado_sala <> 'Activa' THEN
        RAISE EXCEPTION 'No se puede programar en la sala %: está en estado %',
            NEW.id_sala, v_estado_sala;
    END IF;

    -- Dos funciones se cruzan si cada una empieza antes de que la otra termine.
    v_fin_nueva := NEW.fecha_hora_inicio + NEW.duracion_min * INTERVAL '1 minute';

    SELECT f.id_funcion INTO v_choque
    FROM funciones f
    WHERE f.id_sala = NEW.id_sala
      AND f.id_funcion <> NEW.id_funcion
      AND f.estado <> 'Cancelada'
      AND f.fecha_hora_inicio < v_fin_nueva
      AND NEW.fecha_hora_inicio < f.fecha_hora_inicio + f.duracion_min * INTERVAL '1 minute'
    LIMIT 1;

    IF FOUND THEN
        RAISE EXCEPTION 'La sala % ya tiene la función % en ese horario',
            NEW.id_sala, v_choque;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_funciones_validar_programacion
BEFORE INSERT OR UPDATE OF id_sala, fecha_hora_inicio, duracion_min, estado
ON funciones
FOR EACH ROW
EXECUTE FUNCTION fn_funciones_validar_programacion();


-- 2. VENTAS: cupo de la función
-- Tabla: ventas, antes de insertar o modificar.
-- Regla: solo se venden boletas para funciones programadas que no han
-- empezado, sin pasar la capacidad de la sala y con un tipo de boleta
-- activo. Si la venta llega sin precio, toma el precio vigente del tipo
-- de boleta y lo deja guardado en la venta.
-- Por qué trigger: el cupo es la capacidad de la sala menos la suma de
-- las ventas anteriores de la función; eso exige leer otras filas y tablas.

CREATE OR REPLACE FUNCTION fn_ventas_validar_cupo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_funcion   funciones%ROWTYPE;
    v_capacidad salas.capacidad%TYPE;
    v_vendidas  INTEGER;
    v_activo    tipos_boleta.activo%TYPE;
    v_precio    tipos_boleta.precio%TYPE;
BEGIN
    -- Anular una venta siempre se permite.
    IF NEW.estado = 'Anulada' THEN
        RETURN NEW;
    END IF;

    -- FOR UPDATE bloquea la función: dos ventas simultáneas para la misma
    -- función se atienden una después de la otra, así no se vende dos
    -- veces la última silla.
    SELECT * INTO v_funcion
    FROM funciones
    WHERE id_funcion = NEW.id_funcion
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La función % no existe', NEW.id_funcion;
    END IF;

    IF v_funcion.estado <> 'Programada' THEN
        RAISE EXCEPTION 'La función % no está a la venta: está en estado %',
            NEW.id_funcion, v_funcion.estado;
    END IF;

    IF v_funcion.fecha_hora_inicio <= NOW() THEN
        RAISE EXCEPTION 'La función % ya empezó (%), no se pueden vender boletas',
            NEW.id_funcion, v_funcion.fecha_hora_inicio;
    END IF;

    -- Cupo: capacidad de la sala menos lo ya vendido, sin contar ventas
    -- anuladas ni esta misma venta cuando se está modificando.
    SELECT capacidad INTO v_capacidad
    FROM salas
    WHERE id_sala = v_funcion.id_sala;

    SELECT COALESCE(SUM(cantidad), 0) INTO v_vendidas
    FROM ventas
    WHERE id_funcion = NEW.id_funcion
      AND estado <> 'Anulada'
      AND id_venta <> NEW.id_venta;

    IF v_vendidas + NEW.cantidad > v_capacidad THEN
        RAISE EXCEPTION 'No hay cupo en la función %: quedan % boletas y se piden %',
            NEW.id_funcion, v_capacidad - v_vendidas, NEW.cantidad;
    END IF;

    SELECT activo, precio INTO v_activo, v_precio
    FROM tipos_boleta
    WHERE id_tipo_boleta = NEW.id_tipo_boleta;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El tipo de boleta % no existe', NEW.id_tipo_boleta;
    END IF;

    IF NOT v_activo THEN
        RAISE EXCEPTION 'El tipo de boleta % no está activo', NEW.id_tipo_boleta;
    END IF;

    IF NEW.precio_unitario IS NULL THEN
        NEW.precio_unitario := v_precio;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_ventas_validar_cupo
BEFORE INSERT OR UPDATE OF id_funcion, cantidad, id_tipo_boleta, estado
ON ventas
FOR EACH ROW
EXECUTE FUNCTION fn_ventas_validar_cupo();


-- 3. VENTAS: edad del espectador contra la clasificación
-- Tabla: ventas, antes de insertar o modificar.
-- Regla: el espectador que compra debe tener, el día de la función, la
-- edad mínima que exige la clasificación de la película.
-- Por qué trigger: la fecha de nacimiento está en espectadores y la
-- clasificación en funciones; un CHECK sobre ventas no puede leerlas.

CREATE OR REPLACE FUNCTION fn_ventas_validar_edad()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_clasificacion funciones.clasificacion%TYPE;
    v_fecha_funcion funciones.fecha_hora_inicio%TYPE;
    v_nacimiento    espectadores.fecha_nacimiento%TYPE;
    v_edad_minima   INTEGER;
    v_edad          INTEGER;
BEGIN
    SELECT clasificacion, fecha_hora_inicio
    INTO v_clasificacion, v_fecha_funcion
    FROM funciones
    WHERE id_funcion = NEW.id_funcion;

    SELECT fecha_nacimiento INTO v_nacimiento
    FROM espectadores
    WHERE id_espectador = NEW.id_espectador;

    -- Se toma el número de la clasificación: '+15' da 15, 'Todo publico' da 0.
    v_edad_minima := COALESCE(
        NULLIF(REGEXP_REPLACE(v_clasificacion, '[^0-9]', '', 'g'), '')::INTEGER, 0);

    -- Edad cumplida el día de la función, no el día de la compra.
    v_edad := DATE_PART('year', AGE(v_fecha_funcion::DATE, v_nacimiento));

    IF v_edad < v_edad_minima THEN
        RAISE EXCEPTION 'El espectador % tendrá % años en la función y la película es para mayores de %',
            NEW.id_espectador, v_edad, v_edad_minima;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_ventas_validar_edad
BEFORE INSERT OR UPDATE OF id_espectador, id_funcion
ON ventas
FOR EACH ROW
EXECUTE FUNCTION fn_ventas_validar_edad();


-- 4. SALAS: cambios de estado y capacidad
-- Tabla: salas, antes de modificar.
-- Regla: una sala no puede salir de servicio si tiene funciones
-- programadas a futuro, y su capacidad no puede quedar por debajo de las
-- boletas ya vendidas en alguna de esas funciones.
-- Por qué trigger: ambas reglas dependen de funciones y ventas.

CREATE OR REPLACE FUNCTION fn_salas_validar_cambios()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_pendientes   INTEGER;
    v_max_vendidas INTEGER;
BEGIN
    -- Sacar la sala de servicio
    IF OLD.estado = 'Activa' AND NEW.estado <> 'Activa' THEN
        SELECT COUNT(*) INTO v_pendientes
        FROM funciones
        WHERE id_sala = NEW.id_sala
          AND estado = 'Programada'
          AND fecha_hora_inicio > NOW();

        IF v_pendientes > 0 THEN
            RAISE EXCEPTION 'La sala % tiene % funciones programadas; reprográmelas o cancélelas antes de pasarla a %',
                NEW.id_sala, v_pendientes, NEW.estado;
        END IF;
    END IF;

    -- Reducir la capacidad
    IF NEW.capacidad < OLD.capacidad THEN
        SELECT COALESCE(MAX(t.vendidas), 0) INTO v_max_vendidas
        FROM (
            SELECT SUM(v.cantidad) AS vendidas
            FROM ventas v
            JOIN funciones f ON f.id_funcion = v.id_funcion
            WHERE f.id_sala = NEW.id_sala
              AND f.estado = 'Programada'
              AND f.fecha_hora_inicio > NOW()
              AND v.estado <> 'Anulada'
            GROUP BY f.id_funcion
        ) t;

        IF v_max_vendidas > NEW.capacidad THEN
            RAISE EXCEPTION 'No se puede bajar la capacidad de la sala % a %: una función ya tiene % boletas vendidas',
                NEW.id_sala, NEW.capacidad, v_max_vendidas;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_salas_validar_cambios
BEFORE UPDATE OF estado, capacidad
ON salas
FOR EACH ROW
EXECUTE FUNCTION fn_salas_validar_cambios();


-- 5. CONTRATOS: artista activo, función vigente y fechas coherentes
-- Tabla: contratos, antes de insertar o modificar.
-- Regla: un contrato vigente solo se firma con un artista activo, para
-- una función que no esté cancelada y cuya fecha caiga dentro de la
-- vigencia del contrato.
-- Por qué trigger: el estado del artista y la fecha y estado de la
-- función están en otras tablas.

CREATE OR REPLACE FUNCTION fn_contratos_validar()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_artista actores_directores.estado%TYPE;
    v_estado_funcion funciones.estado%TYPE;
    v_fecha_funcion  DATE;
BEGIN
    -- Los contratos finalizados o cancelados son históricos, no se revisan.
    IF NEW.estado <> 'Vigente' THEN
        RETURN NEW;
    END IF;

    SELECT estado INTO v_estado_artista
    FROM actores_directores
    WHERE id_actor_director = NEW.id_actor_director;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El actor o director % no existe', NEW.id_actor_director;
    END IF;

    IF v_estado_artista <> 'Activo' THEN
        RAISE EXCEPTION 'No se puede contratar al actor o director %: está %',
            NEW.id_actor_director, v_estado_artista;
    END IF;

    SELECT estado, fecha_hora_inicio::DATE
    INTO v_estado_funcion, v_fecha_funcion
    FROM funciones
    WHERE id_funcion = NEW.id_funcion;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La función % no existe', NEW.id_funcion;
    END IF;

    IF v_estado_funcion = 'Cancelada' THEN
        RAISE EXCEPTION 'La función % está cancelada, no se puede contratar para ella',
            NEW.id_funcion;
    END IF;

    IF v_fecha_funcion NOT BETWEEN NEW.fecha_inicio AND NEW.fecha_fin THEN
        RAISE EXCEPTION 'La función % es el %, fuera de la vigencia del contrato (del % al %)',
            NEW.id_funcion, v_fecha_funcion, NEW.fecha_inicio, NEW.fecha_fin;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_contratos_validar
BEFORE INSERT OR UPDATE
ON contratos
FOR EACH ROW
EXECUTE FUNCTION fn_contratos_validar();


-- 6. ACTORES_DIRECTORES: inactivación
-- Tabla: actores_directores, antes de modificar el estado.
-- Regla: no se puede inactivar a un actor o director con contratos
-- vigentes; primero se finalizan o cancelan.
-- Por qué trigger: los contratos están en otra tabla.

CREATE OR REPLACE FUNCTION fn_actores_validar_inactivacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_vigentes INTEGER;
BEGIN
    IF OLD.estado <> 'Inactivo' AND NEW.estado = 'Inactivo' THEN
        SELECT COUNT(*) INTO v_vigentes
        FROM contratos
        WHERE id_actor_director = NEW.id_actor_director
          AND estado = 'Vigente'
          AND fecha_fin >= CURRENT_DATE;

        IF v_vigentes > 0 THEN
            RAISE EXCEPTION 'El actor o director % tiene % contratos vigentes; finalícelos o cancélelos antes de inactivarlo',
                NEW.id_actor_director, v_vigentes;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_actores_validar_inactivacion
BEFORE UPDATE OF estado
ON actores_directores
FOR EACH ROW
EXECUTE FUNCTION fn_actores_validar_inactivacion();


-- 7. ESPECTADORES: normalización de datos de registro
-- Tabla: espectadores, antes de insertar o modificar.
-- Regla: el correo se guarda en minúsculas y sin espacios, el documento
-- solo con letras y números, y nombres y apellidos con mayúscula inicial.
-- Así los UNIQUE de correo y documento detectan duplicados escritos de
-- otra forma, como 'Ana@Mail.com' y 'ana@mail.com', o '1.020.345' y '1020345'.
-- Por qué trigger: un CHECK solo acepta o rechaza; el trigger corrige el
-- dato antes de guardarlo.

CREATE OR REPLACE FUNCTION fn_espectadores_normalizar()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.correo    := LOWER(TRIM(NEW.correo));
    NEW.documento := UPPER(REGEXP_REPLACE(NEW.documento, '[^0-9A-Za-z]', '', 'g'));
    NEW.nombres   := INITCAP(TRIM(NEW.nombres));
    NEW.apellidos := INITCAP(TRIM(NEW.apellidos));
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_espectadores_normalizar
BEFORE INSERT OR UPDATE OF correo, documento, nombres, apellidos
ON espectadores
FOR EACH ROW
EXECUTE FUNCTION fn_espectadores_normalizar();


-- VERIFICACIÓN
-- Prueba cada trigger con un caso que debe bloquear y otro que debe
-- pasar. Crea sus propios datos, anota el resultado de cada intento y al
-- final deshace todo, así que no deja datos en la base.
-- La columna "cumple" debe decir sí en todas las filas.

CREATE OR REPLACE FUNCTION pruebas_triggers()
RETURNS TABLE (trigger_probado TEXT, caso TEXT, esperado TEXT, resultado TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_sala_a        INTEGER;   -- sala activa de 10 sillas
    v_sala_b        INTEGER;   -- sala activa sin funciones futuras
    v_sala_mant     INTEGER;   -- sala en mantenimiento
    v_tipo          INTEGER;
    v_tipo_inactivo INTEGER;
    v_adulto        INTEGER;
    v_menor         INTEGER;
    v_staff         INTEGER;
    v_actor1        INTEGER;
    v_actor2        INTEGER;
    v_f1            INTEGER;   -- mañana de 6 a 8 p. m., +15, sala A
    v_f_todos       INTEGER;   -- mañana 8:30 p. m., todo público, sala A
    v_f_pasada      INTEGER;   -- empezó ayer
    v_f_cancelada   INTEGER;
    v_manana        TIMESTAMP := DATE_TRUNC('day', NOW()) + INTERVAL '1 day';
    v_res           TEXT;
    v_txt           TEXT;
    r               RECORD;
BEGIN
    -- Sincroniza los contadores de id con los datos ya cargados.
    FOR r IN SELECT * FROM (VALUES
        ('salas', 'id_sala'), ('tipos_boleta', 'id_tipo_boleta'),
        ('actores_directores', 'id_actor_director'), ('staff', 'id_staff'),
        ('espectadores', 'id_espectador'), ('funciones', 'id_funcion'),
        ('contratos', 'id_contrato'), ('ventas', 'id_venta')) AS t(tabla, columna)
    LOOP
        EXECUTE format(
            'SELECT setval(pg_get_serial_sequence(%L, %L), MAX(%I)) FROM %I HAVING MAX(%I) IS NOT NULL',
            r.tabla, r.columna, r.columna, r.tabla, r.columna);
    END LOOP;

    BEGIN  -- todo lo de este bloque se deshace al final

    INSERT INTO salas (nombre, capacidad, tipo_sala, estado)
    VALUES ('Prueba A', 10, '2D', 'Activa') RETURNING id_sala INTO v_sala_a;
    INSERT INTO salas (nombre, capacidad, tipo_sala, estado)
    VALUES ('Prueba B', 100, '2D', 'Activa') RETURNING id_sala INTO v_sala_b;
    INSERT INTO salas (nombre, capacidad, tipo_sala, estado)
    VALUES ('Prueba M', 100, '2D', 'Mantenimiento') RETURNING id_sala INTO v_sala_mant;

    INSERT INTO tipos_boleta (nombre, precio, activo)
    VALUES ('Prueba general', 10000, TRUE) RETURNING id_tipo_boleta INTO v_tipo;
    INSERT INTO tipos_boleta (nombre, precio, activo)
    VALUES ('Prueba retirada', 5000, FALSE) RETURNING id_tipo_boleta INTO v_tipo_inactivo;

    INSERT INTO espectadores (tipo_documento, documento, nombres, apellidos, correo, fecha_nacimiento)
    VALUES ('CC', 'PRUEBA001', 'Adulto', 'Prueba', 'adulto@prueba.test', '1990-05-10')
    RETURNING id_espectador INTO v_adulto;
    INSERT INTO espectadores (tipo_documento, documento, nombres, apellidos, correo, fecha_nacimiento)
    VALUES ('TI', 'PRUEBA002', 'Menor', 'Prueba', 'menor@prueba.test', CURRENT_DATE - INTERVAL '10 years')
    RETURNING id_espectador INTO v_menor;

    INSERT INTO staff (documento, nombres, apellidos, cargo, correo)
    VALUES ('PRUEBA003', 'Staff', 'Prueba', 'Coordinador', 'staff@prueba.test')
    RETURNING id_staff INTO v_staff;

    INSERT INTO actores_directores (nombres, apellidos, tipo, nacionalidad, fecha_nacimiento, correo)
    VALUES ('Artista', 'Uno', 'Actor', 'Colombia', '1985-03-01', 'artista1@prueba.test')
    RETURNING id_actor_director INTO v_actor1;
    INSERT INTO actores_directores (nombres, apellidos, tipo, nacionalidad, fecha_nacimiento, correo)
    VALUES ('Artista', 'Dos', 'Director', 'Colombia', '1979-08-20', 'artista2@prueba.test')
    RETURNING id_actor_director INTO v_actor2;

    INSERT INTO funciones (id_sala, titulo_pelicula, genero, clasificacion, duracion_min, fecha_hora_inicio)
    VALUES (v_sala_a, 'Película prueba', 'Drama', '+15', 120, v_manana + INTERVAL '18 hours')
    RETURNING id_funcion INTO v_f1;

    INSERT INTO funciones (id_sala, titulo_pelicula, genero, clasificacion, duracion_min, fecha_hora_inicio)
    VALUES (v_sala_b, 'Película pasada', 'Drama', 'Todo publico', 90, v_manana - INTERVAL '30 hours')
    RETURNING id_funcion INTO v_f_pasada;

    INSERT INTO funciones (id_sala, titulo_pelicula, genero, clasificacion, duracion_min, fecha_hora_inicio, estado)
    VALUES (v_sala_b, 'Película cancelada', 'Drama', 'Todo publico', 90, v_manana + INTERVAL '15 hours', 'Cancelada')
    RETURNING id_funcion INTO v_f_cancelada;

    -- 1. funciones
    BEGIN
        INSERT INTO funciones (id_sala, titulo_pelicula, genero, clasificacion, duracion_min, fecha_hora_inicio)
        VALUES (v_sala_a, 'Cruce', 'Drama', 'Todo publico', 90, v_manana + INTERVAL '19 hours');
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '1 funciones'; caso := 'Función a las 7 p. m. en sala ocupada de 6 a 8';
    esperado := 'BLOQUEADO'; resultado := v_res; RETURN NEXT;

    BEGIN
        INSERT INTO funciones (id_sala, titulo_pelicula, genero, clasificacion, duracion_min, fecha_hora_inicio)
        VALUES (v_sala_a, 'Infantil', 'Animación', 'Todo publico', 90, v_manana + INTERVAL '20 hours 30 minutes')
        RETURNING id_funcion INTO v_f_todos;
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '1 funciones'; caso := 'Función a las 8:30 p. m. en la misma sala';
    esperado := 'PERMITIDO'; resultado := v_res; RETURN NEXT;

    BEGIN
        INSERT INTO funciones (id_sala, titulo_pelicula, genero, clasificacion, duracion_min, fecha_hora_inicio)
        VALUES (v_sala_mant, 'Sin sala', 'Drama', 'Todo publico', 90, v_manana + INTERVAL '15 hours');
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '1 funciones'; caso := 'Función en sala en mantenimiento';
    esperado := 'BLOQUEADO'; resultado := v_res; RETURN NEXT;

    -- 2. ventas: cupo
    BEGIN
        INSERT INTO ventas (id_espectador, id_funcion, id_tipo_boleta, cantidad, canal_venta, metodo_pago)
        VALUES (v_adulto, v_f1, v_tipo, 8, 'Online', 'Tarjeta')
        RETURNING precio_unitario::TEXT INTO v_txt;
        v_res := 'PERMITIDO: precio tomado del tipo de boleta = ' || v_txt;
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '2 ventas cupo'; caso := '8 boletas en sala de 10, sin precio';
    esperado := 'PERMITIDO'; resultado := v_res; RETURN NEXT;

    BEGIN
        INSERT INTO ventas (id_espectador, id_funcion, id_tipo_boleta, cantidad, canal_venta, metodo_pago)
        VALUES (v_adulto, v_f1, v_tipo, 3, 'Online', 'Tarjeta');
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '2 ventas cupo'; caso := '3 boletas más cuando quedan 2';
    esperado := 'BLOQUEADO'; resultado := v_res; RETURN NEXT;

    BEGIN
        INSERT INTO ventas (id_espectador, id_funcion, id_tipo_boleta, cantidad, canal_venta, metodo_pago)
        VALUES (v_adulto, v_f1, v_tipo_inactivo, 1, 'Online', 'Tarjeta');
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '2 ventas cupo'; caso := 'Tipo de boleta inactivo';
    esperado := 'BLOQUEADO'; resultado := v_res; RETURN NEXT;

    BEGIN
        INSERT INTO ventas (id_espectador, id_funcion, id_tipo_boleta, cantidad, canal_venta, metodo_pago)
        VALUES (v_adulto, v_f_pasada, v_tipo, 1, 'Online', 'Tarjeta');
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '2 ventas cupo'; caso := 'Función que ya empezó';
    esperado := 'BLOQUEADO'; resultado := v_res; RETURN NEXT;

    BEGIN
        INSERT INTO ventas (id_espectador, id_funcion, id_tipo_boleta, cantidad, canal_venta, metodo_pago)
        VALUES (v_adulto, v_f_cancelada, v_tipo, 1, 'Online', 'Tarjeta');
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '2 ventas cupo'; caso := 'Función cancelada';
    esperado := 'BLOQUEADO'; resultado := v_res; RETURN NEXT;

    -- 3. ventas: edad
    BEGIN
        INSERT INTO ventas (id_espectador, id_funcion, id_tipo_boleta, cantidad, canal_venta, metodo_pago)
        VALUES (v_menor, v_f1, v_tipo, 1, 'Online', 'Tarjeta');
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '3 ventas edad'; caso := 'Niño de 10 años en película +15';
    esperado := 'BLOQUEADO'; resultado := v_res; RETURN NEXT;

    BEGIN
        INSERT INTO ventas (id_espectador, id_funcion, id_tipo_boleta, cantidad, canal_venta, metodo_pago)
        VALUES (v_menor, v_f_todos, v_tipo, 1, 'Online', 'Tarjeta');
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '3 ventas edad'; caso := 'Niño de 10 años en película para todo público';
    esperado := 'PERMITIDO'; resultado := v_res; RETURN NEXT;

    -- 4. salas
    BEGIN
        UPDATE salas SET estado = 'Mantenimiento' WHERE id_sala = v_sala_a;
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '4 salas'; caso := 'Pasar a mantenimiento con funciones programadas';
    esperado := 'BLOQUEADO'; resultado := v_res; RETURN NEXT;

    BEGIN
        UPDATE salas SET capacidad = 5 WHERE id_sala = v_sala_a;
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '4 salas'; caso := 'Bajar a 5 sillas con 8 vendidas';
    esperado := 'BLOQUEADO'; resultado := v_res; RETURN NEXT;

    BEGIN
        UPDATE salas SET estado = 'Mantenimiento' WHERE id_sala = v_sala_b;
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '4 salas'; caso := 'Pasar a mantenimiento sin funciones futuras';
    esperado := 'PERMITIDO'; resultado := v_res; RETURN NEXT;

    -- 5. contratos
    BEGIN
        INSERT INTO contratos (id_actor_director, id_funcion, id_staff, objeto, tipo_contrato, fecha_inicio, fecha_fin, valor)
        VALUES (v_actor1, v_f1, v_staff, 'Invitado al estreno', 'Estreno',
                CURRENT_DATE, CURRENT_DATE + 7, 2000000);
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '5 contratos'; caso := 'Contrato que cubre la fecha de la función';
    esperado := 'PERMITIDO'; resultado := v_res; RETURN NEXT;

    BEGIN
        INSERT INTO contratos (id_actor_director, id_funcion, id_staff, objeto, tipo_contrato, fecha_inicio, fecha_fin, valor)
        VALUES (v_actor1, v_f_todos, v_staff, 'Conversatorio', 'Conversatorio',
                CURRENT_DATE + 10, CURRENT_DATE + 15, 1500000);
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '5 contratos'; caso := 'Contrato que empieza después de la función';
    esperado := 'BLOQUEADO'; resultado := v_res; RETURN NEXT;

    BEGIN
        INSERT INTO contratos (id_actor_director, id_funcion, id_staff, objeto, tipo_contrato, fecha_inicio, fecha_fin, valor)
        VALUES (v_actor1, v_f_cancelada, v_staff, 'Presentación', 'Presentacion',
                CURRENT_DATE, CURRENT_DATE + 7, 1000000);
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '5 contratos'; caso := 'Contrato para una función cancelada';
    esperado := 'BLOQUEADO'; resultado := v_res; RETURN NEXT;

    -- 6. actores_directores
    BEGIN
        UPDATE actores_directores SET estado = 'Inactivo' WHERE id_actor_director = v_actor1;
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '6 actores'; caso := 'Inactivar artista con contrato vigente';
    esperado := 'BLOQUEADO'; resultado := v_res; RETURN NEXT;

    BEGIN
        UPDATE actores_directores SET estado = 'Inactivo' WHERE id_actor_director = v_actor2;
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '6 actores'; caso := 'Inactivar artista sin contratos';
    esperado := 'PERMITIDO'; resultado := v_res; RETURN NEXT;

    -- 5. contratos, con el artista que se acaba de inactivar
    BEGIN
        INSERT INTO contratos (id_actor_director, id_funcion, id_staff, objeto, tipo_contrato, fecha_inicio, fecha_fin, valor)
        VALUES (v_actor2, v_f1, v_staff, 'Presentación', 'Presentacion',
                CURRENT_DATE, CURRENT_DATE + 7, 1000000);
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '5 contratos'; caso := 'Contratar a un artista inactivo';
    esperado := 'BLOQUEADO'; resultado := v_res; RETURN NEXT;

    -- 7. espectadores
    BEGIN
        INSERT INTO espectadores (tipo_documento, documento, nombres, apellidos, correo, fecha_nacimiento)
        VALUES ('CC', '1.020.345', '  ana maría ', 'PÉREZ', '  Ana.Perez@MAIL.com ', '2000-01-01')
        RETURNING correo || ' | ' || documento || ' | ' || nombres || ' ' || apellidos INTO v_txt;
        v_res := 'PERMITIDO: guardado como ' || v_txt;
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '7 espectadores'; caso := 'Registro con mayúsculas, espacios y puntos';
    esperado := 'PERMITIDO'; resultado := v_res; RETURN NEXT;

    BEGIN
        INSERT INTO espectadores (tipo_documento, documento, nombres, apellidos, correo, fecha_nacimiento)
        VALUES ('CC', '1020345', 'Ana María', 'Pérez', 'ana.perez@mail.com', '2000-01-01');
        v_res := 'PERMITIDO';
    EXCEPTION WHEN OTHERS THEN v_res := 'BLOQUEADO: ' || SQLERRM;
    END;
    trigger_probado := '7 espectadores'; caso := 'Mismo correo y documento escritos distinto';
    esperado := 'BLOQUEADO'; resultado := v_res; RETURN NEXT;

    -- Deshace todos los datos de prueba
    RAISE EXCEPTION 'fin_pruebas';

    EXCEPTION WHEN raise_exception THEN
        IF SQLERRM <> 'fin_pruebas' THEN
            RAISE;
        END IF;
    END;
END;
$$;

SELECT t.*,
       CASE WHEN t.resultado LIKE t.esperado || '%' THEN 'sí' ELSE 'NO' END AS cumple
FROM pruebas_triggers() t;

DROP FUNCTION pruebas_triggers();
