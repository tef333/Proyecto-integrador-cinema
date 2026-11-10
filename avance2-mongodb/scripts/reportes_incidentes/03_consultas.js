// Avance 2 - MongoDB - Coleccion reportes_incidentes
// Responsable: Estefania Paredes (tef333)
//
// 3 consultas: 1 con find y 2 con aggregation pipeline.

// ---------------------------------------------------------------------------
// CONSULTA 1 (find): incidentes graves (alta o critica) que siguen sin cerrar.
// Proposito: tablero de pendientes para el administrador y el coordinador.
// Tecnicas: $in sobre severidad y estado, proyeccion de campos embebidos,
// orden por fecha. Usa el indice ix_tipo_fecha / ix_sala_estado.
// ---------------------------------------------------------------------------
db.reportes_incidentes.find(
  {
    severidad: { $in: ["alta", "critica"] },
    estado: { $in: ["abierto", "en_revision"] }
  },
  {
    _id: 0,
    codigo: 1,
    tipo: 1,
    fecha_hora: 1,
    id_sala: 1,
    id_funcion: 1,
    severidad: 1,
    estado: 1,
    descripcion: 1,
    "reportado_por.cargo": 1
  }
).sort({ fecha_hora: -1 });

// ---------------------------------------------------------------------------
// CONSULTA 2 (aggregation pipeline): impacto de las fallas tecnicas por sala.
// Proposito: saber en que salas se pierden mas minutos de proyeccion y cuantas
// funciones se cancelaron por fallas, para priorizar mantenimiento.
// Etapas: $match (tipo y sala conocida) -> $group por id_sala (conteo, minutos
// perdidos, promedio y funciones canceladas) -> $sort -> $project.
// ---------------------------------------------------------------------------
db.reportes_incidentes.aggregate([
  { $match: { tipo: "falla_tecnica", id_sala: { $exists: true } } },
  {
    $group: {
      _id: "$id_sala",
      total_fallas: { $sum: 1 },
      minutos_perdidos: { $sum: "$detalle_falla_tecnica.minutos_interrupcion" },
      promedio_minutos: { $avg: "$detalle_falla_tecnica.minutos_interrupcion" },
      funciones_canceladas: {
        $sum: { $cond: ["$detalle_falla_tecnica.funcion_cancelada", 1, 0] }
      }
    }
  },
  { $sort: { minutos_perdidos: -1, total_fallas: -1 } },
  {
    $project: {
      _id: 0,
      id_sala: "$_id",
      total_fallas: 1,
      minutos_perdidos: 1,
      promedio_minutos: { $round: ["$promedio_minutos", 1] },
      funciones_canceladas: 1
    }
  }
]);

// ---------------------------------------------------------------------------
// CONSULTA 3 (aggregation pipeline con $lookup): fallas tecnicas por formato de
// sala, cruzando con requisitos_proyeccion mediante el id_funcion compartido.
// Proposito: ver si las fallas se concentran en los formatos con mas equipo
// (IMAX, 3D, VIP). Requiere haber cargado requisitos_proyeccion.
// Etapas: $match (fallas con funcion) -> $lookup (requisitos_proyeccion) ->
// $unwind -> $group por formato_sala -> $sort.
// ---------------------------------------------------------------------------
db.reportes_incidentes.aggregate([
  { $match: { tipo: "falla_tecnica", id_funcion: { $exists: true } } },
  {
    $lookup: {
      from: "requisitos_proyeccion",
      localField: "id_funcion",
      foreignField: "id_funcion",
      as: "requisito"
    }
  },
  { $unwind: "$requisito" },
  {
    $group: {
      _id: "$requisito.formato_sala",
      fallas: { $sum: 1 },
      minutos_perdidos: { $sum: "$detalle_falla_tecnica.minutos_interrupcion" },
      funciones: { $addToSet: "$id_funcion" }
    }
  },
  { $sort: { fallas: -1 } },
  {
    $project: {
      _id: 0,
      formato_sala: "$_id",
      fallas: 1,
      minutos_perdidos: 1,
      funciones_afectadas: { $size: "$funciones" }
    }
  }
]);

// Insercion invalida que se RECHAZA (evidencia del $jsonSchema): debe dar "Document failed validation"
// porque es una falla tecnica sin detalle_falla_tecnica, con severidad inexistente
db.reportes_incidentes.insertOne({
  codigo: "INC-999",
  tipo: "falla_tecnica",
  fecha_hora: new Date(),
  severidad: "gravisima",
  estado: "abierto",
  descripcion: "Incidente de prueba que debe ser rechazado",
  reportado_por: { id_staff: 5, cargo: "Proyeccionista" },
  acciones: [],
  actualizado_en: new Date()
});
