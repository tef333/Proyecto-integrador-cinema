// Avance 2 - MongoDB - Coleccion fichas_tecnicas_peliculas
// Responsable: Santiago Rojas
//
// CONSULTA (aggregation con $unwind): peliculas con mas idiomas y versiones.
// Proposito: decidir que peliculas necesitan mas copias y programacion (dobladas,
// subtituladas, 2D/3D/IMAX) y cuales se pueden concentrar en una sola version.
// Tecnicas: $unwind sobre el arreglo embebido "versiones", $group por pelicula
// con $addToSet (idiomas distintos) y $sum (total de versiones), $size, $sort y $limit.
// Una version es la combinacion idioma de audio / subtitulos / formato.

db.fichas_tecnicas_peliculas.aggregate([
  { $unwind: "$versiones" },
  {
    $group: {
      _id: "$id_pelicula",
      titulo_pelicula: { $first: "$titulo_pelicula" },
      idiomas: { $addToSet: "$versiones.idioma_audio" },
      total_versiones: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      id_pelicula: "$_id",
      titulo_pelicula: 1,
      total_idiomas: { $size: "$idiomas" },
      total_versiones: 1,
      idiomas: 1
    }
  },
  { $sort: { total_versiones: -1, total_idiomas: -1, titulo_pelicula: 1 } },
  { $limit: 10 }
]);

// Insercion invalida que se RECHAZA (evidencia del $jsonSchema): debe dar "Document failed validation"
// porque (faltan id_pelicula, ficha y actualizado_en, y versiones esta vacio)
db.fichas_tecnicas_peliculas.insertOne({ titulo_pelicula: "Prueba", versiones: [] });
