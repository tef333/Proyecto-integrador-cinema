// Avance 2 - MongoDB - Coleccion resenas_peliculas
// Responsable: Erika Gomez
//
// CONSULTA (aggregation con $lookup): calificacion promedio por pelicula con
// datos de la ficha tecnica.
// Proposito: ver que peliculas gustan mas al publico y cruzarlo con director,
// genero y clasificacion para decidir que programar de nuevo.
// Tecnicas: $group por id_pelicula (promedio, conteo y resenas respondidas),
// $match sobre el agregado, $lookup a fichas_tecnicas_peliculas por el
// id_pelicula compartido, $unwind, $project y $sort.
// Requiere haber cargado fichas_tecnicas_peliculas.

db.resenas_peliculas.aggregate([
  {
    $group: {
      _id: "$id_pelicula",
      total_resenas: { $sum: 1 },
      calificacion_promedio: { $avg: "$calificacion" },
      resenas_respondidas: {
        $sum: { $cond: [{ $ifNull: ["$respuesta_empresa", false] }, 1, 0] }
      }
    }
  },
  { $match: { total_resenas: { $gte: 2 } } },
  {
    $lookup: {
      from: "fichas_tecnicas_peliculas",
      localField: "_id",
      foreignField: "id_pelicula",
      as: "ficha_tecnica"
    }
  },
  { $unwind: "$ficha_tecnica" },
  {
    $project: {
      _id: 0,
      id_pelicula: "$_id",
      titulo: "$ficha_tecnica.titulo_pelicula",
      director: { $arrayElemAt: ["$ficha_tecnica.ficha.directores", 0] },
      generos: "$ficha_tecnica.ficha.generos",
      clasificacion: "$ficha_tecnica.ficha.clasificacion",
      total_resenas: 1,
      resenas_respondidas: 1,
      calificacion_promedio: { $round: ["$calificacion_promedio", 2] }
    }
  },
  { $sort: { calificacion_promedio: -1, total_resenas: -1, titulo: 1 } }
]);

// Insercion invalida que se RECHAZA (evidencia del $jsonSchema): debe dar "Document failed validation"
// porque (falta id_espectador, la calificacion 7 esta fuera de 1 a 5 y el comentario es muy corto)
db.resenas_peliculas.insertOne({
  id_resena: 999,
  id_pelicula: 1,
  calificacion: 7,
  comentario: "ok",
  fecha: new Date()
});