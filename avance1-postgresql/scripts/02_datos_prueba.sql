-- 02_datos_prueba.sql
-- Avance 1, núcleo transaccional del cine
--
-- Cada integrante escribe SOLO dentro de su sección.
-- El orden respeta las llaves foráneas: no cambiarlo.
-- Los IDs se escriben explícitos (1, 2, 3...) para poder referenciarlos.
-- Al final, el bloque setval sincroniza los contadores de id.
--
-- Este script se corre DESPUÉS del 01 y ANTES del 03. Para repetir la
-- carga hay que volver a correr desde el 01 (borra y recrea las tablas).
-- No correr solo el 02 con los triggers ya creados.
--
-- Valores válidos (CHECK del 01):
--   salas.tipo_sala         '2D','3D','IMAX','VIP','4DX'
--   salas.estado            'Activa','Mantenimiento','Inactiva'
--   actores_directores.tipo 'Actor','Director','Actor/Director'
--   actores_directores.estado 'Activo','Inactivo'
--   staff.tipo_documento    'CC','CE','PAS'
--   staff.estado            'Activo','Inactivo','Vacaciones'
--   espectadores.tipo_documento 'CC','TI','CE','PAS'
--   funciones.clasificacion 'Todo publico','+7','+12','+15','+18'
--   funciones.estado        'Programada','En curso','Finalizada','Cancelada'
--   contratos.tipo_contrato 'Estreno','Conversatorio','Presentacion','Evento'
--   contratos.estado        'Vigente','Finalizado','Cancelado'
--   ventas.canal_venta      'Taquilla','Online'
--   ventas.metodo_pago      'Efectivo','Tarjeta','Transferencia'
--   ventas.estado           'Pagada','Anulada'
-- Reglas de ventas: canal 'Online' lleva id_staff NULL; 'Taquilla' lleva
-- id_staff; el pago en efectivo solo en Taquilla.
-- Para que 04 y los triggers se puedan probar, incluir funciones futuras
-- escritas como NOW() + INTERVAL '5 days', no con fechas fijas.

SET client_encoding = 'UTF8';

-- ----- SECCIÓN 1: Salas (Jose Espin) -----


-- ----- SECCIÓN 2: Tipos_Boleta (Santiago Rojas) -----


-- ----- SECCIÓN 3: Actores_Directores (Estefania Paredes) -----


-- ----- SECCIÓN 4: Staff (Estefania Paredes) -----


-- ----- SECCIÓN 5: Funciones (Erika Gomez) -----
-- Necesita las salas (sección 1). Incluir funciones pasadas (Finalizada),
-- una Cancelada y varias Programadas a futuro.


-- ----- SECCIÓN 6: Contratos (Estefania Paredes) -----
-- Necesita actores_directores, staff y funciones (secciones 3, 4 y 5).


-- ----- SECCIÓN 7: Espectadores (Erika Gomez) -----


-- ----- SECCIÓN 8: Ventas (Santiago Rojas) -----
-- Necesita funciones, espectadores, tipos_boleta y staff.


-- ----- SINCRONIZAR CONTADORES DE ID (Estefania Paredes) -----
SELECT setval(pg_get_serial_sequence('salas','id_sala'), COALESCE(MAX(id_sala),0)+1, false) FROM salas;
SELECT setval(pg_get_serial_sequence('tipos_boleta','id_tipo_boleta'), COALESCE(MAX(id_tipo_boleta),0)+1, false) FROM tipos_boleta;
SELECT setval(pg_get_serial_sequence('actores_directores','id_actor_director'), COALESCE(MAX(id_actor_director),0)+1, false) FROM actores_directores;
SELECT setval(pg_get_serial_sequence('staff','id_staff'), COALESCE(MAX(id_staff),0)+1, false) FROM staff;
SELECT setval(pg_get_serial_sequence('funciones','id_funcion'), COALESCE(MAX(id_funcion),0)+1, false) FROM funciones;
SELECT setval(pg_get_serial_sequence('contratos','id_contrato'), COALESCE(MAX(id_contrato),0)+1, false) FROM contratos;
SELECT setval(pg_get_serial_sequence('espectadores','id_espectador'), COALESCE(MAX(id_espectador),0)+1, false) FROM espectadores;
SELECT setval(pg_get_serial_sequence('ventas','id_venta'), COALESCE(MAX(id_venta),0)+1, false) FROM ventas;
