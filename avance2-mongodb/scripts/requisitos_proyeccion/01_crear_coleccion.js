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

db.createCollection("fichas_tecnicas_peliculas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_funcion", "id_pelicula", "titulo_pelicula", "ficha", "versiones", "version_exhibida", "actualizado_en"],
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
              items: {
                bsonType: "string"
              }
            },
            paises: {
              bsonType: "array",
              minItems: 1,
              items: {
                bsonType: "string"
              }
            },
            idioma_original: {
              bsonType: "string"
            },
            generos: {
              bsonType: "array",
              minItems: 1,
              items: {
                bsonType: "string"
              }
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
                  nombre: {
                    bsonType: "string"
                  },
                  personaje: {
                    bsonType: "string"
                  }
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
              idioma_audio: {
                bsonType: "string"
              },
              subtitulos: {
                bsonType: "string"
              },
              formato: {
                enum: ["2D", "3D", "VIP", "IMAX", "4DX"]
              },
              tipo_version: {
                enum: ["Doblada", "Subtitulada", "Original"]
              }
            }
          }
        },
        version_exhibida: {
          bsonType: "object",
          required: ["idioma_audio", "subtitulos", "formato"],
          properties: {
            idioma_audio: {
              bsonType: "string"
            },
            subtitulos: {
              bsonType: "string"
            },
            formato: {
              enum: ["2D", "3D", "VIP", "IMAX", "4DX"]
            }
          }
        },
        premios: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["nombre", "anio", "categoria"],
            properties: {
              nombre: {
                bsonType: "string"
              },
              anio: {
                bsonType: ["int", "long"],
                minimum: 1927
              },
              categoria: {
                bsonType: "string"
              }
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

// Solo una ficha por funcion (id_funcion viene de PostgreSQL)
db.fichas_tecnicas_peliculas.createIndex({ id_funcion: 1 }, { unique: true, name: "uq_ficha_id_funcion" });
// Para agrupar por pelicula y cruzar con requisitos_proyeccion y resenas_peliculas
db.fichas_tecnicas_peliculas.createIndex({ id_pelicula: 1 }, { name: "ix_ficha_id_pelicula" });
// Indice multiclave para buscar por idioma de audio de las versiones
db.fichas_tecnicas_peliculas.createIndex({ "versiones.idioma_audio": 1 }, { name: "ix_ficha_idioma_audio" });

db.getCollectionInfos({ name: "fichas_tecnicas_peliculas" });
