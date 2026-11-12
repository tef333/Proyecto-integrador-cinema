// Avance 2 - MongoDB - Coleccion resenas_peliculas
// Responsable: Erika Gomez
//
// Crea la coleccion con validacion $jsonSchema y sus indices.
// Se puede ejecutar varias veces: borra la coleccion y la vuelve a crear.
// Orden: 01 -> 02 -> 03
//
// Una resena por documento. Las resenas tienen volumen alto y campos poco
// uniformes (aspectos, etiquetas y respuesta de la empresa son opcionales).
// Referenciado: id_pelicula, id_funcion (opcional) e id_espectador, que viven
// en PostgreSQL (no hay llave foranea entre motores: la integridad es eventual).
// Embebido: aspectos y respuesta_empresa, porque solo se leen junto con la resena.
// Las resenas NO se embeben en la ficha de la pelicula porque crecen sin limite
// (limite de 16 MB por documento).

db.resenas_peliculas.drop();

db.createCollection("resenas_peliculas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_resena", "id_pelicula", "id_espectador", "calificacion", "comentario", "fecha"],
      properties: {
        id_resena: {
          bsonType: ["int", "long"],
          minimum: 1
        },
        id_pelicula: {
          bsonType: ["int", "long"],
          minimum: 1,
          description: "id_pelicula de PostgreSQL, obligatorio"
        },
        id_funcion: {
          bsonType: ["int", "long"],
          minimum: 1,
          description: "id_funcion de PostgreSQL, opcional (funcion a la que asistio el espectador)"
        },
        id_espectador: {
          bsonType: ["int", "long"],
          minimum: 1,
          description: "id_espectador de PostgreSQL, obligatorio"
        },
        calificacion: {
          bsonType: ["int", "long"],
          minimum: 1,
          maximum: 5
        },
        comentario: {
          bsonType: "string",
          minLength: 5,
          maxLength: 1000
        },
        fecha: {
          bsonType: "date"
        },
        recomendaria: {
          bsonType: "bool"
        },
        etiquetas: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        aspectos: {
          bsonType: "object",
          properties: {
            imagen: { bsonType: ["int", "long"], minimum: 1, maximum: 5 },
            sonido: { bsonType: ["int", "long"], minimum: 1, maximum: 5 },
            comodidad: { bsonType: ["int", "long"], minimum: 1, maximum: 5 },
            servicio: { bsonType: ["int", "long"], minimum: 1, maximum: 5 }
          }
        },
        respuesta_empresa: {
          bsonType: "object",
          required: ["id_staff", "fecha", "texto"],
          properties: {
            id_staff: {
              bsonType: ["int", "long"],
              minimum: 1,
              description: "id_staff de PostgreSQL"
            },
            fecha: { bsonType: "date" },
            texto: { bsonType: "string", minLength: 5 }
          }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// Identificador unico de la resena
db.resenas_peliculas.createIndex({ id_resena: 1 }, { unique: true, name: "uq_id_resena" });
// Para ver las resenas mas recientes de una pelicula (y cruzar con fichas_tecnicas_peliculas)
db.resenas_peliculas.createIndex({ id_pelicula: 1, fecha: -1 }, { name: "ix_pelicula_fecha" });
// Para consultar las resenas de un espectador de PostgreSQL
db.resenas_peliculas.createIndex({ id_espectador: 1 }, { name: "ix_espectador" });
// Para cruzar con requisitos_proyeccion por funcion (solo si la resena tiene funcion)
db.resenas_peliculas.createIndex({ id_funcion: 1 }, { name: "ix_funcion", partialFilterExpression: { id_funcion: { $exists: true } } });

db.getCollectionInfos({ name: "resenas_peliculas" });