// Avance 2 - MongoDB - Coleccion requisitos_proyeccion
// Responsable: Jose Antonio Espin Molina (jespinn)
//
// Crea la coleccion con validacion $jsonSchema y sus indices.
// Se puede ejecutar varias veces: borra la coleccion y la vuelve a crear.
// Orden: 01 -> 02 -> 03

db.requisitos_proyeccion.drop();

db.createCollection("requisitos_proyeccion", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_funcion", "id_pelicula", "id_sala", "titulo_pelicula", "formato_sala", "proyeccion", "audio", "equipos", "checklist", "llave_kdm", "actualizado_en"],
      properties: {
        id_funcion: {
          bsonType: ["int", "long"],
          minimum: 1,
          description: "id_funcion de PostgreSQL, obligatorio"
        },
        id_pelicula: {
          bsonType: ["int", "long"],
          minimum: 1,
          description: "id_pelicula de PostgreSQL, obligatorio"
        },
        id_sala: {
          bsonType: ["int", "long"],
          minimum: 1,
          description: "id_sala de PostgreSQL, obligatorio"
        },
        titulo_pelicula: {
          bsonType: "string",
          minLength: 1
        },
        formato_sala: {
          enum: ["2D", "3D", "VIP", "IMAX", "4DX"]
        },
        proyeccion: {
          bsonType: "object",
          required: ["formato_archivo", "resolucion", "relacion_aspecto", "fps", "tipo_proyector"],
          properties: {
            formato_archivo: {
              enum: ["DCP", "IMAX DCP"]
            },
            resolucion: {
              enum: ["2K", "4K"]
            },
            relacion_aspecto: {
              enum: ["1.85:1", "2.39:1", "1.90:1", "1.43:1"]
            },
            fps: {
              enum: [24, 48, 60]
            },
            tipo_proyector: {
              enum: ["Xenón", "Láser"]
            },
            brillo_objetivo_fl: {
              bsonType: ["int", "double"],
              minimum: 1
            }
          }
        },
        audio: {
          bsonType: "object",
          required: ["formato", "idioma", "subtitulos"],
          properties: {
            formato: {
              enum: ["5.1", "7.1", "Dolby Atmos", "IMAX 12.0"]
            },
            idioma: {
              bsonType: "string"
            },
            subtitulos: {
              bsonType: "object",
              required: ["activos"],
              properties: {
                activos: {
                  bsonType: "bool"
                },
                idioma: {
                  bsonType: "string"
                }
              }
            }
          }
        },
        equipos: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["tipo", "modelo", "verificado"],
            properties: {
              tipo: {
                bsonType: "string"
              },
              modelo: {
                bsonType: "string"
              },
              verificado: {
                bsonType: "bool"
              }
            }
          }
        },
        checklist: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["item", "obligatorio", "cumplido"],
            properties: {
              item: {
                bsonType: "string"
              },
              obligatorio: {
                bsonType: "bool"
              },
              cumplido: {
                bsonType: "bool"
              }
            }
          }
        },
        llave_kdm: {
          bsonType: "object",
          required: ["requerida", "valida_desde", "valida_hasta"],
          properties: {
            requerida: {
              bsonType: "bool"
            },
            valida_desde: {
              bsonType: "date"
            },
            valida_hasta: {
              bsonType: "date"
            }
          }
        },
        requisitos_3d: {
          bsonType: "object",
          required: ["tipo_gafas", "gafas_requeridas"],
          properties: {
            tipo_gafas: {
              bsonType: "string"
            },
            gafas_requeridas: {
              bsonType: ["int", "long"],
              minimum: 1
            },
            gafas_reserva: {
              bsonType: ["int", "long"],
              minimum: 0
            }
          }
        },
        requisitos_imax: {
          bsonType: "object"
        },
        requisitos_vip: {
          bsonType: "object"
        },
        ensayo_tecnico: {
          bsonType: "object",
          required: ["requerido"],
          properties: {
            requerido: {
              bsonType: "bool"
            },
            fecha: {
              bsonType: "date"
            },
            responsable: {
              bsonType: "string"
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

// Un documento de requisitos por funcion (id_funcion viene de PostgreSQL)
db.requisitos_proyeccion.createIndex({ id_funcion: 1 }, { unique: true, name: "uq_id_funcion" });
// Para la consulta por formato de sala (IMAX / 3D)
db.requisitos_proyeccion.createIndex({ formato_sala: 1, id_funcion: 1 }, { name: "ix_formato_funcion" });
// Para cruzar con fichas_tecnicas_peliculas y resenas_peliculas
db.requisitos_proyeccion.createIndex({ id_pelicula: 1 }, { name: "ix_id_pelicula" });

db.getCollectionInfos({ name: "requisitos_proyeccion" });

db.fichas_tecnicas_peliculas.drop();
