// Avance 2 - MongoDB - Coleccion resenas_peliculas
// Responsable: Erika Gomez
//
// Inserta 32 resenas. Cada resena es de un espectador que compro boleta pagada
// para esa funcion (ventas del 02 de PostgreSQL) y la funcion ya esta Finalizada
// (ids 1 a 16). En esas funciones id_pelicula = id_funcion. Fechas: el dia de la
// funcion (referencia hoy = 2026-11-06, igual que las otras colecciones) mas 1 a 3
// dias. Campos opcionales: recomendaria, etiquetas, aspectos, respuesta_empresa.

db.resenas_peliculas.deleteMany({});

// Insercion valida que se ACEPTA (evidencia del $jsonSchema): resena 1
db.resenas_peliculas.insertOne(
{
  id_resena: 1,
  id_pelicula: 1,
  id_funcion: 1,
  id_espectador: 4,
  calificacion: 5,
  comentario: "Actuación impecable y un guion muy bien armado, aunque se siente larga.",
  fecha: ISODate("2026-10-10T12:00:00-05:00"),
  recomendaria: true,
  etiquetas: [
    "actuaciones",
    "guion"
  ],
  aspectos: {
    imagen: 5,
    sonido: 4
  }
});

// Resto de documentos: resenas 2 a 32
db.resenas_peliculas.insertMany([
  {
    id_resena: 2,
    id_pelicula: 1,
    id_funcion: 1,
    id_espectador: 10,
    calificacion: 4,
    comentario: "Muy buena, pero el sonido de la sala estaba un poco alto en las escenas de explosiones.",
    fecha: ISODate("2026-10-11T12:00:00-05:00"),
    recomendaria: true,
    aspectos: {
      sonido: 3,
      comodidad: 4
    },
    respuesta_empresa: {
      id_staff: 2,
      fecha: ISODate("2026-10-12T12:00:00-05:00"),
      texto: "Gracias por el comentario; ya ajustamos el nivel de sonido de la sala."
    }
  },
  {
    id_resena: 3,
    id_pelicula: 2,
    id_funcion: 2,
    id_espectador: 19,
    calificacion: 5,
    comentario: "Hermosa y emotiva, mi familia la disfrutó muchísimo.",
    fecha: ISODate("2026-10-11T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "familiar",
      "música"
    ]
  },
  {
    id_resena: 4,
    id_pelicula: 2,
    id_funcion: 2,
    id_espectador: 6,
    calificacion: 5,
    comentario: "La música me hizo llorar. Perfecta para ver con los niños.",
    fecha: ISODate("2026-10-12T12:00:00-05:00"),
    recomendaria: true
  },
  {
    id_resena: 5,
    id_pelicula: 3,
    id_funcion: 3,
    id_espectador: 24,
    calificacion: 5,
    comentario: "Brillante mezcla de humor y tensión; los subtítulos se leían muy bien.",
    fecha: ISODate("2026-10-13T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "subtitulada",
      "thriller"
    ],
    aspectos: {
      imagen: 5
    }
  },
  {
    id_resena: 6,
    id_pelicula: 3,
    id_funcion: 3,
    id_espectador: 3,
    calificacion: 4,
    comentario: "Me gustó mucho, aunque el 3D no aportó nada en esta película.",
    fecha: ISODate("2026-10-15T12:00:00-05:00"),
    recomendaria: true,
    aspectos: {
      imagen: 3
    }
  },
  {
    id_resena: 7,
    id_pelicula: 4,
    id_funcion: 4,
    id_espectador: 2,
    calificacion: 5,
    comentario: "La experiencia IMAX es espectacular: imagen enorme y sonido que se siente en el pecho.",
    fecha: ISODate("2026-10-14T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "IMAX",
      "efectos visuales"
    ],
    aspectos: {
      imagen: 5,
      sonido: 5,
      comodidad: 5
    }
  },
  {
    id_resena: 8,
    id_pelicula: 4,
    id_funcion: 4,
    id_espectador: 13,
    calificacion: 3,
    comentario: "Visualmente impresionante, pero hubo una pausa de varios minutos por una falla del proyector.",
    fecha: ISODate("2026-10-15T12:00:00-05:00"),
    recomendaria: false,
    aspectos: {
      imagen: 4,
      servicio: 3
    },
    respuesta_empresa: {
      id_staff: 7,
      fecha: ISODate("2026-10-16T12:00:00-05:00"),
      texto: "Lamentamos la interrupción. Realineamos el equipo y reforzamos la revisión previa a cada función."
    }
  },
  {
    id_resena: 9,
    id_pelicula: 5,
    id_funcion: 5,
    id_espectador: 1,
    calificacion: 5,
    comentario: "La sala VIP hizo la diferencia: sillas cómodas y muy buen servicio.",
    fecha: ISODate("2026-10-16T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "VIP",
      "musical"
    ],
    aspectos: {
      comodidad: 5,
      servicio: 5
    }
  },
  {
    id_resena: 10,
    id_pelicula: 5,
    id_funcion: 5,
    id_espectador: 17,
    calificacion: 4,
    comentario: "Una película encantadora, con una música que se queda en la cabeza.",
    fecha: ISODate("2026-10-17T12:00:00-05:00"),
    recomendaria: true
  },
  {
    id_resena: 11,
    id_pelicula: 6,
    id_funcion: 6,
    id_espectador: 2,
    calificacion: 4,
    comentario: "Divertida y colorida, a mis hijos les encantaron las canciones.",
    fecha: ISODate("2026-10-17T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "familiar"
    ]
  },
  {
    id_resena: 12,
    id_pelicula: 7,
    id_funcion: 7,
    id_espectador: 24,
    calificacion: 5,
    comentario: "Tres horas y media que pasan sin sentir, con actuaciones enormes.",
    fecha: ISODate("2026-10-18T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "actuaciones",
      "clásico moderno"
    ],
    aspectos: {
      sonido: 4
    }
  },
  {
    id_resena: 13,
    id_pelicula: 7,
    id_funcion: 7,
    id_espectador: 12,
    calificacion: 3,
    comentario: "Buena, pero muy larga; hubiera agradecido un intermedio.",
    fecha: ISODate("2026-10-19T12:00:00-05:00"),
    recomendaria: false,
    aspectos: {
      comodidad: 3
    }
  },
  {
    id_resena: 14,
    id_pelicula: 8,
    id_funcion: 8,
    id_espectador: 17,
    calificacion: 4,
    comentario: "Una interpretación enorme del protagonista; película incómoda y muy bien lograda.",
    fecha: ISODate("2026-10-20T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "actuaciones"
    ],
    aspectos: {
      imagen: 4,
      sonido: 5
    }
  },
  {
    id_resena: 15,
    id_pelicula: 8,
    id_funcion: 8,
    id_espectador: 8,
    calificacion: 2,
    comentario: "Demasiado oscura para mi gusto y con un ritmo lento.",
    fecha: ISODate("2026-10-21T12:00:00-05:00"),
    recomendaria: false
  },
  {
    id_resena: 16,
    id_pelicula: 9,
    id_funcion: 9,
    id_espectador: 4,
    calificacion: 4,
    comentario: "Divertida y con un mensaje muy bonito sobre las emociones.",
    fecha: ISODate("2026-10-22T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "animación",
      "familiar"
    ]
  },
  {
    id_resena: 17,
    id_pelicula: 9,
    id_funcion: 9,
    id_espectador: 29,
    calificacion: 5,
    comentario: "Me hizo reír y reflexionar; fui sin niños y la disfruté igual.",
    fecha: ISODate("2026-10-23T12:00:00-05:00"),
    recomendaria: true
  },
  {
    id_resena: 18,
    id_pelicula: 10,
    id_funcion: 10,
    id_espectador: 10,
    calificacion: 4,
    comentario: "Colorida, inteligente y muy divertida; la sala estuvo llena.",
    fecha: ISODate("2026-10-24T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "comedia"
    ],
    aspectos: {
      servicio: 4
    }
  },
  {
    id_resena: 19,
    id_pelicula: 10,
    id_funcion: 10,
    id_espectador: 25,
    calificacion: 3,
    comentario: "Está bien, pero esperaba más profundidad en la historia.",
    fecha: ISODate("2026-10-26T12:00:00-05:00"),
    recomendaria: false
  },
  {
    id_resena: 20,
    id_pelicula: 10,
    id_funcion: 10,
    id_espectador: 9,
    calificacion: 5,
    comentario: "Mejor de lo que esperaba, con una dirección de arte increíble.",
    fecha: ISODate("2026-10-25T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "dirección de arte"
    ],
    aspectos: {
      imagen: 5
    }
  },
  {
    id_resena: 21,
    id_pelicula: 11,
    id_funcion: 11,
    id_espectador: 16,
    calificacion: 5,
    comentario: "Un clásico que conmueve; la sala VIP fue ideal para verlo con calma.",
    fecha: ISODate("2026-10-26T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "clásico",
      "VIP"
    ],
    aspectos: {
      comodidad: 5,
      servicio: 4
    }
  },
  {
    id_resena: 22,
    id_pelicula: 11,
    id_funcion: 11,
    id_espectador: 4,
    calificacion: 5,
    comentario: "Emocionante de principio a fin; el final me dejó sin palabras.",
    fecha: ISODate("2026-10-28T12:00:00-05:00"),
    recomendaria: true,
    respuesta_empresa: {
      id_staff: 1,
      fecha: ISODate("2026-10-29T12:00:00-05:00"),
      texto: "Nos alegra que la haya disfrutado; pronto programaremos más clásicos."
    }
  },
  {
    id_resena: 23,
    id_pelicula: 12,
    id_funcion: 12,
    id_espectador: 6,
    calificacion: 4,
    comentario: "Pura adrenalina, pero la película exige mucho sonido y la sala 2 se quedó corta.",
    fecha: ISODate("2026-10-28T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "acción"
    ],
    aspectos: {
      sonido: 3
    }
  },
  {
    id_resena: 24,
    id_pelicula: 12,
    id_funcion: 12,
    id_espectador: 22,
    calificacion: 5,
    comentario: "Una locura visual de principio a fin; la volvería a ver mañana.",
    fecha: ISODate("2026-10-29T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "acción",
      "efectos"
    ]
  },
  {
    id_resena: 25,
    id_pelicula: 13,
    id_funcion: 13,
    id_espectador: 18,
    calificacion: 4,
    comentario: "Espectacular en IMAX, aunque la historia es predecible.",
    fecha: ISODate("2026-10-29T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "IMAX"
    ],
    aspectos: {
      imagen: 5,
      sonido: 5
    }
  },
  {
    id_resena: 26,
    id_pelicula: 13,
    id_funcion: 13,
    id_espectador: 28,
    calificacion: 5,
    comentario: "La mejor experiencia de cine que he tenido; el agua parece real.",
    fecha: ISODate("2026-10-30T12:00:00-05:00"),
    recomendaria: true,
    aspectos: {
      imagen: 5
    }
  },
  {
    id_resena: 27,
    id_pelicula: 14,
    id_funcion: 14,
    id_espectador: 1,
    calificacion: 5,
    comentario: "Un rompecabezas que hay que ver más de una vez; el 3D está bien usado.",
    fecha: ISODate("2026-10-31T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "ciencia ficción",
      "3D"
    ],
    aspectos: {
      imagen: 5,
      sonido: 4
    }
  },
  {
    id_resena: 28,
    id_pelicula: 14,
    id_funcion: 14,
    id_espectador: 26,
    calificacion: 4,
    comentario: "Muy buena, aunque hay que prestar atención para no perderse.",
    fecha: ISODate("2026-11-01T12:00:00-05:00"),
    recomendaria: true
  },
  {
    id_resena: 29,
    id_pelicula: 15,
    id_funcion: 15,
    id_espectador: 15,
    calificacion: 5,
    comentario: "Animación fresca y diferente a todo lo que había visto.",
    fecha: ISODate("2026-11-02T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "animación",
      "familiar"
    ],
    aspectos: {
      imagen: 5
    }
  },
  {
    id_resena: 30,
    id_pelicula: 15,
    id_funcion: 15,
    id_espectador: 27,
    calificacion: 4,
    comentario: "Estilo visual único y una historia con mucho corazón.",
    fecha: ISODate("2026-11-03T12:00:00-05:00"),
    recomendaria: true
  },
  {
    id_resena: 31,
    id_pelicula: 16,
    id_funcion: 16,
    id_espectador: 24,
    calificacion: 5,
    comentario: "Encantadora y llena de detalles; el servicio en la sala VIP fue excelente.",
    fecha: ISODate("2026-11-03T12:00:00-05:00"),
    recomendaria: true,
    etiquetas: [
      "romántica",
      "VIP"
    ],
    aspectos: {
      comodidad: 5,
      servicio: 5
    }
  },
  {
    id_resena: 32,
    id_pelicula: 16,
    id_funcion: 16,
    id_espectador: 25,
    calificacion: 3,
    comentario: "Bonita pero algo lenta; me costó conectar con la historia.",
    fecha: ISODate("2026-11-05T12:00:00-05:00"),
    recomendaria: false,
    aspectos: {
      comodidad: 4
    }
  }
]);

db.resenas_peliculas.countDocuments();