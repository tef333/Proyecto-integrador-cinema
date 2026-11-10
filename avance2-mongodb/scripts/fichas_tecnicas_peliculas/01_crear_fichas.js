// Avance 2 - MongoDB - Coleccion fichas_tecnicas_peliculas
// Responsable: Santiago Rojas
//
// Crea la coleccion con validacion $jsonSchema y sus indices.
// Se puede ejecutar varias veces: borra la coleccion y la vuelve a crear.
// Orden: 01 -> 02 -> 03
//
// Una ficha tecnica por PELICULA (no por funcion), enlazada con PostgreSQL por
// id_pelicula (no hay llave foranea entre motores: la integridad es eventual).
// Embebido: ficha (director, reparto, paises, generos), versiones y premios.
// Referenciado: solo id_pelicula de PostgreSQL.
// Campos opcionales: premios y observaciones (no todas las peliculas los tienen).

db.fichas_tecnicas_peliculas.drop();

db.createCollection("fichas_tecnicas_peliculas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_pelicula", "titulo_pelicula", "ficha", "versiones", "actualizado_en"],
      properties: {
        id_pelicula: {
          bsonType: ["int", "long"],
          minimum: 1,
          description: "id_pelicula de PostgreSQL, obligatorio"
        },
        titulo_pelicula: {
          bsonType: "string",
          minLength: 1
        },
        ficha: {
          bsonType: "object",
          required: ["titulo_original", "anio_estreno", "directores", "paises", "idioma_original", "generos", "duracion_min", "clasificacion", "reparto_principal"],
          properties: {
            titulo_original: {
              bsonType: "string",
              minLength: 1
            },
            anio_estreno: {
              bsonType: ["int", "long"],
              minimum: 1888,
              maximum: 2100
            },
            directores: {
              bsonType: "array",
              minItems: 1,
              items: { bsonType: "string" }
            },
            paises: {
              bsonType: "array",
              minItems: 1,
              items: { bsonType: "string" }
            },
            idioma_original: {
              bsonType: "string"
            },
            generos: {
              bsonType: "array",
              minItems: 1,
              items: { bsonType: "string" }
            },
            duracion_min: {
              bsonType: ["int", "long"],
              minimum: 1,
              maximum: 400,
              description: "copia de peliculas.duracion_min en PostgreSQL"
            },
            clasificacion: {
              enum: ["Todo publico", "+7", "+12", "+15", "+18"],
              description: "copia de peliculas.clasificacion en PostgreSQL"
            },
            reparto_principal: {
              bsonType: "array",
              minItems: 1,
              items: {
                bsonType: "object",
                required: ["nombre", "personaje"],
                properties: {
                  nombre: { bsonType: "string" },
                  personaje: { bsonType: "string" }
                }
              }
            }
          }
        },
        versiones: {
          bsonType: "array",
          minItems: 1,
          description: "versiones (idioma, subtitulos y formato) en las que la pelicula se puede exhibir",
          items: {
            bsonType: "object",
            required: ["idioma_audio", "subtitulos", "formato", "tipo_version"],
            properties: {
              idioma_audio: { bsonType: "string" },
              subtitulos: { bsonType: "string" },
              formato: {
                enum: ["2D", "3D", "VIP", "IMAX", "4DX"]
              },
              tipo_version: {
                enum: ["Doblada", "Subtitulada", "Original"]
              }
            }
          }
        },
        premios: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["nombre", "anio", "categoria"],
            properties: {
              nombre: { bsonType: "string" },
              anio: {
                bsonType: ["int", "long"],
                minimum: 1927
              },
              categoria: { bsonType: "string" }
            }
          }
        },
        observaciones: {
          bsonType: "string"
        },
        actualizado_en: {
          bsonType: "date"
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// Una sola ficha por pelicula (id_pelicula viene de PostgreSQL)
db.fichas_tecnicas_peliculas.createIndex({ id_pelicula: 1 }, { unique: true, name: "uq_ficha_id_pelicula" });
// Indice multiclave para buscar por idioma de audio de las versiones
db.fichas_tecnicas_peliculas.createIndex({ "versiones.idioma_audio": 1 }, { name: "ix_ficha_idioma_audio" });

db.getCollectionInfos({ name: "fichas_tecnicas_peliculas" });
