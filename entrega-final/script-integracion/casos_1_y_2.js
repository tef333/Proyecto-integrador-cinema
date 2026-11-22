// Entrega final - MongoDB - Casos de uso 1 y 2
// Responsable: Santiago Rojas (P4)
//
// Casos de uso de INTEGRACION 1 y 2: esta es la mitad MongoDB (la mitad PostgreSQL esta en casos_1_y_2.sql).
// La API (app/rutas/casos_integracion.py) ejecuta ambas y une los resultados. Para ejecutarlas a mano en mongosh o Compass.
// Base: cinema_avance2. Requieren las colecciones resenas_peliculas y requisitos_proyeccion cargadas.

// ---------------------------------------------------------------------------
// CASO 1: funcion con sus resenas (id_funcion = 10).
// Resumen: total, calificacion promedio, quienes la recomiendan, resenas sin respuesta
// de la empresa y promedio por aspecto (imagen, sonido, comodidad, servicio).
// Usa el indice ix_funcion. La API une este resultado con los datos de la funcion en PostgreSQL.
// ---------------------------------------------------------------------------
db.resenas_peliculas.aggregate([
  {
    "$match": {
      "id_funcion": 10
    }
  },
  {
    "$group": {
      "_id": "$id_funcion",
      "total_resenas": {
        "$sum": 1
      },
      "calificacion_promedio": {
        "$avg": "$calificacion"
      },
      "recomendarian": {
        "$sum": {
          "$cond": [
            {
              "$eq": [
                "$recomendaria",
                true
              ]
            },
            1,
            0
          ]
        }
      },
      "no_recomendarian": {
        "$sum": {
          "$cond": [
            {
              "$eq": [
                "$recomendaria",
                false
              ]
            },
            1,
            0
          ]
        }
      },
      "respondidas": {
        "$sum": {
          "$cond": [
            {
              "$ifNull": [
                "$respuesta_empresa",
                false
              ]
            },
            1,
            0
          ]
        }
      },
      "imagen": {
        "$avg": "$aspectos.imagen"
      },
      "sonido": {
        "$avg": "$aspectos.sonido"
      },
      "comodidad": {
        "$avg": "$aspectos.comodidad"
      },
      "servicio": {
        "$avg": "$aspectos.servicio"
      },
      "ultima_resena": {
        "$max": "$fecha"
      }
    }
  },
  {
    "$project": {
      "_id": 0,
      "id_funcion": "$_id",
      "total_resenas": 1,
      "calificacion_promedio": 1,
      "recomendarian": 1,
      "no_recomendarian": 1,
      "sin_respuesta": {
        "$subtract": [
          "$total_resenas",
          "$respondidas"
        ]
      },
      "aspectos_promedio": {
        "imagen": "$imagen",
        "sonido": "$sonido",
        "comodidad": "$comodidad",
        "servicio": "$servicio"
      },
      "ultima_resena": 1
    }
  }
]);

// Las resenas de la funcion, de la mas reciente a la mas antigua
db.resenas_peliculas.find({ id_funcion: 10 }, { _id: 0 }).sort({ fecha: -1 }).limit(20);

// ---------------------------------------------------------------------------
// CASO 2: pelicula con sus requisitos tecnicos (id_pelicula = 10, que tiene dos funciones:
// una en sala 2D y otra IMAX).
// Por cada funcion: formato de sala, proyeccion, audio, requisitos de 3D/IMAX/VIP, ensayo tecnico,
// vigencia de la llave KDM y los items obligatorios del checklist que aun no se cumplen.
// Usa el indice ix_id_pelicula. La API une este resultado con titulo, sala y fecha de PostgreSQL.
// ---------------------------------------------------------------------------
db.requisitos_proyeccion.aggregate([
  {
    "$match": {
      "id_pelicula": 10
    }
  },
  {
    "$project": {
      "_id": 0,
      "id_funcion": 1,
      "id_sala": 1,
      "titulo_pelicula": 1,
      "formato_sala": 1,
      "proyeccion": {
        "resolucion": "$proyeccion.resolucion",
        "relacion_aspecto": "$proyeccion.relacion_aspecto",
        "fps": "$proyeccion.fps",
        "tipo_proyector": "$proyeccion.tipo_proyector"
      },
      "audio": {
        "formato": "$audio.formato",
        "idioma": "$audio.idioma",
        "subtitulos": "$audio.subtitulos"
      },
      "requisitos_3d": 1,
      "requisitos_imax": 1,
      "requisitos_vip": 1,
      "ensayo_tecnico": 1,
      "llave_kdm": {
        "requerida": "$llave_kdm.requerida",
        "valida_hasta": "$llave_kdm.valida_hasta"
      },
      "pendientes": {
        "$map": {
          "input": {
            "$filter": {
              "input": "$checklist",
              "as": "i",
              "cond": {
                "$and": [
                  {
                    "$eq": [
                      "$$i.obligatorio",
                      true
                    ]
                  },
                  {
                    "$eq": [
                      "$$i.cumplido",
                      false
                    ]
                  }
                ]
              }
            }
          },
          "as": "p",
          "in": "$$p.item"
        }
      },
      "total_pendientes": {
        "$size": {
          "$filter": {
            "input": "$checklist",
            "as": "i",
            "cond": {
              "$and": [
                {
                  "$eq": [
                    "$$i.obligatorio",
                    true
                  ]
                },
                {
                  "$eq": [
                    "$$i.cumplido",
                    false
                  ]
                }
              ]
            }
          }
        }
      }
    }
  },
  {
    "$sort": {
      "id_funcion": 1
    }
  }
]);
