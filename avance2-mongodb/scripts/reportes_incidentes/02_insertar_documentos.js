// Avance 2 - MongoDB - Coleccion reportes_incidentes
// Responsable: Estefania Paredes (tef333)
//
// Inserta 30 documentos: 10 fallas tecnicas, 10 quejas de servicio y 10
// incidentes de seguridad. Los ids (id_funcion, id_pelicula, id_sala, id_staff,
// id_espectador) son reales de los datos de prueba de PostgreSQL. Las fechas
// usan la misma referencia que requisitos_proyeccion (hoy = 2026-11-06).
// Cada tipo trae campos distintos: detalle_falla_tecnica, detalle_queja o
// detalle_seguridad. Los incidentes sin funcion (hall, parqueadero, sala 4DX en
// mantenimiento) no llevan id_funcion ni id_pelicula.

db.reportes_incidentes.deleteMany({});

// Insercion valida que se ACEPTA (evidencia del $jsonSchema): falla tecnica de la funcion 4 (IMAX)
db.reportes_incidentes.insertOne({
  codigo: "INC-001",
  tipo: "falla_tecnica",
  fecha_hora: ISODate("2026-10-13T20:35:00-05:00"),
  id_funcion: 4,
  id_pelicula: 4,
  id_sala: 5,
  severidad: "alta",
  estado: "cerrado",
  descripcion: "Desalineación del segundo proyector IMAX durante el primer tercio de la película",
  reportado_por: {
    id_staff: 5,
    cargo: "Proyeccionista"
  },
  detalle_falla_tecnica: {
    equipo: "Proyector IMAX láser (unidad 2)",
    codigo_error: "ALN-204",
    minutos_interrupcion: 12,
    funcion_cancelada: false
  },
  acciones: [
    {
      fecha: ISODate("2026-10-13T20:37:00-05:00"),
      responsable_id_staff: 5,
      accion: "Pausa de la proyección y aviso al público"
    },
    {
      fecha: ISODate("2026-10-13T20:45:00-05:00"),
      responsable_id_staff: 5,
      accion: "Realineación manual del proyector"
    },
    {
      fecha: ISODate("2026-10-13T20:49:00-05:00"),
      responsable_id_staff: 2,
      accion: "Se reanuda la función"
    }
  ],
  resolucion: {
    fecha: ISODate("2026-10-13T22:35:00-05:00"),
    descripcion: "Alineación verificada con imagen de prueba; se programa revisión preventiva"
  },
  actualizado_en: ISODate("2026-10-13T22:35:00-05:00")
});

// Resto de documentos: incidentes 2 a 30
db.reportes_incidentes.insertMany([
  {
    codigo: "INC-002",
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-10-12T19:20:00-05:00"),
    id_funcion: 3,
    id_pelicula: 3,
    id_sala: 3,
    severidad: "media",
    estado: "cerrado",
    descripcion: "Fallo de sincronización del emisor de gafas 3D; imagen doble en las filas centrales",
    reportado_por: {
      id_staff: 5,
      cargo: "Proyeccionista"
    },
    detalle_falla_tecnica: {
      equipo: "Emisor infrarrojo 3D",
      codigo_error: "SYNC-031",
      minutos_interrupcion: 8,
      funcion_cancelada: false
    },
    acciones: [
      {
        fecha: ISODate("2026-10-12T19:23:00-05:00"),
        responsable_id_staff: 5,
        accion: "Reinicio del emisor 3D"
      },
      {
        fecha: ISODate("2026-10-12T19:29:00-05:00"),
        responsable_id_staff: 5,
        accion: "Comprobación de gafas por fila"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-12T20:20:00-05:00"),
      descripcion: "Emisor reemplazado por el de repuesto"
    },
    actualizado_en: ISODate("2026-10-12T20:20:00-05:00")
  },
  {
    codigo: "INC-003",
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-10-19T21:50:00-05:00"),
    id_funcion: 8,
    id_pelicula: 8,
    id_sala: 5,
    severidad: "media",
    estado: "cerrado",
    descripcion: "Pérdida del canal de audio izquierdo en sala IMAX",
    reportado_por: {
      id_staff: 5,
      cargo: "Proyeccionista"
    },
    detalle_falla_tecnica: {
      equipo: "Procesador de audio IMAX",
      codigo_error: "AUD-117",
      minutos_interrupcion: 5,
      funcion_cancelada: false
    },
    acciones: [
      {
        fecha: ISODate("2026-10-19T21:52:00-05:00"),
        responsable_id_staff: 5,
        accion: "Cambio de perfil de audio"
      },
      {
        fecha: ISODate("2026-10-19T21:56:00-05:00"),
        responsable_id_staff: 2,
        accion: "Verificación canal por canal"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-20T00:50:00-05:00"),
      descripcion: "Cable de señal ajustado y probado con tono de referencia"
    },
    actualizado_en: ISODate("2026-10-20T00:50:00-05:00")
  },
  {
    codigo: "INC-004",
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-10-27T21:00:00-05:00"),
    id_funcion: 12,
    id_pelicula: 12,
    id_sala: 2,
    severidad: "alta",
    estado: "cerrado",
    descripcion: "El servidor DCP se reinicia en mitad de la función",
    reportado_por: {
      id_staff: 5,
      cargo: "Proyeccionista"
    },
    detalle_falla_tecnica: {
      equipo: "Servidor DCP",
      codigo_error: "IMS-503",
      minutos_interrupcion: 18,
      funcion_cancelada: false
    },
    acciones: [
      {
        fecha: ISODate("2026-10-27T21:05:00-05:00"),
        responsable_id_staff: 5,
        accion: "Reinicio del servidor y recarga del DCP"
      },
      {
        fecha: ISODate("2026-10-27T21:20:00-05:00"),
        responsable_id_staff: 2,
        accion: "Se ofrece boleta de cortesía a los asistentes"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-28T03:00:00-05:00"),
      descripcion: "Actualización de firmware aplicada"
    },
    actualizado_en: ISODate("2026-10-28T03:00:00-05:00")
  },
  {
    codigo: "INC-005",
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-11-03T20:30:00-05:00"),
    id_funcion: 17,
    id_pelicula: 17,
    id_sala: 2,
    severidad: "critica",
    estado: "resuelto",
    descripcion: "KDM vencida: la función no pudo iniciar y fue cancelada",
    reportado_por: {
      id_staff: 2,
      cargo: "Coordinador"
    },
    detalle_falla_tecnica: {
      equipo: "Servidor DCP",
      codigo_error: "KDM-410",
      minutos_interrupcion: 0,
      funcion_cancelada: true
    },
    acciones: [
      {
        fecha: ISODate("2026-11-03T20:35:00-05:00"),
        responsable_id_staff: 2,
        accion: "Se confirma KDM vencida con el distribuidor"
      },
      {
        fecha: ISODate("2026-11-03T21:00:00-05:00"),
        responsable_id_staff: 7,
        accion: "Aviso y reembolso a los compradores"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-11-04T20:30:00-05:00"),
      descripcion: "Distribuidor emite nueva KDM; se agrega control de vigencia previo a cada función"
    },
    actualizado_en: ISODate("2026-11-04T20:30:00-05:00")
  },
  {
    codigo: "INC-006",
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-10-23T17:15:00-05:00"),
    id_funcion: 10,
    id_pelicula: 10,
    id_sala: 1,
    severidad: "baja",
    estado: "cerrado",
    descripcion: "Aire acondicionado detenido en sala; temperatura sobre 28 °C",
    reportado_por: {
      id_staff: 2,
      cargo: "Coordinador"
    },
    detalle_falla_tecnica: {
      equipo: "Sistema de climatización sala 1",
      codigo_error: "HVAC-012",
      minutos_interrupcion: 0,
      funcion_cancelada: false
    },
    acciones: [
      {
        fecha: ISODate("2026-10-23T17:25:00-05:00"),
        responsable_id_staff: 2,
        accion: "Reporte a mantenimiento"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-24T13:15:00-05:00"),
      descripcion: "Se reemplaza el relé del compresor"
    },
    actualizado_en: ISODate("2026-10-24T13:15:00-05:00")
  },
  {
    codigo: "INC-007",
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-10-30T20:30:00-05:00"),
    id_funcion: 14,
    id_pelicula: 14,
    id_sala: 3,
    severidad: "media",
    estado: "en_revision",
    descripcion: "Lámpara del proyector 3D con brillo por debajo del objetivo",
    reportado_por: {
      id_staff: 5,
      cargo: "Proyeccionista"
    },
    detalle_falla_tecnica: {
      equipo: "Proyector 3D (lámpara de xenón)",
      codigo_error: "LMP-088",
      minutos_interrupcion: 0,
      funcion_cancelada: false
    },
    acciones: [
      {
        fecha: ISODate("2026-10-30T21:00:00-05:00"),
        responsable_id_staff: 5,
        accion: "Medición de brillo en pantalla"
      },
      {
        fecha: ISODate("2026-10-31T20:30:00-05:00"),
        responsable_id_staff: 2,
        accion: "Solicitud de lámpara nueva"
      }
    ],
    actualizado_en: ISODate("2026-10-31T20:30:00-05:00")
  },
  {
    codigo: "INC-008",
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-10-25T18:10:00-05:00"),
    id_funcion: 11,
    id_pelicula: 11,
    id_sala: 4,
    severidad: "baja",
    estado: "abierto",
    descripcion: "Falla del reclinable en dos sillas preferenciales de la fila B",
    reportado_por: {
      id_staff: 6,
      cargo: "Acomodador"
    },
    detalle_falla_tecnica: {
      equipo: "Sillas VIP fila B",
      codigo_error: "SIL-002",
      minutos_interrupcion: 0,
      funcion_cancelada: false
    },
    acciones: [
      {
        fecha: ISODate("2026-10-25T18:25:00-05:00"),
        responsable_id_staff: 6,
        accion: "Sillas marcadas como fuera de servicio"
      }
    ],
    actualizado_en: ISODate("2026-10-25T18:25:00-05:00")
  },
  {
    codigo: "INC-009",
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-11-02T10:30:00-05:00"),
    id_sala: 6,
    severidad: "alta",
    estado: "en_revision",
    descripcion: "La plataforma de movimiento 4DX no responde durante la revisión de mantenimiento",
    reportado_por: {
      id_staff: 2,
      cargo: "Coordinador"
    },
    detalle_falla_tecnica: {
      equipo: "Plataforma de movimiento 4DX",
      codigo_error: "MOV-901",
      minutos_interrupcion: 0,
      funcion_cancelada: false
    },
    acciones: [
      {
        fecha: ISODate("2026-11-02T10:50:00-05:00"),
        responsable_id_staff: 2,
        accion: "Sala 4DX permanece cerrada"
      },
      {
        fecha: ISODate("2026-11-02T14:30:00-05:00"),
        responsable_id_staff: 1,
        accion: "Se solicita visita del proveedor"
      }
    ],
    actualizado_en: ISODate("2026-11-02T14:30:00-05:00")
  },
  {
    codigo: "INC-010",
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-11-01T16:25:00-05:00"),
    id_funcion: 15,
    id_pelicula: 15,
    id_sala: 1,
    severidad: "baja",
    estado: "cerrado",
    descripcion: "Subtítulos desfasados unos 3 segundos en la versión doblada",
    reportado_por: {
      id_staff: 5,
      cargo: "Proyeccionista"
    },
    detalle_falla_tecnica: {
      equipo: "Servidor DCP",
      codigo_error: "SUB-221",
      minutos_interrupcion: 6,
      funcion_cancelada: false
    },
    acciones: [
      {
        fecha: ISODate("2026-11-01T16:27:00-05:00"),
        responsable_id_staff: 5,
        accion: "Pausa y resincronización de subtítulos"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-11-01T17:25:00-05:00"),
      descripcion: "Subtítulos regenerados y probados"
    },
    actualizado_en: ISODate("2026-11-01T17:25:00-05:00")
  },
  {
    codigo: "INC-011",
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-10-10T17:10:00-05:00"),
    id_funcion: 2,
    id_pelicula: 2,
    id_sala: 2,
    severidad: "baja",
    estado: "cerrado",
    descripcion: "Espectadores usaron el celular durante la película y el acomodador no intervino",
    reportado_por: {
      id_staff: 7,
      cargo: "Servicio al cliente"
    },
    detalle_queja: {
      id_espectador: 2,
      categoria: "atencion",
      canal: "taquilla",
      compensacion: {
        tipo: "puntos",
        valor: 50
      }
    },
    acciones: [
      {
        fecha: ISODate("2026-10-10T17:40:00-05:00"),
        responsable_id_staff: 7,
        accion: "Se escucha al espectador"
      },
      {
        fecha: ISODate("2026-10-10T18:10:00-05:00"),
        responsable_id_staff: 2,
        accion: "Refuerzo del protocolo de sala con acomodadores"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-12T17:10:00-05:00"),
      descripcion: "Se abonan 50 puntos al espectador"
    },
    actualizado_en: ISODate("2026-10-12T17:10:00-05:00")
  },
  {
    codigo: "INC-012",
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-10-16T13:00:00-05:00"),
    id_funcion: 6,
    id_pelicula: 6,
    id_sala: 1,
    severidad: "media",
    estado: "cerrado",
    descripcion: "Cobro duplicado en una compra en línea",
    reportado_por: {
      id_staff: 7,
      cargo: "Servicio al cliente"
    },
    detalle_queja: {
      id_espectador: 5,
      categoria: "cobro",
      canal: "web",
      compensacion: {
        tipo: "reembolso",
        valor: 18000
      }
    },
    acciones: [
      {
        fecha: ISODate("2026-10-16T14:00:00-05:00"),
        responsable_id_staff: 7,
        accion: "Se verifica el doble cobro en el sistema de ventas"
      },
      {
        fecha: ISODate("2026-10-16T15:00:00-05:00"),
        responsable_id_staff: 1,
        accion: "Se autoriza el reembolso"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-19T13:00:00-05:00"),
      descripcion: "Reembolso de una boleta general"
    },
    actualizado_en: ISODate("2026-10-19T13:00:00-05:00")
  },
  {
    codigo: "INC-013",
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-10-21T18:20:00-05:00"),
    id_funcion: 9,
    id_pelicula: 9,
    id_sala: 3,
    severidad: "baja",
    estado: "cerrado",
    descripcion: "Gafas 3D entregadas con rayones que molestan la visión",
    reportado_por: {
      id_staff: 7,
      cargo: "Servicio al cliente"
    },
    detalle_queja: {
      id_espectador: 7,
      categoria: "equipo",
      canal: "taquilla",
      compensacion: {
        tipo: "boleta_cortesia",
        valor: 1
      }
    },
    acciones: [
      {
        fecha: ISODate("2026-10-21T18:35:00-05:00"),
        responsable_id_staff: 7,
        accion: "Cambio de gafas y retiro de las dañadas"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-22T18:20:00-05:00"),
      descripcion: "Boleta de cortesía entregada"
    },
    actualizado_en: ISODate("2026-10-22T18:20:00-05:00")
  },
  {
    codigo: "INC-014",
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-10-17T20:30:00-05:00"),
    id_funcion: 7,
    id_pelicula: 7,
    id_sala: 2,
    severidad: "baja",
    estado: "cerrado",
    descripcion: "Baños sin papel higiénico en el pasillo de las salas 1 y 2",
    reportado_por: {
      id_staff: 7,
      cargo: "Servicio al cliente"
    },
    detalle_queja: {
      id_espectador: 9,
      categoria: "limpieza",
      canal: "taquilla"
    },
    acciones: [
      {
        fecha: ISODate("2026-10-17T20:50:00-05:00"),
        responsable_id_staff: 6,
        accion: "Reposición de insumos"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-17T22:30:00-05:00"),
      descripcion: "Se ajusta la ronda de limpieza de la tarde"
    },
    actualizado_en: ISODate("2026-10-17T22:30:00-05:00")
  },
  {
    codigo: "INC-015",
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-10-28T19:15:00-05:00"),
    id_funcion: 13,
    id_pelicula: 13,
    id_sala: 5,
    severidad: "media",
    estado: "cerrado",
    descripcion: "Dos espectadores con la misma silla asignada en la sala IMAX",
    reportado_por: {
      id_staff: 3,
      cargo: "Taquillero"
    },
    detalle_queja: {
      id_espectador: 12,
      categoria: "acomodacion",
      canal: "taquilla",
      compensacion: {
        tipo: "puntos",
        valor: 100
      }
    },
    acciones: [
      {
        fecha: ISODate("2026-10-28T19:25:00-05:00"),
        responsable_id_staff: 6,
        accion: "Reubicación de uno de los espectadores"
      },
      {
        fecha: ISODate("2026-10-28T22:15:00-05:00"),
        responsable_id_staff: 2,
        accion: "Revisión del mapa de sillas de la venta"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-29T19:15:00-05:00"),
      descripcion: "Se abonan 100 puntos y se corrige la asignación"
    },
    actualizado_en: ISODate("2026-10-29T19:15:00-05:00")
  },
  {
    codigo: "INC-016",
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-11-02T21:00:00-05:00"),
    id_funcion: 16,
    id_pelicula: 16,
    id_sala: 4,
    severidad: "baja",
    estado: "resuelto",
    descripcion: "El pedido de comida en sala VIP tardó más de 40 minutos",
    reportado_por: {
      id_staff: 7,
      cargo: "Servicio al cliente"
    },
    detalle_queja: {
      id_espectador: 15,
      categoria: "atencion",
      canal: "correo"
    },
    acciones: [
      {
        fecha: ISODate("2026-11-03T01:00:00-05:00"),
        responsable_id_staff: 7,
        accion: "Respuesta al espectador por correo"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-11-04T21:00:00-05:00"),
      descripcion: "Se explica el retraso y se invita a una próxima función"
    },
    actualizado_en: ISODate("2026-11-04T21:00:00-05:00")
  },
  {
    codigo: "INC-017",
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-10-15T19:10:00-05:00"),
    id_funcion: 5,
    id_pelicula: 5,
    id_sala: 4,
    severidad: "media",
    estado: "en_revision",
    descripcion: "Dificultad de acceso en silla de ruedas a la sala VIP",
    reportado_por: {
      id_staff: 7,
      cargo: "Servicio al cliente"
    },
    detalle_queja: {
      id_espectador: 3,
      categoria: "accesibilidad",
      canal: "web"
    },
    acciones: [
      {
        fecha: ISODate("2026-10-15T21:10:00-05:00"),
        responsable_id_staff: 2,
        accion: "Se revisa la rampa de acceso con administración"
      }
    ],
    actualizado_en: ISODate("2026-10-15T21:10:00-05:00")
  },
  {
    codigo: "INC-018",
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-11-01T19:30:00-05:00"),
    severidad: "baja",
    estado: "cerrado",
    descripcion: "Fila de más de 25 minutos en taquilla en hora pico",
    reportado_por: {
      id_staff: 4,
      cargo: "Taquillero"
    },
    detalle_queja: {
      id_espectador: 18,
      categoria: "atencion",
      canal: "redes"
    },
    acciones: [
      {
        fecha: ISODate("2026-11-01T20:15:00-05:00"),
        responsable_id_staff: 2,
        accion: "Se habilita una taquilla adicional los fines de semana"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-11-02T19:30:00-05:00"),
      descripcion: "Respuesta pública en redes y ajuste de turnos"
    },
    actualizado_en: ISODate("2026-11-02T19:30:00-05:00")
  },
  {
    codigo: "INC-019",
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-10-09T19:50:00-05:00"),
    id_funcion: 1,
    id_pelicula: 1,
    id_sala: 1,
    severidad: "baja",
    estado: "cerrado",
    descripcion: "Volumen del sonido demasiado alto en la sala",
    reportado_por: {
      id_staff: 7,
      cargo: "Servicio al cliente"
    },
    detalle_queja: {
      id_espectador: 21,
      categoria: "sonido",
      canal: "taquilla",
      compensacion: {
        tipo: "puntos",
        valor: 30
      }
    },
    acciones: [
      {
        fecha: ISODate("2026-10-09T20:00:00-05:00"),
        responsable_id_staff: 5,
        accion: "Ajuste del nivel de sonido"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-10T07:50:00-05:00"),
      descripcion: "Se abonan 30 puntos"
    },
    actualizado_en: ISODate("2026-10-10T07:50:00-05:00")
  },
  {
    codigo: "INC-020",
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-10-23T16:20:00-05:00"),
    id_funcion: 10,
    id_pelicula: 10,
    id_sala: 1,
    severidad: "media",
    estado: "cerrado",
    descripcion: "No se aplicó la tarifa de estudiante en la compra",
    reportado_por: {
      id_staff: 3,
      cargo: "Taquillero"
    },
    detalle_queja: {
      id_espectador: 24,
      categoria: "cobro",
      canal: "taquilla",
      compensacion: {
        tipo: "reembolso",
        valor: 4000
      }
    },
    acciones: [
      {
        fecha: ISODate("2026-10-23T16:35:00-05:00"),
        responsable_id_staff: 3,
        accion: "Se valida el carnet estudiantil"
      },
      {
        fecha: ISODate("2026-10-23T16:50:00-05:00"),
        responsable_id_staff: 2,
        accion: "Se autoriza la devolución de la diferencia"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-23T17:20:00-05:00"),
      descripcion: "Diferencia de tarifa devuelta"
    },
    actualizado_en: ISODate("2026-10-23T17:20:00-05:00")
  },
  {
    codigo: "INC-021",
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-19T20:50:00-05:00"),
    id_funcion: 8,
    id_pelicula: 8,
    id_sala: 5,
    severidad: "media",
    estado: "cerrado",
    descripcion: "Intento de ingreso de un menor de 18 años con boleta de otra persona a función +18",
    reportado_por: {
      id_staff: 6,
      cargo: "Acomodador"
    },
    detalle_seguridad: {
      tipo_evento: "menor_sin_acompanante",
      zona: "sala",
      personas_involucradas: 1,
      se_llamo_autoridad: false
    },
    acciones: [
      {
        fecha: ISODate("2026-10-19T20:55:00-05:00"),
        responsable_id_staff: 6,
        accion: "Se impide el ingreso"
      },
      {
        fecha: ISODate("2026-10-19T21:10:00-05:00"),
        responsable_id_staff: 2,
        accion: "Se informa al acudiente"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-19T22:50:00-05:00"),
      descripcion: "Se reitera el control de edad en el acceso"
    },
    actualizado_en: ISODate("2026-10-19T22:50:00-05:00")
  },
  {
    codigo: "INC-022",
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-27T20:40:00-05:00"),
    id_funcion: 12,
    id_pelicula: 12,
    id_sala: 2,
    severidad: "baja",
    estado: "cerrado",
    descripcion: "Espectador grabando la pantalla con el celular",
    reportado_por: {
      id_staff: 6,
      cargo: "Acomodador"
    },
    detalle_seguridad: {
      tipo_evento: "grabacion_ilegal",
      zona: "sala",
      personas_involucradas: 1,
      se_llamo_autoridad: false
    },
    acciones: [
      {
        fecha: ISODate("2026-10-27T20:43:00-05:00"),
        responsable_id_staff: 6,
        accion: "Se le pide detener la grabación y borrar el video"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-27T21:40:00-05:00"),
      descripcion: "Espectador acompañado a la salida"
    },
    actualizado_en: ISODate("2026-10-27T21:40:00-05:00")
  },
  {
    codigo: "INC-023",
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-13T21:10:00-05:00"),
    id_funcion: 4,
    id_pelicula: 4,
    id_sala: 5,
    severidad: "alta",
    estado: "cerrado",
    descripcion: "Espectador con mareo y pérdida de conocimiento durante la función",
    reportado_por: {
      id_staff: 6,
      cargo: "Acomodador"
    },
    detalle_seguridad: {
      tipo_evento: "emergencia_medica",
      zona: "sala",
      personas_involucradas: 1,
      se_llamo_autoridad: true,
      autoridad: "Ambulancia"
    },
    acciones: [
      {
        fecha: ISODate("2026-10-13T21:12:00-05:00"),
        responsable_id_staff: 6,
        accion: "Atención inicial y llamada a emergencias"
      },
      {
        fecha: ISODate("2026-10-13T21:25:00-05:00"),
        responsable_id_staff: 2,
        accion: "Entrega al personal médico"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-14T00:10:00-05:00"),
      descripcion: "Espectador trasladado; se documenta el caso"
    },
    actualizado_en: ISODate("2026-10-14T00:10:00-05:00")
  },
  {
    codigo: "INC-024",
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-11-02T20:45:00-05:00"),
    id_funcion: 16,
    id_pelicula: 16,
    id_sala: 4,
    severidad: "media",
    estado: "cerrado",
    descripcion: "Alarma de humo activada por vapor de la zona de alimentos",
    reportado_por: {
      id_staff: 2,
      cargo: "Coordinador"
    },
    detalle_seguridad: {
      tipo_evento: "alarma_falsa",
      zona: "sala",
      personas_involucradas: 0,
      se_llamo_autoridad: true,
      autoridad: "Bomberos"
    },
    acciones: [
      {
        fecha: ISODate("2026-11-02T20:48:00-05:00"),
        responsable_id_staff: 2,
        accion: "Evacuación ordenada de la sala"
      },
      {
        fecha: ISODate("2026-11-02T21:10:00-05:00"),
        responsable_id_staff: 2,
        accion: "Bomberos confirman falsa alarma"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-11-03T00:45:00-05:00"),
      descripcion: "Se reubica la zona de preparación y se prueba el detector"
    },
    actualizado_en: ISODate("2026-11-03T00:45:00-05:00")
  },
  {
    codigo: "INC-025",
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-24T20:10:00-05:00"),
    severidad: "alta",
    estado: "en_revision",
    descripcion: "Hurto de un bolso en el hall durante la hora pico",
    reportado_por: {
      id_staff: 1,
      cargo: "Administrador"
    },
    detalle_seguridad: {
      tipo_evento: "robo",
      zona: "hall",
      personas_involucradas: 2,
      se_llamo_autoridad: true,
      autoridad: "Policía"
    },
    acciones: [
      {
        fecha: ISODate("2026-10-24T20:20:00-05:00"),
        responsable_id_staff: 1,
        accion: "Revisión de cámaras del hall"
      },
      {
        fecha: ISODate("2026-10-24T21:10:00-05:00"),
        responsable_id_staff: 1,
        accion: "Se entrega la información a la Policía"
      }
    ],
    actualizado_en: ISODate("2026-10-24T21:10:00-05:00")
  },
  {
    codigo: "INC-026",
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-11-03T15:40:00-05:00"),
    id_sala: 6,
    severidad: "media",
    estado: "cerrado",
    descripcion: "Una persona ingresó a la sala 4DX cerrada por mantenimiento",
    reportado_por: {
      id_staff: 1,
      cargo: "Administrador"
    },
    detalle_seguridad: {
      tipo_evento: "acceso_no_autorizado",
      zona: "sala",
      personas_involucradas: 1,
      se_llamo_autoridad: false
    },
    acciones: [
      {
        fecha: ISODate("2026-11-03T15:45:00-05:00"),
        responsable_id_staff: 6,
        accion: "Se acompaña a la persona fuera de la zona"
      },
      {
        fecha: ISODate("2026-11-03T16:40:00-05:00"),
        responsable_id_staff: 1,
        accion: "Se instala señalización y cierre en la puerta"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-11-04T15:40:00-05:00"),
      descripcion: "Acceso a la sala restringido con llave"
    },
    actualizado_en: ISODate("2026-11-04T15:40:00-05:00")
  },
  {
    codigo: "INC-027",
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-25T18:50:00-05:00"),
    id_funcion: 11,
    id_pelicula: 11,
    id_sala: 4,
    severidad: "baja",
    estado: "cerrado",
    descripcion: "Discusión entre dos espectadores por una silla preferencial",
    reportado_por: {
      id_staff: 6,
      cargo: "Acomodador"
    },
    detalle_seguridad: {
      tipo_evento: "pelea",
      zona: "sala",
      personas_involucradas: 2,
      se_llamo_autoridad: false
    },
    acciones: [
      {
        fecha: ISODate("2026-10-25T18:55:00-05:00"),
        responsable_id_staff: 6,
        accion: "Mediación del acomodador"
      },
      {
        fecha: ISODate("2026-10-25T19:00:00-05:00"),
        responsable_id_staff: 2,
        accion: "Reubicación de uno de los espectadores"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-25T19:50:00-05:00"),
      descripcion: "Situación resuelta sin lesionados"
    },
    actualizado_en: ISODate("2026-10-25T19:50:00-05:00")
  },
  {
    codigo: "INC-028",
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-28T20:40:00-05:00"),
    id_funcion: 13,
    id_pelicula: 13,
    id_sala: 5,
    severidad: "media",
    estado: "cerrado",
    descripcion: "Espectadora con descompensación leve; se recuperó y no requirió traslado",
    reportado_por: {
      id_staff: 6,
      cargo: "Acomodador"
    },
    detalle_seguridad: {
      tipo_evento: "emergencia_medica",
      zona: "sala",
      personas_involucradas: 1,
      se_llamo_autoridad: false
    },
    acciones: [
      {
        fecha: ISODate("2026-10-28T20:43:00-05:00"),
        responsable_id_staff: 6,
        accion: "Atención y agua; se acompaña al hall"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-28T21:40:00-05:00"),
      descripcion: "Espectadora se retira por sus propios medios"
    },
    actualizado_en: ISODate("2026-10-28T21:40:00-05:00")
  },
  {
    codigo: "INC-029",
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-21T17:05:00-05:00"),
    id_funcion: 9,
    id_pelicula: 9,
    id_sala: 3,
    severidad: "baja",
    estado: "cerrado",
    descripcion: "Espectador intenta grabar una escena con el celular",
    reportado_por: {
      id_staff: 6,
      cargo: "Acomodador"
    },
    detalle_seguridad: {
      tipo_evento: "grabacion_ilegal",
      zona: "sala",
      personas_involucradas: 1,
      se_llamo_autoridad: false
    },
    acciones: [
      {
        fecha: ISODate("2026-10-21T17:07:00-05:00"),
        responsable_id_staff: 6,
        accion: "Advertencia y verificación de que borre el material"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-21T18:05:00-05:00"),
      descripcion: "Sin otras novedades"
    },
    actualizado_en: ISODate("2026-10-21T18:05:00-05:00")
  },
  {
    codigo: "INC-030",
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-12T18:45:00-05:00"),
    id_funcion: 3,
    id_pelicula: 3,
    id_sala: 3,
    severidad: "media",
    estado: "cerrado",
    descripcion: "Menor de 15 años detectado en función +15 sin acompañante",
    reportado_por: {
      id_staff: 6,
      cargo: "Acomodador"
    },
    detalle_seguridad: {
      tipo_evento: "menor_sin_acompanante",
      zona: "sala",
      personas_involucradas: 1,
      se_llamo_autoridad: false
    },
    acciones: [
      {
        fecha: ISODate("2026-10-12T18:50:00-05:00"),
        responsable_id_staff: 6,
        accion: "Se retira de la sala"
      },
      {
        fecha: ISODate("2026-10-12T19:15:00-05:00"),
        responsable_id_staff: 2,
        accion: "Se reembolsa la boleta"
      }
    ],
    resolucion: {
      fecha: ISODate("2026-10-12T20:45:00-05:00"),
      descripcion: "Se refuerza la verificación de clasificación en el ingreso"
    },
    actualizado_en: ISODate("2026-10-12T20:45:00-05:00")
  }
]);

db.reportes_incidentes.countDocuments();
