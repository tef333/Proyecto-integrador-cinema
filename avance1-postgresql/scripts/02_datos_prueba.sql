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
INSERT INTO funciones (id_funcion, id_sala, titulo_pelicula, genero, clasificacion, idioma, duracion_min, fecha_hora_inicio, estado) VALUES
-- Finalizadas (pasadas)
(1, 1, 'Oppenheimer', 'Drama', '+15', 'Inglés subtitulado', 180, DATE_TRUNC('day', NOW()) - INTERVAL '28 days' + INTERVAL '18 hours', 'Finalizada'),
(2, 2, 'Coco', 'Animación', 'Todo publico', 'Español', 105, DATE_TRUNC('day', NOW()) - INTERVAL '27 days' + INTERVAL '15 hours', 'Finalizada'),
(3, 3, 'Parásitos', 'Thriller', '+15', 'Coreano subtitulado', 132, DATE_TRUNC('day', NOW()) - INTERVAL '25 days' + INTERVAL '19 hours', 'Finalizada'),
(4, 5, 'Dune: Parte Dos', 'Ciencia ficción', '+12', 'Inglés subtitulado', 166, DATE_TRUNC('day', NOW()) - INTERVAL '24 days' + INTERVAL '20 hours', 'Finalizada'),
(5, 4, 'La La Land', 'Musical', '+7', 'Inglés subtitulado', 128, DATE_TRUNC('day', NOW()) - INTERVAL '22 days' + INTERVAL '19 hours 30 minutes', 'Finalizada'),
(6, 1, 'Encanto', 'Animación', 'Todo publico', 'Español', 102, DATE_TRUNC('day', NOW()) - INTERVAL '21 days' + INTERVAL '14 hours', 'Finalizada'),
(7, 2, 'El Irlandés', 'Drama', '+15', 'Inglés subtitulado', 209, DATE_TRUNC('day', NOW()) - INTERVAL '20 days' + INTERVAL '18 hours', 'Finalizada'),
(8, 5, 'Joker', 'Thriller', '+18', 'Inglés subtitulado', 122, DATE_TRUNC('day', NOW()) - INTERVAL '18 days' + INTERVAL '21 hours', 'Finalizada'),
(9, 3, 'Intensamente 2', 'Animación', 'Todo publico', 'Español', 96, DATE_TRUNC('day', NOW()) - INTERVAL '16 days' + INTERVAL '16 hours', 'Finalizada'),
(10, 1, 'Barbie', 'Comedia', '+12', 'Español', 114, DATE_TRUNC('day', NOW()) - INTERVAL '14 days' + INTERVAL '17 hours', 'Finalizada'),
(11, 4, 'Cinema Paradiso', 'Drama', '+7', 'Italiano subtitulado', 155, DATE_TRUNC('day', NOW()) - INTERVAL '12 days' + INTERVAL '18 hours', 'Finalizada'),
(12, 2, 'Mad Max: Furia en el camino', 'Acción', '+15', 'Español', 120, DATE_TRUNC('day', NOW()) - INTERVAL '10 days' + INTERVAL '20 hours', 'Finalizada'),
(13, 5, 'Avatar: El camino del agua', 'Ciencia ficción', '+12', 'Español', 192, DATE_TRUNC('day', NOW()) - INTERVAL '9 days' + INTERVAL '19 hours', 'Finalizada'),
(14, 3, 'El Origen', 'Ciencia ficción', '+12', 'Español', 148, DATE_TRUNC('day', NOW()) - INTERVAL '7 days' + INTERVAL '20 hours 30 minutes', 'Finalizada'),
(15, 1, 'Spider-Man: Un nuevo universo', 'Animación', '+7', 'Español', 117, DATE_TRUNC('day', NOW()) - INTERVAL '5 days' + INTERVAL '16 hours', 'Finalizada'),
(16, 4, 'Amélie', 'Comedia romántica', '+12', 'Francés subtitulado', 122, DATE_TRUNC('day', NOW()) - INTERVAL '4 days' + INTERVAL '20 hours', 'Finalizada'),
-- Canceladas
(17, 2, 'Pulp Fiction', 'Crimen', '+18', 'Inglés subtitulado', 154, DATE_TRUNC('day', NOW()) - INTERVAL '3 days' + INTERVAL '21 hours', 'Cancelada'),
(18, 5, 'Gladiador', 'Acción', '+15', 'Español', 155, DATE_TRUNC('day', NOW()) + INTERVAL '6 days 20 hours', 'Cancelada'),
-- Programadas (futuras)
(19, 1, 'Deadpool y Wolverine', 'Acción', '+15', 'Español', 128, DATE_TRUNC('day', NOW()) + INTERVAL '1 day 19 hours', 'Programada'),
(20, 2, 'Moana 2', 'Animación', 'Todo publico', 'Español', 100, DATE_TRUNC('day', NOW()) + INTERVAL '1 day 15 hours', 'Programada'),
(21, 3, 'Top Gun: Maverick', 'Acción', '+12', 'Español', 130, DATE_TRUNC('day', NOW()) + INTERVAL '2 days 18 hours', 'Programada'),
(22, 4, 'Casablanca', 'Romance', '+7', 'Inglés subtitulado', 102, DATE_TRUNC('day', NOW()) + INTERVAL '2 days 20 hours', 'Programada'),
(23, 5, 'Interestelar', 'Ciencia ficción', '+12', 'Español', 169, DATE_TRUNC('day', NOW()) + INTERVAL '3 days 19 hours 30 minutes', 'Programada'),
(24, 1, 'El Padrino', 'Crimen', '+15', 'Español', 175, DATE_TRUNC('day', NOW()) + INTERVAL '4 days 18 hours 30 minutes', 'Programada'),
(25, 2, 'Coco', 'Animación', 'Todo publico', 'Español', 105, DATE_TRUNC('day', NOW()) + INTERVAL '5 days 14 hours', 'Programada'),
(26, 3, 'Pobres criaturas', 'Comedia dramática', '+18', 'Inglés subtitulado', 141, DATE_TRUNC('day', NOW()) + INTERVAL '7 days 20 hours', 'Programada'),
(27, 5, 'Barbie', 'Comedia', '+12', 'Español', 114, DATE_TRUNC('day', NOW()) + INTERVAL '8 days 17 hours', 'Programada'),
(28, 1, 'Encanto', 'Animación', 'Todo publico', 'Español', 102, DATE_TRUNC('day', NOW()) + INTERVAL '9 days 15 hours', 'Programada'),
(29, 4, 'Parásitos', 'Thriller', '+15', 'Coreano subtitulado', 132, DATE_TRUNC('day', NOW()) + INTERVAL '10 days 19 hours 30 minutes', 'Programada'),
(30, 2, 'Mad Max: Furia en el camino', 'Acción', '+15', 'Español', 120, DATE_TRUNC('day', NOW()) + INTERVAL '12 days 20 hours', 'Programada');


-- ----- SECCIÓN 6: Contratos (Estefania Paredes) -----
-- Necesita actores_directores, staff y funciones (secciones 3, 4 y 5).


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
