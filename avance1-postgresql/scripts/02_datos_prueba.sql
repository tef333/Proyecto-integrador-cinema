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

INSERT INTO salas (id_sala, nombre, capacidad, tipo_sala, estado) VALUES
(1, 'Sala 1',    150, '2D',   'Activa'),
(2, 'Sala 2',    150, '2D',   'Activa'),
(3, 'Sala 3',    120, '3D',   'Activa'),
(4, 'Sala VIP',   60, 'VIP',  'Activa'),
(5, 'Sala IMAX', 220, 'IMAX', 'Activa'),
(6, 'Sala 4DX',   80, '4DX',  'Mantenimiento');

-- ----- SECCIÓN 2: Tipos_Boleta (Santiago Rojas) -----
INSERT INTO tipos_boleta (id_tipo_boleta, nombre, descripcion, precio, activo) VALUES
(1, 'General',       'Entrada estándar para adultos',               18000, TRUE),
(2, 'Estudiante',    'Con carné estudiantil vigente',               14000, TRUE),
(3, 'Niño',          'Menores de 12 años',                          12000, TRUE),
(4, 'Adulto mayor',  'Mayores de 60 años',                          12000, TRUE),
(5, 'VIP',           'Silla preferencial, para la Sala VIP',        30000, TRUE),
(6, 'Promo 2x1',     'Promoción retirada, ya no se vende',          18000, FALSE);


-- ----- SECCIÓN 3: Actores_Directores (Estefania Paredes) -----
-- 30 artistas (el documento de identidad de Altamira Cine registra 30):
-- 14 actores, 9 directores y 7 actor/director, de Colombia y otros países
-- de Iberoamérica. Los ids 10 y 28 están inactivos y NO deben tener
-- contratos vigentes (lo exige el trigger 6).
INSERT INTO actores_directores
    (id_actor_director, nombres, apellidos, nombre_artistico, tipo, nacionalidad, fecha_nacimiento, correo, telefono, fecha_registro, estado)
VALUES
    (1,  'Valentina', 'Mora Quintero',   'Vale Mora',     'Actor',          'Colombia',  '1990-04-12', 'valentina.mora@artistas.test',   '3101234501', '2024-02-10', 'Activo'),
    (2,  'Andrés',    'Cifuentes Rojas', NULL,            'Director',       'Colombia',  '1982-09-30', 'andres.cifuentes@artistas.test', '3101234502', '2024-02-10', 'Activo'),
    (3,  'Camila',    'Restrepo Vélez',  'Cami Restrepo', 'Actor',          'Colombia',  '1995-01-22', 'camila.restrepo@artistas.test',  '3101234503', '2024-03-05', 'Activo'),
    (4,  'Mateo',     'Salgado Pardo',   NULL,            'Actor/Director', 'Colombia',  '1987-07-08', 'mateo.salgado@artistas.test',    '3101234504', '2024-03-05', 'Activo'),
    (5,  'Lucía',     'Ferrer Ibáñez',   'Lucía Ferrer',  'Actor',          'España',    '1984-11-17', 'lucia.ferrer@artistas.test',     '3101234505', '2024-05-20', 'Activo'),
    (6,  'Diego',     'Alarcón Núñez',   NULL,            'Director',       'México',    '1979-03-02', 'diego.alarcon@artistas.test',    '3101234506', '2024-05-20', 'Activo'),
    (7,  'Sofía',     'Benítez Arce',    'Sofi Benítez',  'Actor',          'Argentina', '1992-06-25', 'sofia.benitez@artistas.test',    '3101234507', '2024-08-14', 'Activo'),
    (8,  'Julián',    'Pineda Cortés',   NULL,            'Director',       'Colombia',  '1975-12-09', 'julian.pineda@artistas.test',    NULL,         '2024-08-14', 'Activo'),
    (9,  'Isabela',   'Duarte Lemos',    'Isa Duarte',    'Actor/Director', 'Colombia',  '1988-05-14', 'isabela.duarte@artistas.test',   '3101234509', '2025-01-18', 'Activo'),
    (10, 'Ricardo',   'Montoya Gil',     NULL,            'Actor',          'Colombia',  '1965-10-03', 'ricardo.montoya@artistas.test',  NULL,         '2024-02-10', 'Inactivo'),
    (11, 'Natalia',   'Quiroga Salas',   'Nati Quiroga',  'Actor',          'Colombia',  '1991-02-14', 'natalia.quiroga@artistas.test',  '3101234511', '2024-09-03', 'Activo'),
    (12, 'Santiago',  'Luna Aristizábal', NULL,           'Director',       'Colombia',  '1980-06-21', 'santiago.luna@artistas.test',    '3101234512', '2024-09-03', 'Activo'),
    (13, 'Gabriela',  'Navarro Ponce',   'Gaby Navarro',  'Actor',          'México',    '1993-10-11', 'gabriela.navarro@artistas.test', '3101234513', '2024-09-17', 'Activo'),
    (14, 'Emilio',    'Rojas Cáceres',   NULL,            'Actor/Director', 'Chile',     '1983-04-05', 'emilio.rojas@artistas.test',     '3101234514', '2024-09-17', 'Activo'),
    (15, 'Paula',     'Zambrano Ruiz',   'Pau Zambrano',  'Actor',          'Colombia',  '1997-08-29', 'paula.zambrano@artistas.test',   '3101234515', '2024-10-08', 'Activo'),
    (16, 'Tomás',     'Echeverri Mesa',  NULL,            'Director',       'Colombia',  '1977-01-16', 'tomas.echeverri@artistas.test',  NULL,         '2024-10-08', 'Activo'),
    (17, 'Carolina',  'Bustos Herrera',  'Caro Bustos',   'Actor',          'Perú',      '1989-12-03', 'carolina.bustos@artistas.test',  '3101234517', '2024-11-12', 'Activo'),
    (18, 'Rodrigo',   'Paz Villalba',    NULL,            'Director',       'Uruguay',   '1972-05-27', 'rodrigo.paz@artistas.test',      '3101234518', '2024-11-12', 'Activo'),
    (19, 'Mariana',   'Giraldo Toro',    'Mari Giraldo',  'Actor/Director', 'Colombia',  '1990-09-09', 'mariana.giraldo@artistas.test',  '3101234519', '2024-11-25', 'Activo'),
    (20, 'Álvaro',    'Medina Ortega',   NULL,            'Actor',          'España',    '1981-03-18', 'alvaro.medina@artistas.test',    '3101234520', '2024-11-25', 'Activo'),
    (21, 'Juliana',   'Arboleda Franco', 'Juli Arboleda', 'Actor',          'Colombia',  '1998-07-01', 'juliana.arboleda@artistas.test', '3101234521', '2025-02-04', 'Activo'),
    (22, 'Fernando',  'Vidal Montes',    NULL,            'Director',       'Argentina', '1974-11-23', 'fernando.vidal@artistas.test',   '3101234522', '2025-02-04', 'Activo'),
    (23, 'Daniela',   'Cárdenas Uribe',  'Dani Cárdenas', 'Actor/Director', 'Colombia',  '1986-02-02', 'daniela.cardenas@artistas.test', '3101234523', '2025-02-19', 'Activo'),
    (24, 'Leonardo',  'Suárez Prada',    NULL,            'Actor',          'Venezuela', '1985-06-30', 'leonardo.suarez@artistas.test',  '3101234524', '2025-02-19', 'Activo'),
    (25, 'Adriana',   'Peña Camacho',    'Adri Peña',     'Actor',          'Colombia',  '1994-04-17', 'adriana.pena@artistas.test',     '3101234525', '2025-03-11', 'Activo'),
    (26, 'Hernán',    'Cordero Bravo',   NULL,            'Director',       'Ecuador',   '1969-08-12', 'hernan.cordero@artistas.test',   NULL,         '2025-03-11', 'Activo'),
    (27, 'Manuela',   'Ospina Londoño',  'Manu Ospina',   'Actor/Director', 'Colombia',  '1992-01-07', 'manuela.ospina@artistas.test',   '3101234527', '2025-04-01', 'Activo'),
    (28, 'Esteban',   'Montaña Roa',     NULL,            'Actor',          'Colombia',  '1968-09-26', 'esteban.montana@artistas.test',  NULL,         '2024-09-03', 'Inactivo'),
    (29, 'Valeria',   'Camargo Neira',   'Vale Camargo',  'Actor/Director', 'Brasil',    '1987-10-15', 'valeria.camargo@artistas.test',  '3101234529', '2025-04-01', 'Activo'),
    (30, 'Nicolás',   'Prieto Sandoval', NULL,            'Director',       'Colombia',  '1978-12-31', 'nicolas.prieto@artistas.test',   '3101234530', '2025-05-13', 'Activo');



-- ----- SECCIÓN 4: Staff (Estefania Paredes) -----
-- 8 empleados. Para las demás secciones:
--   ids 1 y 2 (Administrador, Coordinador): firman los contratos.
--   ids 3 y 4 (Taquilleros) y 7 (Servicio al cliente): atienden ventas de Taquilla.
--   id 8 está de vacaciones: no usarlo en ventas nuevas.
INSERT INTO staff
    (id_staff, tipo_documento, documento, nombres, apellidos, cargo, correo, telefono, fecha_ingreso, estado)
VALUES
    (1, 'CC', '1010101001', 'Laura',     'Gómez Prieto',  'Administrador',       'laura.gomez@cinema.test',      '3201112201', '2023-06-01', 'Activo'),
    (2, 'CC', '1010101002', 'Camilo',    'Herrera Soto',  'Coordinador',         'camilo.herrera@cinema.test',   '3201112202', '2023-07-15', 'Activo'),
    (3, 'CC', '1010101003', 'Natalia',   'Ortiz Beltrán', 'Taquillero',          'natalia.ortiz@cinema.test',    '3201112203', '2024-01-10', 'Activo'),
    (4, 'CC', '1010101004', 'Sebastián', 'Vargas Luna',   'Taquillero',          'sebastian.vargas@cinema.test', '3201112204', '2024-01-10', 'Activo'),
    (5, 'CC', '1010101005', 'Paola',     'Mendoza Ríos',  'Proyeccionista',      'paola.mendoza@cinema.test',    '3201112205', '2024-02-20', 'Activo'),
    (6, 'CE', '5500123',    'Jorge',     'Salinas Duque', 'Acomodador',          'jorge.salinas@cinema.test',    NULL,         '2024-04-01', 'Activo'),
    (7, 'CC', '1010101007', 'Daniela',   'Cruz Martínez', 'Servicio al cliente', 'daniela.cruz@cinema.test',     '3201112207', '2024-09-02', 'Activo'),
    (8, 'CC', '1010101008', 'Felipe',    'Arango Mejía',  'Taquillero',          'felipe.arango@cinema.test',    '3201112208', '2025-03-03', 'Vacaciones');



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
