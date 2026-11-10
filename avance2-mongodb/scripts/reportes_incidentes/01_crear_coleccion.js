// Avance 2 - MongoDB - Coleccion reportes_incidentes
// Responsable: Estefania Paredes (tef333)
//
// Crea la coleccion con validacion $jsonSchema y sus indices.
// Los incidentes tienen campos distintos segun el tipo (falla tecnica,
// queja de servicio o incidente de seguridad): cada tipo lleva su propio
// objeto de detalle, y el $jsonSchema obliga a que venga el que corresponde.
// Identificadores compartidos con PostgreSQL: id_funcion, id_pelicula, id_sala,
// id_staff (reportado_por, responsables) e id_espectador (quejas).
// Se puede ejecutar varias veces: borra la coleccion y la vuelve a crear.
// Orden: 01 -> 02 -> 03

db.reportes_incidentes.drop();

db.createCollection("reportes_incidentes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["codigo", "tipo", "fecha_hora", "severidad", "estado", "descripcion", "reportado_por", "acciones", "actualizado_en"],
      properties: {
        codigo: {
          bsonType: "string",
          pattern: "^INC-[0-9]{3,}$",
          description: "codigo del incidente, por ejemplo INC-001"
        },
        tipo: {
          enum: ["falla_tecnica", "queja_servicio", "incidente_seguridad"]
        },
        fecha_hora: {
          bsonType: "date"
        },
        id_funcion: {
          bsonType: ["int", "long"],
          minimum: 1,
          description: "id_funcion de PostgreSQL, opcional (un incidente puede ocurrir fuera de una funcion)"
        },
        id_pelicula: {
          bsonType: ["int", "long"],
          minimum: 1,
          description: "id_pelicula de PostgreSQL, solo cuando hay funcion"
        },
        id_sala: {
          bsonType: ["int", "long"],
          minimum: 1,
          description: "id_sala de PostgreSQL, opcional"
        },
        severidad: {
          enum: ["baja", "media", "alta", "critica"]
        },
        estado: {
          enum: ["abierto", "en_revision", "resuelto", "cerrado"]
        },
        descripcion: {
          bsonType: "string",
          minLength: 10
        },
        reportado_por: {
          bsonType: "object",
          required: ["id_staff", "cargo"],
          properties: {
            id_staff: {
              bsonType: ["int", "long"],
              minimum: 1,
              description: "id_staff de PostgreSQL"
            },
            cargo: {
              bsonType: "string"
            }
          }
        },
        detalle_falla_tecnica: {
          bsonType: "object",
          required: ["equipo", "codigo_error", "minutos_interrupcion", "funcion_cancelada"],
          properties: {
            equipo: { bsonType: "string" },
            codigo_error: { bsonType: "string" },
            minutos_interrupcion: { bsonType: ["int", "long"], minimum: 0 },
            funcion_cancelada: { bsonType: "bool" }
          }
        },
        detalle_queja: {
          bsonType: "object",
          required: ["id_espectador", "categoria", "canal"],
          properties: {
            id_espectador: {
              bsonType: ["int", "long"],
              minimum: 1,
              description: "id_espectador de PostgreSQL"
            },
            categoria: {
              enum: ["atencion", "cobro", "equipo", "limpieza", "acomodacion", "accesibilidad", "sonido"]
            },
            canal: {
              enum: ["taquilla", "web", "correo", "redes"]
            },
            compensacion: {
              bsonType: "object",
              required: ["tipo", "valor"],
              properties: {
                tipo: { enum: ["puntos", "reembolso", "boleta_cortesia"] },
                valor: { bsonType: ["int", "long", "double"], minimum: 1 }
              }
            }
          }
        },
        detalle_seguridad: {
          bsonType: "object",
          required: ["tipo_evento", "zona", "personas_involucradas", "se_llamo_autoridad"],
          properties: {
            tipo_evento: {
              enum: ["pelea", "robo", "acceso_no_autorizado", "emergencia_medica", "alarma_falsa", "grabacion_ilegal", "menor_sin_acompanante"]
            },
            zona: { enum: ["sala", "hall", "taquilla", "parqueadero"] },
            personas_involucradas: { bsonType: ["int", "long"], minimum: 0 },
            se_llamo_autoridad: { bsonType: "bool" },
            autoridad: { enum: ["Policía", "Bomberos", "Ambulancia"] }
          }
        },
        acciones: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["fecha", "responsable_id_staff", "accion"],
            properties: {
              fecha: { bsonType: "date" },
              responsable_id_staff: { bsonType: ["int", "long"], minimum: 1 },
              accion: { bsonType: "string" }
            }
          }
        },
        resolucion: {
          bsonType: "object",
          required: ["fecha", "descripcion"],
          properties: {
            fecha: { bsonType: "date" },
            descripcion: { bsonType: "string" }
          }
        },
        actualizado_en: {
          bsonType: "date"
        }
      },
      // Segun el tipo, debe venir su objeto de detalle (esquema variable por tipo)
      anyOf: [
        { properties: { tipo: { enum: ["falla_tecnica"] } },       required: ["detalle_falla_tecnica"] },
        { properties: { tipo: { enum: ["queja_servicio"] } },      required: ["detalle_queja"] },
        { properties: { tipo: { enum: ["incidente_seguridad"] } }, required: ["detalle_seguridad"] }
      ]
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// Codigo de incidente unico
db.reportes_incidentes.createIndex({ codigo: 1 }, { unique: true, name: "uq_codigo" });
// Para filtrar por tipo y ver los mas recientes primero
db.reportes_incidentes.createIndex({ tipo: 1, fecha_hora: -1 }, { name: "ix_tipo_fecha" });
// Para cruzar con PostgreSQL / requisitos_proyeccion por funcion (solo si el incidente tiene funcion)
db.reportes_incidentes.createIndex({ id_funcion: 1 }, { name: "ix_id_funcion", partialFilterExpression: { id_funcion: { $exists: true } } });
// Para el tablero de incidentes pendientes por sala
db.reportes_incidentes.createIndex({ id_sala: 1, estado: 1 }, { name: "ix_sala_estado" });

db.getCollectionInfos({ name: "reportes_incidentes" });
