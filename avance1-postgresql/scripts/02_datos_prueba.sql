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

-- 12 contratos de funciones especiales (estrenos, conversatorios y presentaciones).
-- Las fechas se calculan a partir de la fecha de la función, así la vigencia
-- siempre la cubre sin importar el día en que se corra el script.
--   Finalizado: función ya realizada. Vigente: función programada.
--   Cancelado: función cancelada. Firman el staff 1 (Administrador) y 2 (Coordinador).
--   El artista 10 está inactivo: solo tiene un contrato histórico (Finalizado).
INSERT INTO contratos
    (id_contrato, id_actor_director, id_funcion, id_staff, objeto, tipo_contrato, fecha_inicio, fecha_fin, valor, estado)
SELECT v.id_contrato, v.id_actor_director, v.id_funcion, v.id_staff, v.objeto, v.tipo_contrato,
       f.fecha_hora_inicio::DATE - v.dias_antes,
       f.fecha_hora_inicio::DATE + v.dias_despues,
       v.valor, v.estado
FROM (VALUES
    (1,   2,  1, 1, 'Conversatorio con el director después de la proyección',  'Conversatorio', 15, 3, 900000, 'Finalizado'),
    (2,   6,  3, 2, 'Conversatorio sobre cine de autor con el director',       'Conversatorio', 15, 3, 1900000, 'Finalizado'),
    (3,   7,  5, 1, 'Presentación en vivo antes de la función musical',        'Presentacion',  10, 2, 700000, 'Finalizado'),
    (4,  10,  7, 2, 'Evento especial con actor invitado',                      'Evento',        10, 2, 600000, 'Finalizado'),
    (5,  22, 11, 1, 'Conversatorio sobre cine clásico con el director',        'Conversatorio', 15, 3, 1000000, 'Finalizado'),
    (6,   4, 17, 1, 'Estreno con presencia del elenco (función cancelada)',    'Estreno',       10, 2, 900000, 'Cancelado'),
    (7,  20, 18, 2, 'Conversatorio con actor invitado (función cancelada)',    'Conversatorio', 10, 2, 600000, 'Cancelado'),
    (8,   1, 19, 1, 'Estreno con presencia del elenco',                        'Estreno',        7, 3, 1000000, 'Vigente'),
    (9,   3, 19, 1, 'Estreno con presencia del elenco',                        'Estreno',        7, 3, 800000, 'Vigente'),
    (10,  8, 22, 2, 'Conversatorio con el director después de la proyección',  'Conversatorio',  7, 3, 700000, 'Vigente'),
    (11, 29, 26, 2, 'Estreno con la actriz y directora invitada',              'Estreno',       10, 3, 1100000, 'Vigente'),
    (12, 19, 29, 1, 'Conversatorio con la directora después de la proyección', 'Conversatorio', 10, 3, 800000, 'Vigente')
) AS v(id_contrato, id_actor_director, id_funcion, id_staff, objeto, tipo_contrato, dias_antes, dias_despues, valor, estado)
JOIN funciones f ON f.id_funcion = v.id_funcion;



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
INSERT INTO ventas
    (id_venta, id_funcion, id_espectador, id_tipo_boleta, id_staff, fecha_venta,
     cantidad, precio_unitario, canal_venta, metodo_pago, estado)
SELECT v.id_venta, v.id_funcion, v.id_espectador, v.id_tipo_boleta, v.id_staff,
       CASE WHEN f.fecha_hora_inicio > NOW()
            THEN NOW() - v.horas * INTERVAL '1 hour'
            ELSE f.fecha_hora_inicio - v.horas * INTERVAL '1 hour' END,
       v.cantidad, t.precio, v.canal_venta, v.metodo_pago, v.estado
FROM (VALUES
    -- Función 1: Oppenheimer · Sala 1 (150)
    (1, 1, 4, 1, 3, 2, 10, 'Taquilla', 'Efectivo', 'Pagada'),
    (2, 1, 26, 2, 4, 5, 1, 'Taquilla', 'Transferencia', 'Pagada'),
    (3, 1, 10, 6, NULL, 15, 2, 'Online', 'Tarjeta', 'Pagada'),
    (4, 1, 11, 1, NULL, 47, 6, 'Online', 'Tarjeta', 'Pagada'),
    (5, 1, 29, 1, 7, 6, 6, 'Taquilla', 'Efectivo', 'Pagada'),
    (6, 1, 10, 1, NULL, 85, 5, 'Online', 'Tarjeta', 'Pagada'),
    (7, 1, 20, 1, 3, 3, 2, 'Taquilla', 'Tarjeta', 'Pagada'),
    (8, 1, 13, 6, 4, 1, 2, 'Taquilla', 'Transferencia', 'Pagada'),
    (9, 1, 13, 1, NULL, 36, 8, 'Online', 'Transferencia', 'Pagada'),
    (10, 1, 25, 1, 7, 5, 8, 'Taquilla', 'Efectivo', 'Pagada'),
    (11, 1, 4, 1, 3, 6, 2, 'Taquilla', 'Efectivo', 'Pagada'),
    (12, 1, 20, 1, 4, 6, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    -- Función 2: Coco · Sala 2 (150)
    (13, 2, 19, 1, NULL, 88, 10, 'Online', 'Tarjeta', 'Pagada'),
    (14, 2, 30, 2, 7, 4, 2, 'Taquilla', 'Transferencia', 'Pagada'),
    (15, 2, 10, 1, NULL, 86, 5, 'Online', 'Tarjeta', 'Pagada'),
    (16, 2, 25, 1, 3, 2, 10, 'Taquilla', 'Tarjeta', 'Pagada'),
    (17, 2, 6, 1, 4, 4, 10, 'Taquilla', 'Transferencia', 'Pagada'),
    (18, 2, 13, 1, NULL, 59, 3, 'Online', 'Tarjeta', 'Pagada'),
    -- Función 3: Parásitos · Sala 3 (120)
    (19, 3, 19, 1, NULL, 57, 10, 'Online', 'Tarjeta', 'Pagada'),
    (20, 3, 24, 1, 7, 3, 3, 'Taquilla', 'Transferencia', 'Pagada'),
    (21, 3, 3, 1, 3, 1, 8, 'Taquilla', 'Efectivo', 'Pagada'),
    (22, 3, 11, 2, 4, 2, 1, 'Taquilla', 'Efectivo', 'Pagada'),
    (23, 3, 4, 6, 7, 6, 2, 'Taquilla', 'Tarjeta', 'Pagada'),
    (24, 3, 20, 1, NULL, 76, 2, 'Online', 'Transferencia', 'Pagada'),
    (25, 3, 22, 1, 3, 5, 8, 'Taquilla', 'Efectivo', 'Pagada'),
    (26, 3, 6, 1, NULL, 88, 10, 'Online', 'Tarjeta', 'Pagada'),
    (27, 3, 4, 1, 4, 2, 5, 'Taquilla', 'Transferencia', 'Pagada'),
    (28, 3, 13, 1, 7, 1, 1, 'Taquilla', 'Transferencia', 'Pagada'),
    (29, 3, 9, 1, NULL, 55, 2, 'Online', 'Transferencia', 'Anulada'),
    -- Función 4: Dune: Parte Dos · IMAX (220)
    (30, 4, 2, 1, 3, 1, 6, 'Taquilla', 'Efectivo', 'Pagada'),
    (31, 4, 13, 1, 4, 3, 6, 'Taquilla', 'Transferencia', 'Pagada'),
    (32, 4, 27, 1, 7, 2, 8, 'Taquilla', 'Efectivo', 'Pagada'),
    (33, 4, 15, 1, 3, 4, 4, 'Taquilla', 'Tarjeta', 'Pagada'),
    (34, 4, 16, 2, 4, 2, 1, 'Taquilla', 'Efectivo', 'Pagada'),
    (35, 4, 17, 4, 7, 4, 2, 'Taquilla', 'Efectivo', 'Pagada'),
    (36, 4, 24, 1, 3, 2, 4, 'Taquilla', 'Efectivo', 'Pagada'),
    (37, 4, 17, 4, 4, 2, 2, 'Taquilla', 'Efectivo', 'Pagada'),
    (38, 4, 18, 2, 7, 1, 1, 'Taquilla', 'Transferencia', 'Pagada'),
    (39, 4, 10, 1, NULL, 62, 4, 'Online', 'Tarjeta', 'Pagada'),
    (40, 4, 12, 1, NULL, 44, 6, 'Online', 'Tarjeta', 'Pagada'),
    (41, 4, 13, 1, NULL, 38, 8, 'Online', 'Transferencia', 'Pagada'),
    (42, 4, 24, 1, NULL, 61, 4, 'Online', 'Tarjeta', 'Pagada'),
    (43, 4, 15, 1, 3, 1, 6, 'Taquilla', 'Efectivo', 'Pagada'),
    (44, 4, 8, 1, NULL, 76, 4, 'Online', 'Transferencia', 'Pagada'),
    (45, 4, 22, 1, NULL, 38, 4, 'Online', 'Transferencia', 'Pagada'),
    (46, 4, 10, 1, 4, 6, 4, 'Taquilla', 'Tarjeta', 'Pagada'),
    (47, 4, 12, 1, 7, 4, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    (48, 4, 4, 1, 3, 6, 2, 'Taquilla', 'Efectivo', 'Pagada'),
    (49, 4, 19, 1, NULL, 11, 10, 'Online', 'Transferencia', 'Pagada'),
    (50, 4, 4, 1, NULL, 11, 1, 'Online', 'Tarjeta', 'Pagada'),
    (51, 4, 19, 1, 7, 1, 3, 'Taquilla', 'Efectivo', 'Anulada'),
    -- Función 5: La La Land · VIP (60)
    (52, 5, 1, 5, 4, 1, 2, 'Taquilla', 'Efectivo', 'Pagada'),
    (53, 5, 3, 5, NULL, 90, 1, 'Online', 'Tarjeta', 'Pagada'),
    (54, 5, 13, 5, NULL, 80, 2, 'Online', 'Tarjeta', 'Pagada'),
    (55, 5, 17, 5, NULL, 43, 4, 'Online', 'Tarjeta', 'Pagada'),
    (56, 5, 16, 5, 7, 6, 4, 'Taquilla', 'Efectivo', 'Pagada'),
    (57, 5, 10, 5, 3, 4, 4, 'Taquilla', 'Tarjeta', 'Pagada'),
    (58, 5, 9, 5, NULL, 58, 2, 'Online', 'Transferencia', 'Pagada'),
    (59, 5, 25, 5, 4, 6, 2, 'Taquilla', 'Tarjeta', 'Pagada'),
    (60, 5, 28, 5, NULL, 43, 1, 'Online', 'Tarjeta', 'Pagada'),
    (61, 5, 15, 5, 7, 2, 1, 'Taquilla', 'Tarjeta', 'Pagada'),
    (62, 5, 13, 5, NULL, 18, 1, 'Online', 'Tarjeta', 'Pagada'),
    (63, 5, 2, 5, NULL, 86, 4, 'Online', 'Transferencia', 'Pagada'),
    (64, 5, 8, 5, 3, 4, 3, 'Taquilla', 'Tarjeta', 'Pagada'),
    (65, 5, 10, 5, 4, 2, 2, 'Taquilla', 'Efectivo', 'Pagada'),
    (66, 5, 4, 5, 7, 3, 1, 'Taquilla', 'Transferencia', 'Pagada'),
    (67, 5, 24, 5, NULL, 72, 2, 'Online', 'Tarjeta', 'Pagada'),
    (68, 5, 13, 5, 3, 6, 2, 'Taquilla', 'Efectivo', 'Anulada'),
    -- Función 6: Encanto · Sala 1 (150), poca asistencia
    (69, 6, 12, 1, NULL, 78, 6, 'Online', 'Transferencia', 'Pagada'),
    (70, 6, 2, 1, 3, 3, 2, 'Taquilla', 'Tarjeta', 'Pagada'),
    (71, 6, 17, 1, 4, 4, 2, 'Taquilla', 'Efectivo', 'Pagada'),
    (72, 6, 2, 1, 7, 6, 10, 'Taquilla', 'Transferencia', 'Pagada'),
    -- Función 7: El Irlandés · Sala 2 (150), función especial casi llena
    (73, 7, 29, 1, 3, 3, 4, 'Taquilla', 'Tarjeta', 'Pagada'),
    (74, 7, 24, 1, NULL, 61, 6, 'Online', 'Transferencia', 'Pagada'),
    (75, 7, 13, 1, 4, 2, 8, 'Taquilla', 'Tarjeta', 'Pagada'),
    (76, 7, 4, 1, NULL, 48, 6, 'Online', 'Tarjeta', 'Pagada'),
    (77, 7, 24, 1, 7, 6, 10, 'Taquilla', 'Efectivo', 'Pagada'),
    (78, 7, 4, 1, NULL, 36, 5, 'Online', 'Transferencia', 'Pagada'),
    (79, 7, 6, 1, 3, 5, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    (80, 7, 8, 1, 4, 4, 5, 'Taquilla', 'Transferencia', 'Pagada'),
    (81, 7, 13, 1, 7, 5, 10, 'Taquilla', 'Efectivo', 'Pagada'),
    (82, 7, 2, 1, 3, 5, 4, 'Taquilla', 'Tarjeta', 'Pagada'),
    (83, 7, 9, 1, 4, 2, 2, 'Taquilla', 'Efectivo', 'Pagada'),
    (84, 7, 27, 1, 7, 2, 5, 'Taquilla', 'Tarjeta', 'Pagada'),
    (85, 7, 29, 1, 3, 5, 4, 'Taquilla', 'Efectivo', 'Pagada'),
    (86, 7, 17, 1, 4, 6, 6, 'Taquilla', 'Efectivo', 'Pagada'),
    (87, 7, 12, 1, NULL, 23, 4, 'Online', 'Tarjeta', 'Pagada'),
    (88, 7, 1, 1, 7, 3, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    (89, 7, 2, 1, NULL, 79, 5, 'Online', 'Tarjeta', 'Pagada'),
    (90, 7, 17, 1, 3, 4, 6, 'Taquilla', 'Efectivo', 'Pagada'),
    (91, 7, 10, 1, 4, 4, 5, 'Taquilla', 'Tarjeta', 'Pagada'),
    (92, 7, 27, 1, 7, 3, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    (93, 7, 18, 2, NULL, 14, 2, 'Online', 'Tarjeta', 'Pagada'),
    (94, 7, 20, 1, NULL, 31, 5, 'Online', 'Transferencia', 'Pagada'),
    (95, 7, 6, 1, 3, 3, 6, 'Taquilla', 'Tarjeta', 'Pagada'),
    (96, 7, 25, 1, 4, 2, 8, 'Taquilla', 'Efectivo', 'Pagada'),
    (97, 7, 20, 1, 7, 3, 4, 'Taquilla', 'Tarjeta', 'Pagada'),
    (98, 7, 10, 1, NULL, 75, 1, 'Online', 'Tarjeta', 'Pagada'),
    -- Función 8: Joker · IMAX (220), +18
    (99, 8, 17, 4, NULL, 43, 1, 'Online', 'Tarjeta', 'Pagada'),
    (100, 8, 6, 1, NULL, 83, 8, 'Online', 'Transferencia', 'Pagada'),
    (101, 8, 8, 1, 3, 3, 6, 'Taquilla', 'Efectivo', 'Pagada'),
    (102, 8, 9, 1, 4, 1, 8, 'Taquilla', 'Transferencia', 'Pagada'),
    (103, 8, 13, 1, 7, 1, 6, 'Taquilla', 'Tarjeta', 'Pagada'),
    (104, 8, 18, 1, 3, 3, 10, 'Taquilla', 'Transferencia', 'Pagada'),
    (105, 8, 17, 4, 4, 3, 1, 'Taquilla', 'Efectivo', 'Pagada'),
    (106, 8, 13, 1, NULL, 85, 5, 'Online', 'Transferencia', 'Pagada'),
    (107, 8, 16, 1, 7, 3, 8, 'Taquilla', 'Transferencia', 'Pagada'),
    (108, 8, 1, 1, 3, 3, 4, 'Taquilla', 'Tarjeta', 'Pagada'),
    (109, 8, 1, 1, 4, 5, 3, 'Taquilla', 'Tarjeta', 'Pagada'),
    -- Función 9: Intensamente 2 · Sala 3 (120), poca asistencia
    (110, 9, 17, 4, NULL, 15, 2, 'Online', 'Tarjeta', 'Pagada'),
    (111, 9, 4, 1, 7, 5, 4, 'Taquilla', 'Efectivo', 'Pagada'),
    (112, 9, 18, 1, 3, 1, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    (113, 9, 2, 1, NULL, 68, 6, 'Online', 'Transferencia', 'Pagada'),
    (114, 9, 29, 1, 4, 3, 7, 'Taquilla', 'Tarjeta', 'Pagada'),
    -- Función 10: Barbie · Sala 1 (150)
    (115, 10, 10, 1, NULL, 35, 8, 'Online', 'Tarjeta', 'Pagada'),
    (116, 10, 2, 1, NULL, 49, 8, 'Online', 'Tarjeta', 'Pagada'),
    (117, 10, 6, 1, NULL, 68, 8, 'Online', 'Tarjeta', 'Pagada'),
    (118, 10, 24, 1, NULL, 9, 6, 'Online', 'Transferencia', 'Pagada'),
    (119, 10, 24, 1, 7, 4, 3, 'Taquilla', 'Tarjeta', 'Pagada'),
    (120, 10, 15, 1, 3, 4, 10, 'Taquilla', 'Tarjeta', 'Pagada'),
    (121, 10, 9, 1, NULL, 74, 6, 'Online', 'Tarjeta', 'Pagada'),
    (122, 10, 25, 1, 4, 6, 4, 'Taquilla', 'Transferencia', 'Pagada'),
    (123, 10, 3, 2, NULL, 29, 1, 'Online', 'Tarjeta', 'Pagada'),
    (124, 10, 10, 1, NULL, 37, 10, 'Online', 'Tarjeta', 'Pagada'),
    (125, 10, 20, 1, NULL, 44, 6, 'Online', 'Transferencia', 'Pagada'),
    (126, 10, 2, 1, NULL, 76, 4, 'Online', 'Transferencia', 'Anulada'),
    -- Función 11: Cinema Paradiso · VIP (60), casi vacía
    (127, 11, 10, 5, 7, 2, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    (128, 11, 16, 5, 3, 6, 2, 'Taquilla', 'Efectivo', 'Pagada'),
    (129, 11, 15, 5, NULL, 25, 1, 'Online', 'Tarjeta', 'Pagada'),
    (130, 11, 4, 5, 4, 4, 4, 'Taquilla', 'Efectivo', 'Pagada'),
    (131, 11, 4, 5, 7, 4, 1, 'Taquilla', 'Efectivo', 'Pagada'),
    (132, 11, 18, 5, 3, 3, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    -- Función 12: Mad Max · Sala 2 (150)
    (133, 12, 6, 1, 4, 4, 6, 'Taquilla', 'Efectivo', 'Pagada'),
    (134, 12, 18, 2, NULL, 8, 1, 'Online', 'Transferencia', 'Pagada'),
    (135, 12, 12, 1, NULL, 35, 2, 'Online', 'Transferencia', 'Pagada'),
    (136, 12, 10, 1, NULL, 14, 2, 'Online', 'Tarjeta', 'Pagada'),
    (137, 12, 10, 1, NULL, 33, 6, 'Online', 'Tarjeta', 'Pagada'),
    (138, 12, 4, 1, NULL, 71, 8, 'Online', 'Tarjeta', 'Pagada'),
    (139, 12, 30, 2, 7, 6, 1, 'Taquilla', 'Tarjeta', 'Pagada'),
    (140, 12, 4, 1, 3, 5, 5, 'Taquilla', 'Transferencia', 'Pagada'),
    (141, 12, 19, 1, 4, 6, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    (142, 12, 6, 1, NULL, 82, 3, 'Online', 'Transferencia', 'Pagada'),
    (143, 12, 22, 1, NULL, 58, 3, 'Online', 'Transferencia', 'Pagada'),
    (144, 12, 9, 1, NULL, 85, 6, 'Online', 'Tarjeta', 'Pagada'),
    (145, 12, 27, 1, NULL, 53, 4, 'Online', 'Tarjeta', 'Pagada'),
    -- Función 13: Avatar · IMAX (220)
    (146, 13, 1, 1, 7, 3, 10, 'Taquilla', 'Tarjeta', 'Pagada'),
    (147, 13, 12, 1, NULL, 74, 4, 'Online', 'Tarjeta', 'Pagada'),
    (148, 13, 6, 1, 3, 6, 6, 'Taquilla', 'Efectivo', 'Pagada'),
    (149, 13, 18, 2, 4, 4, 1, 'Taquilla', 'Efectivo', 'Pagada'),
    (150, 13, 12, 1, 7, 3, 10, 'Taquilla', 'Efectivo', 'Pagada'),
    (151, 13, 9, 1, 3, 5, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    (152, 13, 27, 1, NULL, 76, 3, 'Online', 'Transferencia', 'Pagada'),
    (153, 13, 28, 2, NULL, 20, 2, 'Online', 'Tarjeta', 'Pagada'),
    (154, 13, 2, 1, NULL, 35, 6, 'Online', 'Transferencia', 'Pagada'),
    (155, 13, 1, 1, 4, 5, 2, 'Taquilla', 'Efectivo', 'Pagada'),
    (156, 13, 13, 1, 7, 4, 6, 'Taquilla', 'Tarjeta', 'Pagada'),
    (157, 13, 6, 1, 3, 2, 8, 'Taquilla', 'Transferencia', 'Pagada'),
    (158, 13, 13, 1, 4, 2, 6, 'Taquilla', 'Transferencia', 'Pagada'),
    (159, 13, 18, 2, 7, 4, 1, 'Taquilla', 'Transferencia', 'Pagada'),
    (160, 13, 16, 2, NULL, 70, 1, 'Online', 'Tarjeta', 'Pagada'),
    (161, 13, 11, 2, 3, 3, 1, 'Taquilla', 'Tarjeta', 'Pagada'),
    (162, 13, 24, 1, NULL, 24, 2, 'Online', 'Transferencia', 'Pagada'),
    (163, 13, 29, 1, 4, 5, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    (164, 13, 2, 1, 7, 1, 4, 'Taquilla', 'Efectivo', 'Pagada'),
    (165, 13, 24, 1, 3, 2, 6, 'Taquilla', 'Efectivo', 'Pagada'),
    (166, 13, 8, 1, 4, 5, 5, 'Taquilla', 'Efectivo', 'Pagada'),
    (167, 13, 9, 1, NULL, 7, 6, 'Online', 'Tarjeta', 'Pagada'),
    (168, 13, 8, 1, NULL, 73, 10, 'Online', 'Tarjeta', 'Pagada'),
    (169, 13, 20, 1, 7, 5, 4, 'Taquilla', 'Transferencia', 'Pagada'),
    (170, 13, 22, 1, 3, 6, 2, 'Taquilla', 'Transferencia', 'Anulada'),
    -- Función 14: El Origen · Sala 3 (120)
    (171, 14, 17, 4, 3, 1, 1, 'Taquilla', 'Transferencia', 'Pagada'),
    (172, 14, 9, 1, 4, 2, 4, 'Taquilla', 'Tarjeta', 'Pagada'),
    (173, 14, 1, 1, 7, 1, 2, 'Taquilla', 'Tarjeta', 'Pagada'),
    (174, 14, 26, 1, 3, 4, 4, 'Taquilla', 'Efectivo', 'Pagada'),
    (175, 14, 24, 1, NULL, 53, 10, 'Online', 'Transferencia', 'Pagada'),
    (176, 14, 12, 1, NULL, 52, 4, 'Online', 'Tarjeta', 'Pagada'),
    (177, 14, 13, 1, 4, 2, 8, 'Taquilla', 'Efectivo', 'Pagada'),
    (178, 14, 6, 1, NULL, 54, 10, 'Online', 'Tarjeta', 'Pagada'),
    (179, 14, 8, 1, 7, 3, 4, 'Taquilla', 'Efectivo', 'Pagada'),
    (180, 14, 2, 1, 3, 4, 4, 'Taquilla', 'Efectivo', 'Pagada'),
    (181, 14, 25, 1, 4, 2, 1, 'Taquilla', 'Tarjeta', 'Pagada'),
    -- Función 15: Spider-Man · Sala 1 (150)
    (182, 15, 13, 1, NULL, 14, 3, 'Online', 'Tarjeta', 'Pagada'),
    (183, 15, 29, 1, 7, 5, 8, 'Taquilla', 'Tarjeta', 'Pagada'),
    (184, 15, 27, 1, 3, 6, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    (185, 15, 6, 1, NULL, 41, 3, 'Online', 'Tarjeta', 'Pagada'),
    (186, 15, 15, 1, NULL, 4, 4, 'Online', 'Transferencia', 'Pagada'),
    (187, 15, 29, 1, 4, 6, 6, 'Taquilla', 'Efectivo', 'Pagada'),
    (188, 15, 11, 2, 7, 5, 2, 'Taquilla', 'Efectivo', 'Pagada'),
    (189, 15, 27, 1, NULL, 3, 8, 'Online', 'Tarjeta', 'Pagada'),
    (190, 15, 13, 1, NULL, 5, 3, 'Online', 'Tarjeta', 'Pagada'),
    -- Función 16: Amélie · VIP (60)
    (191, 16, 11, 5, 3, 6, 2, 'Taquilla', 'Transferencia', 'Pagada'),
    (192, 16, 17, 5, 4, 2, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    (193, 16, 24, 5, 7, 3, 3, 'Taquilla', 'Transferencia', 'Pagada'),
    (194, 16, 10, 5, 3, 3, 3, 'Taquilla', 'Tarjeta', 'Pagada'),
    (195, 16, 11, 5, 4, 3, 4, 'Taquilla', 'Tarjeta', 'Pagada'),
    (196, 16, 24, 5, 7, 2, 1, 'Taquilla', 'Efectivo', 'Pagada'),
    (197, 16, 4, 5, 3, 2, 2, 'Taquilla', 'Transferencia', 'Pagada'),
    (198, 16, 25, 5, NULL, 32, 2, 'Online', 'Tarjeta', 'Pagada'),
    (199, 16, 10, 5, NULL, 53, 4, 'Online', 'Transferencia', 'Pagada'),
    (200, 16, 4, 5, NULL, 71, 2, 'Online', 'Transferencia', 'Pagada'),
    -- Función 17: Pulp Fiction (CANCELADA) · todas las ventas anuladas
    (201, 17, 10, 1, 4, 2, 4, 'Taquilla', 'Transferencia', 'Anulada'),
    (202, 17, 4, 1, 7, 4, 2, 'Taquilla', 'Transferencia', 'Anulada'),
    (203, 17, 24, 1, NULL, 48, 2, 'Online', 'Transferencia', 'Anulada'),
    (204, 17, 19, 1, 3, 1, 3, 'Taquilla', 'Tarjeta', 'Anulada'),
    (205, 17, 13, 1, NULL, 85, 2, 'Online', 'Tarjeta', 'Anulada'),
    -- Función 18: Gladiador (CANCELADA) · todas las ventas anuladas
    (206, 18, 2, 1, NULL, 60, 3, 'Online', 'Tarjeta', 'Anulada'),
    (207, 18, 27, 1, 4, 17, 4, 'Taquilla', 'Efectivo', 'Anulada'),
    (208, 18, 6, 1, NULL, 62, 2, 'Online', 'Transferencia', 'Anulada'),
    (209, 18, 20, 1, NULL, 18, 2, 'Online', 'Tarjeta', 'Anulada'),
    -- Función 19: Deadpool y Wolverine · Sala 1 (150)
    (210, 19, 29, 1, NULL, 33, 5, 'Online', 'Tarjeta', 'Pagada'),
    (211, 19, 4, 1, NULL, 27, 5, 'Online', 'Transferencia', 'Pagada'),
    (212, 19, 9, 1, 4, 58, 6, 'Taquilla', 'Efectivo', 'Pagada'),
    (213, 19, 29, 1, 7, 6, 8, 'Taquilla', 'Tarjeta', 'Pagada'),
    (214, 19, 22, 1, NULL, 54, 10, 'Online', 'Tarjeta', 'Pagada'),
    (215, 19, 6, 1, 3, 66, 10, 'Taquilla', 'Tarjeta', 'Pagada'),
    (216, 19, 10, 1, 4, 3, 6, 'Taquilla', 'Efectivo', 'Pagada'),
    (217, 19, 4, 1, 4, 48, 4, 'Taquilla', 'Tarjeta', 'Anulada'),
    (218, 19, 12, 1, NULL, 69, 2, 'Online', 'Tarjeta', 'Anulada'),
    -- Función 20: Moana 2 · Sala 2
    (219, 20, 10, 1, NULL, 33, 6, 'Online', 'Tarjeta', 'Pagada'),
    (220, 20, 13, 1, NULL, 5, 6, 'Online', 'Transferencia', 'Pagada'),
    (221, 20, 4, 1, NULL, 52, 4, 'Online', 'Transferencia', 'Pagada'),
    (222, 20, 12, 1, 7, 49, 4, 'Taquilla', 'Efectivo', 'Pagada'),
    (223, 20, 2, 1, 3, 29, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    (224, 20, 10, 1, 4, 55, 5, 'Taquilla', 'Efectivo', 'Pagada'),
    -- Función 21: Top Gun: Maverick · Sala 3
    (225, 21, 6, 1, 7, 10, 5, 'Taquilla', 'Efectivo', 'Pagada'),
    (226, 21, 22, 1, 3, 14, 4, 'Taquilla', 'Transferencia', 'Pagada'),
    (227, 21, 17, 1, 4, 45, 4, 'Taquilla', 'Transferencia', 'Pagada'),
    (228, 21, 15, 1, NULL, 21, 3, 'Online', 'Tarjeta', 'Pagada'),
    (229, 21, 11, 1, 7, 18, 3, 'Taquilla', 'Transferencia', 'Pagada'),
    (230, 21, 2, 1, 3, 58, 8, 'Taquilla', 'Efectivo', 'Pagada'),
    (231, 21, 13, 1, 4, 8, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    -- Función 22: Casablanca · VIP
    (232, 22, 10, 5, 7, 69, 3, 'Taquilla', 'Tarjeta', 'Pagada'),
    (233, 22, 6, 5, NULL, 3, 1, 'Online', 'Tarjeta', 'Pagada'),
    (234, 22, 24, 5, 3, 35, 4, 'Taquilla', 'Tarjeta', 'Pagada'),
    (235, 22, 22, 5, 4, 48, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    (236, 22, 27, 5, 7, 35, 1, 'Taquilla', 'Efectivo', 'Pagada'),
    (237, 22, 9, 5, 3, 31, 4, 'Taquilla', 'Tarjeta', 'Pagada'),
    (238, 22, 20, 5, 4, 34, 4, 'Taquilla', 'Transferencia', 'Pagada'),
    -- Función 23: Interestelar · IMAX
    (239, 23, 2, 1, 7, 54, 5, 'Taquilla', 'Tarjeta', 'Pagada'),
    (240, 23, 20, 1, NULL, 58, 5, 'Online', 'Transferencia', 'Pagada'),
    (241, 23, 4, 1, NULL, 41, 10, 'Online', 'Tarjeta', 'Pagada'),
    (242, 23, 4, 1, NULL, 45, 4, 'Online', 'Tarjeta', 'Pagada'),
    (243, 23, 20, 1, 3, 56, 3, 'Taquilla', 'Transferencia', 'Pagada'),
    (244, 23, 17, 1, 4, 59, 3, 'Taquilla', 'Transferencia', 'Pagada'),
    (245, 23, 16, 2, NULL, 51, 1, 'Online', 'Tarjeta', 'Pagada'),
    (246, 23, 22, 1, 7, 48, 5, 'Taquilla', 'Efectivo', 'Pagada'),
    (247, 23, 12, 1, 3, 8, 2, 'Taquilla', 'Tarjeta', 'Pagada'),
    (248, 23, 3, 2, NULL, 34, 1, 'Online', 'Transferencia', 'Pagada'),
    (249, 23, 1, 1, NULL, 24, 4, 'Online', 'Tarjeta', 'Pagada'),
    (250, 23, 2, 1, 4, 15, 6, 'Taquilla', 'Transferencia', 'Pagada'),
    (251, 23, 19, 1, 7, 39, 6, 'Taquilla', 'Efectivo', 'Pagada'),
    (252, 23, 27, 1, NULL, 70, 3, 'Online', 'Tarjeta', 'Anulada'),
    -- Función 24: El Padrino · Sala 1
    (253, 24, 4, 1, NULL, 10, 6, 'Online', 'Transferencia', 'Pagada'),
    (254, 24, 27, 1, 3, 6, 3, 'Taquilla', 'Transferencia', 'Pagada'),
    (255, 24, 4, 1, 4, 54, 10, 'Taquilla', 'Tarjeta', 'Pagada'),
    (256, 24, 27, 1, 7, 26, 5, 'Taquilla', 'Transferencia', 'Pagada'),
    (257, 24, 6, 1, 7, 4, 2, 'Taquilla', 'Efectivo', 'Anulada'),
    -- Función 25: Coco · Sala 2
    (258, 25, 27, 1, NULL, 70, 6, 'Online', 'Tarjeta', 'Pagada'),
    (259, 25, 4, 1, 3, 60, 6, 'Taquilla', 'Efectivo', 'Pagada'),
    (260, 25, 29, 1, 4, 20, 2, 'Taquilla', 'Transferencia', 'Pagada'),
    -- Función 26: Pobres criaturas · Sala 3, +18
    (261, 26, 22, 1, 7, 18, 5, 'Taquilla', 'Efectivo', 'Pagada'),
    (262, 26, 10, 1, 3, 69, 5, 'Taquilla', 'Transferencia', 'Pagada'),
    (263, 26, 17, 4, 4, 5, 1, 'Taquilla', 'Tarjeta', 'Pagada'),
    (264, 26, 25, 1, 7, 48, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    -- Función 27: Barbie · IMAX
    (265, 27, 10, 1, 3, 48, 3, 'Taquilla', 'Efectivo', 'Pagada'),
    (266, 27, 15, 1, NULL, 26, 3, 'Online', 'Tarjeta', 'Pagada'),
    (267, 27, 10, 1, NULL, 16, 3, 'Online', 'Transferencia', 'Pagada'),
    (268, 27, 24, 1, 4, 46, 3, 'Taquilla', 'Transferencia', 'Pagada'),
    (269, 27, 24, 1, NULL, 34, 4, 'Online', 'Tarjeta', 'Pagada'),
    (270, 27, 18, 2, 7, 26, 2, 'Taquilla', 'Tarjeta', 'Pagada'),
    -- Función 28: Encanto · Sala 1
    (271, 28, 4, 1, 3, 10, 4, 'Taquilla', 'Transferencia', 'Pagada'),
    (272, 28, 27, 1, 4, 70, 4, 'Taquilla', 'Tarjeta', 'Pagada'),
    -- Función 29: Parásitos · VIP
    (273, 29, 2, 5, NULL, 37, 4, 'Online', 'Tarjeta', 'Pagada'),
    (274, 29, 12, 5, 7, 36, 1, 'Taquilla', 'Efectivo', 'Pagada'),
    (275, 29, 11, 5, NULL, 35, 1, 'Online', 'Tarjeta', 'Pagada'),
    (276, 29, 29, 5, NULL, 38, 3, 'Online', 'Tarjeta', 'Pagada'),
    (277, 29, 9, 5, 3, 57, 1, 'Taquilla', 'Tarjeta', 'Pagada'),
    -- Función 30: Mad Max · Sala 2
    (278, 30, 2, 1, 4, 5, 4, 'Taquilla', 'Efectivo', 'Pagada'),
    (279, 30, 29, 1, NULL, 14, 2, 'Online', 'Tarjeta', 'Pagada')
) AS v(id_venta, id_funcion, id_espectador, id_tipo_boleta, id_staff, horas,
       cantidad, canal_venta, metodo_pago, estado)
JOIN funciones f    ON f.id_funcion = v.id_funcion
JOIN tipos_boleta t ON t.id_tipo_boleta = v.id_tipo_boleta;

-- ----- SINCRONIZAR CONTADORES DE ID (Estefania Paredes) -----
SELECT setval(pg_get_serial_sequence('salas','id_sala'), COALESCE(MAX(id_sala),0)+1, false) FROM salas;
SELECT setval(pg_get_serial_sequence('tipos_boleta','id_tipo_boleta'), COALESCE(MAX(id_tipo_boleta),0)+1, false) FROM tipos_boleta;
SELECT setval(pg_get_serial_sequence('actores_directores','id_actor_director'), COALESCE(MAX(id_actor_director),0)+1, false) FROM actores_directores;
SELECT setval(pg_get_serial_sequence('staff','id_staff'), COALESCE(MAX(id_staff),0)+1, false) FROM staff;
SELECT setval(pg_get_serial_sequence('funciones','id_funcion'), COALESCE(MAX(id_funcion),0)+1, false) FROM funciones;
SELECT setval(pg_get_serial_sequence('contratos','id_contrato'), COALESCE(MAX(id_contrato),0)+1, false) FROM contratos;
SELECT setval(pg_get_serial_sequence('espectadores','id_espectador'), COALESCE(MAX(id_espectador),0)+1, false) FROM espectadores;
SELECT setval(pg_get_serial_sequence('ventas','id_venta'), COALESCE(MAX(id_venta),0)+1, false) FROM ventas;
