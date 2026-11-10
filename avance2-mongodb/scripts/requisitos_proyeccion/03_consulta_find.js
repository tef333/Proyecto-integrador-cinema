// Avance 2 - MongoDB - Coleccion requisitos_proyeccion
// Responsable: Jose Antonio Espin Molina (jespinn)
//
// CONSULTA (find): funciones en sala IMAX o 3D con su requisito tecnico.
// Proposito: que el equipo de proyeccion sepa que preparar para las
// funciones que exigen equipo especial (gafas 3D, doble proyector IMAX,
// relacion de aspecto, ensayo tecnico).
// Tecnicas: $in sobre formato_sala, proyeccion de campos embebidos,
// orden por id_funcion. Usa el indice ix_formato_funcion.

db.requisitos_proyeccion.find(
  { formato_sala: { $in: ["IMAX", "3D"] } },
  {
    _id: 0,
    id_funcion: 1,
    titulo_pelicula: 1,
    formato_sala: 1,
    "proyeccion.resolucion": 1,
    "proyeccion.relacion_aspecto": 1,
    "proyeccion.fps": 1,
    "audio.formato": 1,
    "requisitos_3d.tipo_gafas": 1,
    "requisitos_3d.gafas_requeridas": 1,
    "requisitos_imax.alineacion_doble_proyector": 1,
    "ensayo_tecnico.fecha": 1
  }
).sort({ id_funcion: 1 });

// Insercion invalida que se RECHAZA (evidencia del $jsonSchema): debe dar "Document failed validation"
// porque (falta id_funcion y el formato no existe)
db.requisitos_proyeccion.insertOne({ id_pelicula: 1, id_sala: 1, titulo_pelicula: "Prueba", formato_sala: "8K" });


// ----- BLOQUE: fichas_tecnicas_peliculas (Santiago Rojas) -----
// Avance 2 - MongoDB - Coleccion fichas_tecnicas_peliculas
// Responsable: Santiago Rojas
//
// CONSULTA (aggregation con $unwind): peliculas con mas idiomas y versiones.
// Proposito: decidir que peliculas necesitan mas copias y programacion (dobladas,
// subtituladas, 2D/3D/IMAX) y cuales se pueden concentrar en una sola version.
// Tecnicas: $unwind sobre el arreglo embebido "versiones", $group por pelicula
// con $addToSet (una pelicula con dos funciones tiene la ficha repetida y asi no
// se cuenta dos veces), $size, $sort y $limit.
// Una version es la combinacion idioma de audio / subtitulos / formato.

db.fichas_tecnicas_peliculas.aggregate([
  { $unwind: "$versiones" },
  {
    $group: {
      _id: "$id_pelicula",
      titulo_pelicula: { $first: "$titulo_pelicula" },
      idiomas: { $addToSet: "$versiones.idioma_audio" },
      versiones: {
        $addToSet: {
          $concat: ["$versiones.idioma_audio", " / ", "$versiones.subtitulos", " / ", "$versiones.formato"]
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      id_pelicula: "$_id",
      titulo_pelicula: 1,
      total_idiomas: { $size: "$idiomas" },
      total_versiones: { $size: "$versiones" },
      idiomas: 1
    }
  },
  { $sort: { total_versiones: -1, total_idiomas: -1, titulo_pelicula: 1 } },
  { $limit: 10 }
]);

// Insercion invalida que se RECHAZA (evidencia del $jsonSchema): debe dar "Document failed validation"
// porque (faltan id_funcion, ficha, version_exhibida y actualizado_en, y versiones esta vacio)
db.fichas_tecnicas_peliculas.insertOne({ id_pelicula: 1, titulo_pelicula: "Prueba", versiones: [] });
