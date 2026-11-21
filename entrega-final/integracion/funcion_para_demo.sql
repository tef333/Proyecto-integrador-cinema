-- Crea una funcion futura para la demo (la sustentacion es el 24 o 26 de nov y
-- las funciones de los datos de prueba pueden haber pasado ya).
-- Ejecutar en Neon (base altamira_av1). Devuelve el id_funcion para usar en demo.py.
-- Sala 1 y pelicula 1 son del Avance 1; el horario (23:15 de pasado manana) se
-- elige para no cruzarse con otras funciones. Si el trigger de programacion
-- rechaza el horario, cambiar la hora o la sala.
INSERT INTO funciones (id_sala, id_pelicula, idioma, fecha_hora_inicio)
VALUES (1, 1, 'Español', date_trunc('day', now()) + interval '2 days 23 hours 15 minutes')
RETURNING id_funcion, fecha_hora_inicio;
