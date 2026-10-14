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
INSERT INTO tipos_boleta (id_tipo_boleta, nombre, descripcion, precio, activo) VALUES
(1, 'General',       'Entrada estándar para adultos',               18000, TRUE),
(2, 'Estudiante',    'Con carné estudiantil vigente',               14000, TRUE),
(3, 'Niño',          'Menores de 12 años',                          12000, TRUE),
(4, 'Adulto mayor',  'Mayores de 60 años',                          12000, TRUE),
(5, 'VIP',           'Silla preferencial, para la Sala VIP',        30000, TRUE),
(6, 'Promo 2x1',     'Promoción retirada, ya no se vende',          18000, FALSE);


-- ----- SECCIÓN 3: Actores_Directores (Estefania Paredes) -----


-- ----- SECCIÓN 4: Staff (Estefania Paredes) -----


-- ----- SECCIÓN 5: Funciones (Erika Gomez) -----
-- Necesita las salas (sección 1). Incluir funciones pasadas (Finalizada),
-- una Cancelada y varias Programadas a futuro.


-- ----- SECCIÓN 6: Contratos (Estefania Paredes) -----
-- Necesita actores_directores, staff y funciones (secciones 3, 4 y 5).


-- ----- SECCIÓN 7: Espectadores (Erika Gomez) -----
-- ----- SECCIÓN 7: Espectadores (Erika Gomez) -----
INSERT INTO espectadores (id_espectador, tipo_documento, documento, nombres, apellidos, correo, telefono, fecha_nacimiento, fecha_registro, puntos_acumulados) VALUES
(1,  'CC',  '1020345671', 'Laura',          'Gómez Ríos',        'laura.gomez@correo.com',        '3101234501', '1992-04-15', '2025-11-03', 120),
(2,  'CC',  '1015987452', 'Carlos Andrés',  'Martínez Peña',     'carlos.martinez@correo.com',    '3112345602', '1988-09-02', '2025-11-10', 340),
(3,  'CC',  '1032456789', 'Valentina',      'Rojas Cruz',        'valentina.rojas@correo.com',    '3123456703', '1999-01-28', '2025-12-01', 45),
(4,  'CC',  '80123456',   'Andrés Felipe',  'Ortiz Vargas',      'andres.ortiz@correo.com',       '3134567804', '1985-06-19', '2025-12-05', 510),
(5,  'CC',  '1098765432', 'Camila',         'Herrera Soto',      'camila.herrera@correo.com',     NULL,         '2001-11-23', '2025-12-12', 0),
(6,  'CC',  '52345678',   'Diana Marcela',  'Suárez Luna',       'diana.suarez@correo.com',       '3156789006', '1979-03-07', '2026-01-08', 275),
(7,  'TI',  '1111222333', 'Samuel',         'Torres Díaz',       'samuel.torres@correo.com',      '3167890107', '2014-03-12', '2026-01-15', 10),
(8,  'CC',  '1023456780', 'Juan Sebastián', 'Castro Mejía',      'juan.castro@correo.com',        '3178901208', '1996-08-30', '2026-01-20', 90),
(9,  'CC',  '1010203040', 'Natalia',        'Pardo Rincón',      'natalia.pardo@correo.com',      '3189012309', '1994-12-14', '2026-01-27', 180),
(10, 'CC',  '79456123',   'Jorge Eduardo',  'Vega Cortés',       'jorge.vega@correo.com',         '3190123410', '1975-02-25', '2026-02-02', 620),
(11, 'CC',  '1045678901', 'Daniela',        'Ramírez Gil',       'daniela.ramirez@correo.com',    '3201234511', '2003-05-09', '2026-02-09', 60),
(12, 'CC',  '1056789012', 'Santiago',       'Moreno Ávila',      'santiago.moreno@correo.com',    NULL,         '1990-10-17', '2026-02-14', 150),
(13, 'CC',  '52876543',   'Paola Andrea',   'Jiménez Bravo',     'paola.jimenez@correo.com',      '3223456713', '1983-07-04', '2026-02-21', 410),
(14, 'TI',  '1222333444', 'Mariana',        'Salazar Prieto',    'mariana.salazar@correo.com',    '3234567814', '2016-07-21', '2026-03-01', 5),
(15, 'CC',  '1067890123', 'Felipe',         'Cárdenas Ruiz',     'felipe.cardenas@correo.com',    '3245678915', '1997-01-11', '2026-03-07', 130),
(16, 'CC',  '1078901234', 'Isabella',       'Forero León',       'isabella.forero@correo.com',    '3256789016', '2000-09-26', '2026-03-14', 75),
(17, 'CC',  '19876543',   'Hernando',       'Beltrán Mora',      'hernando.beltran@correo.com',   '3267890117', '1962-05-31', '2026-03-20', 230),
(18, 'CC',  '1089012345', 'Sara',           'Acosta Pinto',      'sara.acosta@correo.com',        '3278901218', '1998-03-18', '2026-04-02', 95),
(19, 'CC',  '1090123456', 'David',          'Navarro Silva',     'david.navarro@correo.com',      '3289012319', '1993-11-08', '2026-04-09', 200),
(20, 'CE',  '405123',     'Gabriela',       'Mendoza Rivas',     'gabriela.mendoza@correo.com',   '3290123420', '1991-06-22', '2026-04-16', 160),
(21, 'TI',  '1333444555', 'Mateo',          'Aguirre Soto',      'mateo.aguirre@correo.com',      NULL,         '2012-11-05', '2026-04-23', 20),
(22, 'CC',  '1001234567', 'Alejandra',      'Quintero Ospina',   'alejandra.quintero@correo.com', '3012345622', '1995-02-13', '2026-05-03', 110),
(23, 'CC',  '1002345678', 'Nicolás',        'Parra Duarte',      'nicolas.parra@correo.com',      '3023456723', '2002-08-01', '2026-05-10', 40),
(24, 'CC',  '51234567',   'Martha Lucía',   'Gutiérrez Pérez',   'martha.gutierrez@correo.com',   '3034567824', '1968-12-29', '2026-05-18', 380),
(25, 'PAS', 'AB123456',   'Thomas',         'Miller Brown',      'thomas.miller@correo.com',      '3045678925', '1987-10-10', '2026-05-25', 55),
(26, 'CC',  '1003456789', 'Juliana',        'Sánchez Montoya',   'juliana.sanchez@correo.com',    '3056789026', '1999-04-05', '2026-06-02', 85),
(27, 'CC',  '1004567890', 'Esteban',        'Duque Arango',      'esteban.duque@correo.com',      '3067890127', '1989-07-16', '2026-06-09', 260),
(28, 'TI',  '1444555666', 'Sofía',          'Lozano Rey',        'sofia.lozano@correo.com',       '3078901228', '2010-02-18', '2026-06-16', 35),
(29, 'CC',  '1005678901', 'Camilo',         'Bernal Franco',     'camilo.bernal@correo.com',      '3089012329', '1992-09-21', '2026-06-23', 140),
(30, 'CC',  '1006789012', 'Carolina',       'Ibáñez Reyes',      'carolina.ibanez@correo.com',    '3090123430', '2004-01-30', '2026-07-01', 25);

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
