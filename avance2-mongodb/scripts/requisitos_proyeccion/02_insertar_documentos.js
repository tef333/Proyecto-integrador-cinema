// Avance 2 - MongoDB - Coleccion requisitos_proyeccion
// Responsable: Jose Antonio Espin Molina (jespinn)
//
// Inserta 30 documentos: uno por cada funcion de PostgreSQL (id_funcion 1 a 30),
// con el id_pelicula y el id_sala reales de esa funcion.
// Los campos varian segun el formato de sala: 3D trae requisitos_3d,
// IMAX trae requisitos_imax y ensayo_tecnico, VIP trae requisitos_vip.

db.requisitos_proyeccion.deleteMany({});

// Insercion valida que se ACEPTA (evidencia del $jsonSchema): funcion 1
db.requisitos_proyeccion.insertOne({
  id_funcion: 1,
  id_pelicula: 1,
  id_sala: 1,
  titulo_pelicula: "Oppenheimer",
  formato_sala: "2D",
  proyeccion: {
    formato_archivo: "DCP",
    resolucion: "2K",
    relacion_aspecto: "2.39:1",
    fps: 24,
    tipo_proyector: "Xenón",
    brillo_objetivo_fl: 14
  },
  audio: {
    formato: "7.1",
    idioma: "Inglés",
    subtitulos: {
      activos: true,
      idioma: "Español"
    }
  },
  equipos: [
    {
      tipo: "Proyector",
      modelo: "Christie CP2220 (xenón)",
      verificado: true
    },
    {
      tipo: "Servidor DCP",
      modelo: "Dolby IMS3000",
      verificado: true
    }
  ],
  checklist: [
    {
      item: "Prueba de imagen y enfoque",
      obligatorio: true,
      cumplido: true
    },
    {
      item: "Prueba de sonido por canal",
      obligatorio: true,
      cumplido: true
    },
    {
      item: "KDM cargada en el servidor",
      obligatorio: true,
      cumplido: true
    },
    {
      item: "Subtítulos sincronizados",
      obligatorio: true,
      cumplido: true
    }
  ],
  llave_kdm: {
    requerida: true,
    valida_desde: ISODate("2026-10-08T18:00:00-05:00"),
    valida_hasta: ISODate("2026-10-11T18:00:00-05:00")
  },
  actualizado_en: ISODate("2026-10-09T18:00:00-05:00")
});

// Resto de documentos: funciones 2 a 30
db.requisitos_proyeccion.insertMany([
  {
    id_funcion: 2,
    id_pelicula: 2,
    id_sala: 2,
    titulo_pelicula: "Coco",
    formato_sala: "2D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "2K",
      relacion_aspecto: "1.85:1",
      fps: 24,
      tipo_proyector: "Xenón",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "5.1",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Christie CP2220 (xenón)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-10-09T15:00:00-05:00"),
      valida_hasta: ISODate("2026-10-12T15:00:00-05:00")
    },
    actualizado_en: ISODate("2026-10-10T15:00:00-05:00")
  },
  {
    id_funcion: 3,
    id_pelicula: 3,
    id_sala: 3,
    titulo_pelicula: "Parásitos",
    formato_sala: "3D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "4K",
      relacion_aspecto: "2.39:1",
      fps: 24,
      tipo_proyector: "Láser",
      brillo_objetivo_fl: 6
    },
    audio: {
      formato: "7.1",
      idioma: "Coreano",
      subtitulos: {
        activos: true,
        idioma: "Español"
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Barco SP4K-15C (láser)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: true
      },
      {
        tipo: "Sistema 3D",
        modelo: "RealD XL-DP",
        verificado: true
      },
      {
        tipo: "Pantalla",
        modelo: "Pantalla plateada de alta ganancia",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Subtítulos sincronizados",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Conteo de gafas 3D",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Calibración de polarizador",
        obligatorio: true,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-10-11T19:00:00-05:00"),
      valida_hasta: ISODate("2026-10-14T19:00:00-05:00")
    },
    requisitos_3d: {
      tipo_gafas: "Pasivas polarizadas circulares",
      gafas_requeridas: 132,
      gafas_reserva: 12,
      limpieza_gafas: "Lavado y desinfección después de cada función"
    },
    ensayo_tecnico: {
      requerido: true,
      fecha: ISODate("2026-10-13T16:00:00-05:00"),
      responsable: "Proyeccionista de turno"
    },
    actualizado_en: ISODate("2026-10-12T19:00:00-05:00")
  },
  {
    id_funcion: 4,
    id_pelicula: 4,
    id_sala: 5,
    titulo_pelicula: "Dune: Parte Dos",
    formato_sala: "IMAX",
    proyeccion: {
      formato_archivo: "IMAX DCP",
      resolucion: "4K",
      relacion_aspecto: "1.43:1",
      fps: 24,
      tipo_proyector: "Láser",
      brillo_objetivo_fl: 22
    },
    audio: {
      formato: "IMAX 12.0",
      idioma: "Inglés",
      subtitulos: {
        activos: true,
        idioma: "Español"
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "IMAX con Láser (doble cabezal)",
        verificado: true
      },
      {
        tipo: "Servidor",
        modelo: "IMAX ICE",
        verificado: true
      },
      {
        tipo: "Procesador de audio",
        modelo: "IMAX 12 canales",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Subtítulos sincronizados",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Alineación de los dos proyectores",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Calibración IMAX de sonido",
        obligatorio: true,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-10-12T20:00:00-05:00"),
      valida_hasta: ISODate("2026-10-15T20:00:00-05:00")
    },
    requisitos_imax: {
      alineacion_doble_proyector: true,
      calibracion_sonido_12_canales: true,
      version_expandida: true
    },
    ensayo_tecnico: {
      requerido: true,
      fecha: ISODate("2026-10-14T17:00:00-05:00"),
      responsable: "Proyeccionista de turno"
    },
    observaciones: "Película con escenas en formato IMAX expandido.",
    actualizado_en: ISODate("2026-10-13T20:00:00-05:00")
  },
  {
    id_funcion: 5,
    id_pelicula: 5,
    id_sala: 4,
    titulo_pelicula: "La La Land",
    formato_sala: "VIP",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "4K",
      relacion_aspecto: "1.85:1",
      fps: 24,
      tipo_proyector: "Láser",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "Dolby Atmos",
      idioma: "Inglés",
      subtitulos: {
        activos: true,
        idioma: "Español"
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Sony SRX-R515 (4K)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: true
      },
      {
        tipo: "Procesador de audio",
        modelo: "Dolby CP950A",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Subtítulos sincronizados",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Revisión de butacas reclinables",
        obligatorio: false,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-10-14T19:30:00-05:00"),
      valida_hasta: ISODate("2026-10-17T19:30:00-05:00")
    },
    requisitos_vip: {
      butacas_reclinables_revisadas: true,
      servicio_a_la_silla: true
    },
    actualizado_en: ISODate("2026-10-15T19:30:00-05:00")
  },
  {
    id_funcion: 6,
    id_pelicula: 6,
    id_sala: 1,
    titulo_pelicula: "Encanto",
    formato_sala: "2D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "2K",
      relacion_aspecto: "1.85:1",
      fps: 24,
      tipo_proyector: "Xenón",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "7.1",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Christie CP2220 (xenón)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-10-15T14:00:00-05:00"),
      valida_hasta: ISODate("2026-10-18T14:00:00-05:00")
    },
    actualizado_en: ISODate("2026-10-16T14:00:00-05:00")
  },
  {
    id_funcion: 7,
    id_pelicula: 7,
    id_sala: 2,
    titulo_pelicula: "El Irlandés",
    formato_sala: "2D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "2K",
      relacion_aspecto: "2.39:1",
      fps: 24,
      tipo_proyector: "Xenón",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "5.1",
      idioma: "Inglés",
      subtitulos: {
        activos: true,
        idioma: "Español"
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Christie CP2220 (xenón)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Subtítulos sincronizados",
        obligatorio: true,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-10-16T18:00:00-05:00"),
      valida_hasta: ISODate("2026-10-19T18:00:00-05:00")
    },
    actualizado_en: ISODate("2026-10-17T18:00:00-05:00")
  },
  {
    id_funcion: 8,
    id_pelicula: 8,
    id_sala: 5,
    titulo_pelicula: "Joker",
    formato_sala: "IMAX",
    proyeccion: {
      formato_archivo: "IMAX DCP",
      resolucion: "4K",
      relacion_aspecto: "1.90:1",
      fps: 24,
      tipo_proyector: "Láser",
      brillo_objetivo_fl: 22
    },
    audio: {
      formato: "IMAX 12.0",
      idioma: "Inglés",
      subtitulos: {
        activos: true,
        idioma: "Español"
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "IMAX con Láser (doble cabezal)",
        verificado: true
      },
      {
        tipo: "Servidor",
        modelo: "IMAX ICE",
        verificado: true
      },
      {
        tipo: "Procesador de audio",
        modelo: "IMAX 12 canales",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Subtítulos sincronizados",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Alineación de los dos proyectores",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Calibración IMAX de sonido",
        obligatorio: true,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-10-18T21:00:00-05:00"),
      valida_hasta: ISODate("2026-10-21T21:00:00-05:00")
    },
    requisitos_imax: {
      alineacion_doble_proyector: true,
      calibracion_sonido_12_canales: true,
      version_expandida: false
    },
    ensayo_tecnico: {
      requerido: true,
      fecha: ISODate("2026-10-20T18:00:00-05:00"),
      responsable: "Proyeccionista de turno"
    },
    actualizado_en: ISODate("2026-10-19T21:00:00-05:00")
  },
  {
    id_funcion: 9,
    id_pelicula: 9,
    id_sala: 3,
    titulo_pelicula: "Intensamente 2",
    formato_sala: "3D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "4K",
      relacion_aspecto: "1.85:1",
      fps: 24,
      tipo_proyector: "Láser",
      brillo_objetivo_fl: 6
    },
    audio: {
      formato: "7.1",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Barco SP4K-15C (láser)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: true
      },
      {
        tipo: "Sistema 3D",
        modelo: "RealD XL-DP",
        verificado: true
      },
      {
        tipo: "Pantalla",
        modelo: "Pantalla plateada de alta ganancia",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Conteo de gafas 3D",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Calibración de polarizador",
        obligatorio: true,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-10-20T16:00:00-05:00"),
      valida_hasta: ISODate("2026-10-23T16:00:00-05:00")
    },
    requisitos_3d: {
      tipo_gafas: "Pasivas polarizadas circulares",
      gafas_requeridas: 132,
      gafas_reserva: 12,
      limpieza_gafas: "Lavado y desinfección después de cada función"
    },
    ensayo_tecnico: {
      requerido: true,
      fecha: ISODate("2026-10-22T13:00:00-05:00"),
      responsable: "Proyeccionista de turno"
    },
    actualizado_en: ISODate("2026-10-21T16:00:00-05:00")
  },
  {
    id_funcion: 10,
    id_pelicula: 10,
    id_sala: 1,
    titulo_pelicula: "Barbie",
    formato_sala: "2D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "2K",
      relacion_aspecto: "1.85:1",
      fps: 24,
      tipo_proyector: "Xenón",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "7.1",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Christie CP2220 (xenón)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-10-22T17:00:00-05:00"),
      valida_hasta: ISODate("2026-10-25T17:00:00-05:00")
    },
    actualizado_en: ISODate("2026-10-23T17:00:00-05:00")
  },
  {
    id_funcion: 11,
    id_pelicula: 11,
    id_sala: 4,
    titulo_pelicula: "Cinema Paradiso",
    formato_sala: "VIP",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "4K",
      relacion_aspecto: "1.85:1",
      fps: 24,
      tipo_proyector: "Láser",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "Dolby Atmos",
      idioma: "Italiano",
      subtitulos: {
        activos: true,
        idioma: "Español"
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Sony SRX-R515 (4K)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: true
      },
      {
        tipo: "Procesador de audio",
        modelo: "Dolby CP950A",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Subtítulos sincronizados",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Revisión de butacas reclinables",
        obligatorio: false,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-10-24T18:00:00-05:00"),
      valida_hasta: ISODate("2026-10-27T18:00:00-05:00")
    },
    requisitos_vip: {
      butacas_reclinables_revisadas: true,
      servicio_a_la_silla: true
    },
    actualizado_en: ISODate("2026-10-25T18:00:00-05:00")
  },
  {
    id_funcion: 12,
    id_pelicula: 12,
    id_sala: 2,
    titulo_pelicula: "Mad Max: Furia en el camino",
    formato_sala: "2D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "2K",
      relacion_aspecto: "2.39:1",
      fps: 24,
      tipo_proyector: "Xenón",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "5.1",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Christie CP2220 (xenón)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-10-26T20:00:00-05:00"),
      valida_hasta: ISODate("2026-10-29T20:00:00-05:00")
    },
    actualizado_en: ISODate("2026-10-27T20:00:00-05:00")
  },
  {
    id_funcion: 13,
    id_pelicula: 13,
    id_sala: 5,
    titulo_pelicula: "Avatar: El camino del agua",
    formato_sala: "IMAX",
    proyeccion: {
      formato_archivo: "IMAX DCP",
      resolucion: "4K",
      relacion_aspecto: "1.90:1",
      fps: 48,
      tipo_proyector: "Láser",
      brillo_objetivo_fl: 22
    },
    audio: {
      formato: "IMAX 12.0",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "IMAX con Láser (doble cabezal)",
        verificado: true
      },
      {
        tipo: "Servidor",
        modelo: "IMAX ICE",
        verificado: true
      },
      {
        tipo: "Procesador de audio",
        modelo: "IMAX 12 canales",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Alineación de los dos proyectores",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Calibración IMAX de sonido",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Configuración HFR 48 fps",
        obligatorio: true,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-10-27T19:00:00-05:00"),
      valida_hasta: ISODate("2026-10-30T19:00:00-05:00")
    },
    requisitos_imax: {
      alineacion_doble_proyector: true,
      calibracion_sonido_12_canales: true,
      version_expandida: false
    },
    ensayo_tecnico: {
      requerido: true,
      fecha: ISODate("2026-10-29T16:00:00-05:00"),
      responsable: "Proyeccionista de turno"
    },
    observaciones: "Copia en alta tasa de cuadros (HFR).",
    actualizado_en: ISODate("2026-10-28T19:00:00-05:00")
  },
  {
    id_funcion: 14,
    id_pelicula: 14,
    id_sala: 3,
    titulo_pelicula: "El Origen",
    formato_sala: "3D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "4K",
      relacion_aspecto: "2.39:1",
      fps: 24,
      tipo_proyector: "Láser",
      brillo_objetivo_fl: 6
    },
    audio: {
      formato: "7.1",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Barco SP4K-15C (láser)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: true
      },
      {
        tipo: "Sistema 3D",
        modelo: "RealD XL-DP",
        verificado: true
      },
      {
        tipo: "Pantalla",
        modelo: "Pantalla plateada de alta ganancia",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Conteo de gafas 3D",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Calibración de polarizador",
        obligatorio: true,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-10-29T20:30:00-05:00"),
      valida_hasta: ISODate("2026-11-01T20:30:00-05:00")
    },
    requisitos_3d: {
      tipo_gafas: "Pasivas polarizadas circulares",
      gafas_requeridas: 132,
      gafas_reserva: 12,
      limpieza_gafas: "Lavado y desinfección después de cada función"
    },
    ensayo_tecnico: {
      requerido: true,
      fecha: ISODate("2026-10-31T17:30:00-05:00"),
      responsable: "Proyeccionista de turno"
    },
    actualizado_en: ISODate("2026-10-30T20:30:00-05:00")
  },
  {
    id_funcion: 15,
    id_pelicula: 15,
    id_sala: 1,
    titulo_pelicula: "Spider-Man: Un nuevo universo",
    formato_sala: "2D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "2K",
      relacion_aspecto: "1.85:1",
      fps: 24,
      tipo_proyector: "Xenón",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "7.1",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Christie CP2220 (xenón)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-10-31T16:00:00-05:00"),
      valida_hasta: ISODate("2026-11-03T16:00:00-05:00")
    },
    actualizado_en: ISODate("2026-11-01T16:00:00-05:00")
  },
  {
    id_funcion: 16,
    id_pelicula: 16,
    id_sala: 4,
    titulo_pelicula: "Amélie",
    formato_sala: "VIP",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "4K",
      relacion_aspecto: "1.85:1",
      fps: 24,
      tipo_proyector: "Láser",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "Dolby Atmos",
      idioma: "Francés",
      subtitulos: {
        activos: true,
        idioma: "Español"
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Sony SRX-R515 (4K)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: true
      },
      {
        tipo: "Procesador de audio",
        modelo: "Dolby CP950A",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Subtítulos sincronizados",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Revisión de butacas reclinables",
        obligatorio: false,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-11-01T20:00:00-05:00"),
      valida_hasta: ISODate("2026-11-04T20:00:00-05:00")
    },
    requisitos_vip: {
      butacas_reclinables_revisadas: true,
      servicio_a_la_silla: true
    },
    actualizado_en: ISODate("2026-11-02T20:00:00-05:00")
  },
  {
    id_funcion: 17,
    id_pelicula: 17,
    id_sala: 2,
    titulo_pelicula: "Pulp Fiction",
    formato_sala: "2D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "2K",
      relacion_aspecto: "2.39:1",
      fps: 24,
      tipo_proyector: "Xenón",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "5.1",
      idioma: "Inglés",
      subtitulos: {
        activos: true,
        idioma: "Español"
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Christie CP2220 (xenón)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Subtítulos sincronizados",
        obligatorio: true,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-11-02T21:00:00-05:00"),
      valida_hasta: ISODate("2026-11-05T21:00:00-05:00")
    },
    observaciones: "Función cancelada en PostgreSQL; requisitos conservados como historial.",
    actualizado_en: ISODate("2026-11-03T21:00:00-05:00")
  },
  {
    id_funcion: 18,
    id_pelicula: 18,
    id_sala: 5,
    titulo_pelicula: "Gladiador",
    formato_sala: "IMAX",
    proyeccion: {
      formato_archivo: "IMAX DCP",
      resolucion: "4K",
      relacion_aspecto: "1.90:1",
      fps: 24,
      tipo_proyector: "Láser",
      brillo_objetivo_fl: 22
    },
    audio: {
      formato: "IMAX 12.0",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "IMAX con Láser (doble cabezal)",
        verificado: true
      },
      {
        tipo: "Servidor",
        modelo: "IMAX ICE",
        verificado: true
      },
      {
        tipo: "Procesador de audio",
        modelo: "IMAX 12 canales",
        verificado: true
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Alineación de los dos proyectores",
        obligatorio: true,
        cumplido: true
      },
      {
        item: "Calibración IMAX de sonido",
        obligatorio: true,
        cumplido: true
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-11-11T20:00:00-05:00"),
      valida_hasta: ISODate("2026-11-14T20:00:00-05:00")
    },
    requisitos_imax: {
      alineacion_doble_proyector: true,
      calibracion_sonido_12_canales: true,
      version_expandida: false
    },
    ensayo_tecnico: {
      requerido: true,
      fecha: ISODate("2026-11-13T17:00:00-05:00"),
      responsable: "Proyeccionista de turno"
    },
    observaciones: "Función cancelada en PostgreSQL; requisitos conservados como historial.",
    actualizado_en: ISODate("2026-11-12T20:00:00-05:00")
  },
  {
    id_funcion: 19,
    id_pelicula: 19,
    id_sala: 1,
    titulo_pelicula: "Deadpool y Wolverine",
    formato_sala: "2D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "2K",
      relacion_aspecto: "2.39:1",
      fps: 24,
      tipo_proyector: "Xenón",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "7.1",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Christie CP2220 (xenón)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: false
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: false
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-11-06T19:00:00-05:00"),
      valida_hasta: ISODate("2026-11-09T19:00:00-05:00")
    },
    actualizado_en: ISODate("2026-11-07T19:00:00-05:00")
  },
  {
    id_funcion: 20,
    id_pelicula: 20,
    id_sala: 2,
    titulo_pelicula: "Moana 2",
    formato_sala: "2D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "2K",
      relacion_aspecto: "1.85:1",
      fps: 24,
      tipo_proyector: "Xenón",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "5.1",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Christie CP2220 (xenón)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: false
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: false
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-11-06T15:00:00-05:00"),
      valida_hasta: ISODate("2026-11-09T15:00:00-05:00")
    },
    actualizado_en: ISODate("2026-11-07T15:00:00-05:00")
  },
  {
    id_funcion: 21,
    id_pelicula: 21,
    id_sala: 3,
    titulo_pelicula: "Top Gun: Maverick",
    formato_sala: "3D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "4K",
      relacion_aspecto: "2.39:1",
      fps: 24,
      tipo_proyector: "Láser",
      brillo_objetivo_fl: 6
    },
    audio: {
      formato: "7.1",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Barco SP4K-15C (láser)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: false
      },
      {
        tipo: "Sistema 3D",
        modelo: "RealD XL-DP",
        verificado: false
      },
      {
        tipo: "Pantalla",
        modelo: "Pantalla plateada de alta ganancia",
        verificado: false
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Conteo de gafas 3D",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Calibración de polarizador",
        obligatorio: true,
        cumplido: false
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-11-07T18:00:00-05:00"),
      valida_hasta: ISODate("2026-11-10T18:00:00-05:00")
    },
    requisitos_3d: {
      tipo_gafas: "Pasivas polarizadas circulares",
      gafas_requeridas: 132,
      gafas_reserva: 12,
      limpieza_gafas: "Lavado y desinfección después de cada función"
    },
    ensayo_tecnico: {
      requerido: true,
      fecha: ISODate("2026-11-09T15:00:00-05:00"),
      responsable: "Proyeccionista de turno"
    },
    actualizado_en: ISODate("2026-11-08T18:00:00-05:00")
  },
  {
    id_funcion: 22,
    id_pelicula: 22,
    id_sala: 4,
    titulo_pelicula: "Casablanca",
    formato_sala: "VIP",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "4K",
      relacion_aspecto: "1.85:1",
      fps: 24,
      tipo_proyector: "Láser",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "Dolby Atmos",
      idioma: "Inglés",
      subtitulos: {
        activos: true,
        idioma: "Español"
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Sony SRX-R515 (4K)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: false
      },
      {
        tipo: "Procesador de audio",
        modelo: "Dolby CP950A",
        verificado: false
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Subtítulos sincronizados",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Revisión de butacas reclinables",
        obligatorio: false,
        cumplido: false
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-11-07T20:00:00-05:00"),
      valida_hasta: ISODate("2026-11-10T20:00:00-05:00")
    },
    requisitos_vip: {
      butacas_reclinables_revisadas: true,
      servicio_a_la_silla: true
    },
    actualizado_en: ISODate("2026-11-08T20:00:00-05:00")
  },
  {
    id_funcion: 23,
    id_pelicula: 23,
    id_sala: 5,
    titulo_pelicula: "Interestelar",
    formato_sala: "IMAX",
    proyeccion: {
      formato_archivo: "IMAX DCP",
      resolucion: "4K",
      relacion_aspecto: "1.43:1",
      fps: 24,
      tipo_proyector: "Láser",
      brillo_objetivo_fl: 22
    },
    audio: {
      formato: "IMAX 12.0",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "IMAX con Láser (doble cabezal)",
        verificado: true
      },
      {
        tipo: "Servidor",
        modelo: "IMAX ICE",
        verificado: false
      },
      {
        tipo: "Procesador de audio",
        modelo: "IMAX 12 canales",
        verificado: false
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Alineación de los dos proyectores",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Calibración IMAX de sonido",
        obligatorio: true,
        cumplido: false
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-11-08T19:30:00-05:00"),
      valida_hasta: ISODate("2026-11-11T19:30:00-05:00")
    },
    requisitos_imax: {
      alineacion_doble_proyector: true,
      calibracion_sonido_12_canales: true,
      version_expandida: true
    },
    ensayo_tecnico: {
      requerido: true,
      fecha: ISODate("2026-11-10T16:30:00-05:00"),
      responsable: "Proyeccionista de turno"
    },
    observaciones: "Película con escenas en formato IMAX expandido.",
    actualizado_en: ISODate("2026-11-09T19:30:00-05:00")
  },
  {
    id_funcion: 24,
    id_pelicula: 24,
    id_sala: 1,
    titulo_pelicula: "El Padrino",
    formato_sala: "2D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "2K",
      relacion_aspecto: "2.39:1",
      fps: 24,
      tipo_proyector: "Xenón",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "7.1",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Christie CP2220 (xenón)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: false
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: false
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-11-09T18:30:00-05:00"),
      valida_hasta: ISODate("2026-11-12T18:30:00-05:00")
    },
    actualizado_en: ISODate("2026-11-10T18:30:00-05:00")
  },
  {
    id_funcion: 25,
    id_pelicula: 2,
    id_sala: 2,
    titulo_pelicula: "Coco",
    formato_sala: "2D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "2K",
      relacion_aspecto: "1.85:1",
      fps: 24,
      tipo_proyector: "Xenón",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "5.1",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Christie CP2220 (xenón)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: false
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: false
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-11-10T14:00:00-05:00"),
      valida_hasta: ISODate("2026-11-13T14:00:00-05:00")
    },
    actualizado_en: ISODate("2026-11-11T14:00:00-05:00")
  },
  {
    id_funcion: 26,
    id_pelicula: 25,
    id_sala: 3,
    titulo_pelicula: "Pobres criaturas",
    formato_sala: "3D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "4K",
      relacion_aspecto: "2.39:1",
      fps: 24,
      tipo_proyector: "Láser",
      brillo_objetivo_fl: 6
    },
    audio: {
      formato: "7.1",
      idioma: "Inglés",
      subtitulos: {
        activos: true,
        idioma: "Español"
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Barco SP4K-15C (láser)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: false
      },
      {
        tipo: "Sistema 3D",
        modelo: "RealD XL-DP",
        verificado: false
      },
      {
        tipo: "Pantalla",
        modelo: "Pantalla plateada de alta ganancia",
        verificado: false
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Subtítulos sincronizados",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Conteo de gafas 3D",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Calibración de polarizador",
        obligatorio: true,
        cumplido: false
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-11-12T20:00:00-05:00"),
      valida_hasta: ISODate("2026-11-15T20:00:00-05:00")
    },
    requisitos_3d: {
      tipo_gafas: "Pasivas polarizadas circulares",
      gafas_requeridas: 132,
      gafas_reserva: 12,
      limpieza_gafas: "Lavado y desinfección después de cada función"
    },
    ensayo_tecnico: {
      requerido: true,
      fecha: ISODate("2026-11-14T17:00:00-05:00"),
      responsable: "Proyeccionista de turno"
    },
    actualizado_en: ISODate("2026-11-13T20:00:00-05:00")
  },
  {
    id_funcion: 27,
    id_pelicula: 10,
    id_sala: 5,
    titulo_pelicula: "Barbie",
    formato_sala: "IMAX",
    proyeccion: {
      formato_archivo: "IMAX DCP",
      resolucion: "4K",
      relacion_aspecto: "1.90:1",
      fps: 24,
      tipo_proyector: "Láser",
      brillo_objetivo_fl: 22
    },
    audio: {
      formato: "IMAX 12.0",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "IMAX con Láser (doble cabezal)",
        verificado: true
      },
      {
        tipo: "Servidor",
        modelo: "IMAX ICE",
        verificado: false
      },
      {
        tipo: "Procesador de audio",
        modelo: "IMAX 12 canales",
        verificado: false
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Alineación de los dos proyectores",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Calibración IMAX de sonido",
        obligatorio: true,
        cumplido: false
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-11-13T17:00:00-05:00"),
      valida_hasta: ISODate("2026-11-16T17:00:00-05:00")
    },
    requisitos_imax: {
      alineacion_doble_proyector: true,
      calibracion_sonido_12_canales: true,
      version_expandida: false
    },
    ensayo_tecnico: {
      requerido: true,
      fecha: ISODate("2026-11-15T14:00:00-05:00"),
      responsable: "Proyeccionista de turno"
    },
    actualizado_en: ISODate("2026-11-14T17:00:00-05:00")
  },
  {
    id_funcion: 28,
    id_pelicula: 6,
    id_sala: 1,
    titulo_pelicula: "Encanto",
    formato_sala: "2D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "2K",
      relacion_aspecto: "1.85:1",
      fps: 24,
      tipo_proyector: "Xenón",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "7.1",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Christie CP2220 (xenón)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: false
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: false
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-11-14T15:00:00-05:00"),
      valida_hasta: ISODate("2026-11-17T15:00:00-05:00")
    },
    actualizado_en: ISODate("2026-11-15T15:00:00-05:00")
  },
  {
    id_funcion: 29,
    id_pelicula: 3,
    id_sala: 4,
    titulo_pelicula: "Parásitos",
    formato_sala: "VIP",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "4K",
      relacion_aspecto: "2.39:1",
      fps: 24,
      tipo_proyector: "Láser",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "Dolby Atmos",
      idioma: "Coreano",
      subtitulos: {
        activos: true,
        idioma: "Español"
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Sony SRX-R515 (4K)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: false
      },
      {
        tipo: "Procesador de audio",
        modelo: "Dolby CP950A",
        verificado: false
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Subtítulos sincronizados",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Revisión de butacas reclinables",
        obligatorio: false,
        cumplido: false
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-11-15T19:30:00-05:00"),
      valida_hasta: ISODate("2026-11-18T19:30:00-05:00")
    },
    requisitos_vip: {
      butacas_reclinables_revisadas: true,
      servicio_a_la_silla: true
    },
    actualizado_en: ISODate("2026-11-16T19:30:00-05:00")
  },
  {
    id_funcion: 30,
    id_pelicula: 12,
    id_sala: 2,
    titulo_pelicula: "Mad Max: Furia en el camino",
    formato_sala: "2D",
    proyeccion: {
      formato_archivo: "DCP",
      resolucion: "2K",
      relacion_aspecto: "2.39:1",
      fps: 24,
      tipo_proyector: "Xenón",
      brillo_objetivo_fl: 14
    },
    audio: {
      formato: "5.1",
      idioma: "Español",
      subtitulos: {
        activos: false
      }
    },
    equipos: [
      {
        tipo: "Proyector",
        modelo: "Christie CP2220 (xenón)",
        verificado: true
      },
      {
        tipo: "Servidor DCP",
        modelo: "Dolby IMS3000",
        verificado: false
      }
    ],
    checklist: [
      {
        item: "Prueba de imagen y enfoque",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "Prueba de sonido por canal",
        obligatorio: true,
        cumplido: false
      },
      {
        item: "KDM cargada en el servidor",
        obligatorio: true,
        cumplido: false
      }
    ],
    llave_kdm: {
      requerida: true,
      valida_desde: ISODate("2026-11-17T20:00:00-05:00"),
      valida_hasta: ISODate("2026-11-20T20:00:00-05:00")
    },
    actualizado_en: ISODate("2026-11-18T20:00:00-05:00")
  }
]);

db.requisitos_proyeccion.countDocuments();


// ----- BLOQUE: fichas_tecnicas_peliculas (Santiago Rojas) -----
// Avance 2 - MongoDB - Coleccion fichas_tecnicas_peliculas
// Responsable: Santiago Rojas
//
// Inserta 30 documentos: una ficha tecnica por cada funcion de PostgreSQL
// (id_funcion 1 a 30), con el id_pelicula real de esa funcion. Titulo, duracion
// y clasificacion coinciden con los de PostgreSQL. Las peliculas que tienen dos
// funciones (Coco, Encanto, Barbie, Parasitos, Mad Max) repiten la misma ficha.
// Datos de prueba; "versiones" es el catalogo de versiones que el cine puede exhibir.

db.fichas_tecnicas_peliculas.deleteMany({});

// Insercion valida que se ACEPTA (evidencia del $jsonSchema): funcion 1
db.fichas_tecnicas_peliculas.insertOne({
  id_funcion: 1,
  id_pelicula: 1,
  titulo_pelicula: "Oppenheimer",
  ficha: {
    titulo_original: "Oppenheimer",
    anio_estreno: 2023,
    directores: ["Christopher Nolan"],
    paises: ["Estados Unidos", "Reino Unido"],
    idioma_original: "Inglés",
    generos: ["Drama", "Biografía"],
    duracion_min: 180,
    clasificacion: "+15",
    reparto_principal: [
      {
        nombre: "Cillian Murphy",
        personaje: "J. Robert Oppenheimer"
      },
      {
        nombre: "Emily Blunt",
        personaje: "Kitty Oppenheimer"
      },
      {
        nombre: "Robert Downey Jr.",
        personaje: "Lewis Strauss"
      }
    ]
  },
  versiones: [
    {
      idioma_audio: "Inglés",
      subtitulos: "Español",
      formato: "2D",
      tipo_version: "Subtitulada"
    },
    {
      idioma_audio: "Inglés",
      subtitulos: "Español",
      formato: "IMAX",
      tipo_version: "Subtitulada"
    },
    {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "2D",
      tipo_version: "Doblada"
    }
  ],
  version_exhibida: {
    idioma_audio: "Inglés",
    subtitulos: "Español",
    formato: "2D"
  },
  premios: [
    {
      nombre: "Premio Óscar",
      anio: 2024,
      categoria: "Mejor película"
    }
  ],
  actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
});

// Resto de documentos: funciones 2 a 30
db.fichas_tecnicas_peliculas.insertMany([
  {
    id_funcion: 2,
    id_pelicula: 2,
    titulo_pelicula: "Coco",
    ficha: {
      titulo_original: "Coco",
      anio_estreno: 2017,
      directores: ["Lee Unkrich"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Animación", "Familiar"],
      duracion_min: 105,
      clasificacion: "Todo publico",
      reparto_principal: [
        {
          nombre: "Anthony Gonzalez",
          personaje: "Miguel"
        },
        {
          nombre: "Gael García Bernal",
          personaje: "Héctor"
        },
        {
          nombre: "Benjamin Bratt",
          personaje: "Ernesto de la Cruz"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "3D",
        tipo_version: "Doblada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "2D"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2018,
        categoria: "Mejor película animada"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 3,
    id_pelicula: 3,
    titulo_pelicula: "Parásitos",
    ficha: {
      titulo_original: "Gisaengchung",
      anio_estreno: 2019,
      directores: ["Bong Joon-ho"],
      paises: ["Corea del Sur"],
      idioma_original: "Coreano",
      generos: ["Thriller", "Drama"],
      duracion_min: 132,
      clasificacion: "+15",
      reparto_principal: [
        {
          nombre: "Song Kang-ho",
          personaje: "Kim Ki-taek"
        },
        {
          nombre: "Choi Woo-shik",
          personaje: "Kim Ki-woo"
        },
        {
          nombre: "Park So-dam",
          personaje: "Kim Ki-jung"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Coreano",
        subtitulos: "Español",
        formato: "3D",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Coreano",
        subtitulos: "Español",
        formato: "VIP",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Coreano",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Coreano",
      subtitulos: "Español",
      formato: "3D"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2020,
        categoria: "Mejor película"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 4,
    id_pelicula: 4,
    titulo_pelicula: "Dune: Parte Dos",
    ficha: {
      titulo_original: "Dune: Part Two",
      anio_estreno: 2024,
      directores: ["Denis Villeneuve"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Ciencia ficción", "Aventura"],
      duracion_min: 166,
      clasificacion: "+12",
      reparto_principal: [
        {
          nombre: "Timothée Chalamet",
          personaje: "Paul Atreides"
        },
        {
          nombre: "Zendaya",
          personaje: "Chani"
        },
        {
          nombre: "Rebecca Ferguson",
          personaje: "Lady Jessica"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "IMAX",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "IMAX",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "3D",
        tipo_version: "Doblada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Inglés",
      subtitulos: "Español",
      formato: "IMAX"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2025,
        categoria: "Mejores efectos visuales"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 5,
    id_pelicula: 5,
    titulo_pelicula: "La La Land",
    ficha: {
      titulo_original: "La La Land",
      anio_estreno: 2016,
      directores: ["Damien Chazelle"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Musical", "Romance"],
      duracion_min: 128,
      clasificacion: "+7",
      reparto_principal: [
        {
          nombre: "Ryan Gosling",
          personaje: "Sebastian"
        },
        {
          nombre: "Emma Stone",
          personaje: "Mia"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "VIP",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Inglés",
      subtitulos: "Español",
      formato: "VIP"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2017,
        categoria: "Mejor director"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 6,
    id_pelicula: 6,
    titulo_pelicula: "Encanto",
    ficha: {
      titulo_original: "Encanto",
      anio_estreno: 2021,
      directores: ["Byron Howard", "Jared Bush"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Animación", "Musical"],
      duracion_min: 102,
      clasificacion: "Todo publico",
      reparto_principal: [
        {
          nombre: "Stephanie Beatriz",
          personaje: "Mirabel"
        },
        {
          nombre: "María Cecilia Botero",
          personaje: "Abuela Alma"
        },
        {
          nombre: "John Leguizamo",
          personaje: "Bruno"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "3D",
        tipo_version: "Doblada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "2D"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2022,
        categoria: "Mejor película animada"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 7,
    id_pelicula: 7,
    titulo_pelicula: "El Irlandés",
    ficha: {
      titulo_original: "The Irishman",
      anio_estreno: 2019,
      directores: ["Martin Scorsese"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Drama", "Crimen"],
      duracion_min: 209,
      clasificacion: "+15",
      reparto_principal: [
        {
          nombre: "Robert De Niro",
          personaje: "Frank Sheeran"
        },
        {
          nombre: "Al Pacino",
          personaje: "Jimmy Hoffa"
        },
        {
          nombre: "Joe Pesci",
          personaje: "Russell Bufalino"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Inglés",
      subtitulos: "Español",
      formato: "2D"
    },
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 8,
    id_pelicula: 8,
    titulo_pelicula: "Joker",
    ficha: {
      titulo_original: "Joker",
      anio_estreno: 2019,
      directores: ["Todd Phillips"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Thriller", "Drama"],
      duracion_min: 122,
      clasificacion: "+18",
      reparto_principal: [
        {
          nombre: "Joaquin Phoenix",
          personaje: "Arthur Fleck"
        },
        {
          nombre: "Robert De Niro",
          personaje: "Murray Franklin"
        },
        {
          nombre: "Zazie Beetz",
          personaje: "Sophie Dumond"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "IMAX",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Inglés",
      subtitulos: "Español",
      formato: "IMAX"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2020,
        categoria: "Mejor actor"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 9,
    id_pelicula: 9,
    titulo_pelicula: "Intensamente 2",
    ficha: {
      titulo_original: "Inside Out 2",
      anio_estreno: 2024,
      directores: ["Kelsey Mann"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Animación", "Comedia"],
      duracion_min: 96,
      clasificacion: "Todo publico",
      reparto_principal: [
        {
          nombre: "Amy Poehler",
          personaje: "Alegría"
        },
        {
          nombre: "Maya Hawke",
          personaje: "Ansiedad"
        },
        {
          nombre: "Lewis Black",
          personaje: "Ira"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "3D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "3D"
    },
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 10,
    id_pelicula: 10,
    titulo_pelicula: "Barbie",
    ficha: {
      titulo_original: "Barbie",
      anio_estreno: 2023,
      directores: ["Greta Gerwig"],
      paises: ["Estados Unidos", "Reino Unido"],
      idioma_original: "Inglés",
      generos: ["Comedia", "Fantasía"],
      duracion_min: 114,
      clasificacion: "+12",
      reparto_principal: [
        {
          nombre: "Margot Robbie",
          personaje: "Barbie"
        },
        {
          nombre: "Ryan Gosling",
          personaje: "Ken"
        },
        {
          nombre: "America Ferrera",
          personaje: "Gloria"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "IMAX",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "2D"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2024,
        categoria: "Mejor canción original"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 11,
    id_pelicula: 11,
    titulo_pelicula: "Cinema Paradiso",
    ficha: {
      titulo_original: "Nuovo Cinema Paradiso",
      anio_estreno: 1988,
      directores: ["Giuseppe Tornatore"],
      paises: ["Italia", "Francia"],
      idioma_original: "Italiano",
      generos: ["Drama"],
      duracion_min: 155,
      clasificacion: "+7",
      reparto_principal: [
        {
          nombre: "Philippe Noiret",
          personaje: "Alfredo"
        },
        {
          nombre: "Salvatore Cascio",
          personaje: "Totò niño"
        },
        {
          nombre: "Jacques Perrin",
          personaje: "Salvatore adulto"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Italiano",
        subtitulos: "Español",
        formato: "VIP",
        tipo_version: "Subtitulada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Italiano",
      subtitulos: "Español",
      formato: "VIP"
    },
    observaciones: "Existe una versión extendida del director de 173 min; en cartelera se exhibe la versión de estreno de 155 min.",
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 12,
    id_pelicula: 12,
    titulo_pelicula: "Mad Max: Furia en el camino",
    ficha: {
      titulo_original: "Mad Max: Fury Road",
      anio_estreno: 2015,
      directores: ["George Miller"],
      paises: ["Australia", "Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Acción", "Ciencia ficción"],
      duracion_min: 120,
      clasificacion: "+15",
      reparto_principal: [
        {
          nombre: "Tom Hardy",
          personaje: "Max Rockatansky"
        },
        {
          nombre: "Charlize Theron",
          personaje: "Furiosa"
        },
        {
          nombre: "Nicholas Hoult",
          personaje: "Nux"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "IMAX",
        tipo_version: "Doblada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "2D"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2016,
        categoria: "Mejor diseño de vestuario"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 13,
    id_pelicula: 13,
    titulo_pelicula: "Avatar: El camino del agua",
    ficha: {
      titulo_original: "Avatar: The Way of Water",
      anio_estreno: 2022,
      directores: ["James Cameron"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Ciencia ficción", "Aventura"],
      duracion_min: 192,
      clasificacion: "+12",
      reparto_principal: [
        {
          nombre: "Sam Worthington",
          personaje: "Jake Sully"
        },
        {
          nombre: "Zoe Saldaña",
          personaje: "Neytiri"
        },
        {
          nombre: "Sigourney Weaver",
          personaje: "Kiri"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "IMAX",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "3D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "IMAX",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "3D",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "IMAX"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2023,
        categoria: "Mejores efectos visuales"
      }
    ],
    observaciones: "Copia en alta tasa de cuadros (HFR) para IMAX.",
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 14,
    id_pelicula: 14,
    titulo_pelicula: "El Origen",
    ficha: {
      titulo_original: "Inception",
      anio_estreno: 2010,
      directores: ["Christopher Nolan"],
      paises: ["Estados Unidos", "Reino Unido"],
      idioma_original: "Inglés",
      generos: ["Ciencia ficción", "Acción"],
      duracion_min: 148,
      clasificacion: "+12",
      reparto_principal: [
        {
          nombre: "Leonardo DiCaprio",
          personaje: "Dom Cobb"
        },
        {
          nombre: "Joseph Gordon-Levitt",
          personaje: "Arthur"
        },
        {
          nombre: "Elliot Page",
          personaje: "Ariadne"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "3D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "3D"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2011,
        categoria: "Mejor fotografía"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 15,
    id_pelicula: 15,
    titulo_pelicula: "Spider-Man: Un nuevo universo",
    ficha: {
      titulo_original: "Spider-Man: Into the Spider-Verse",
      anio_estreno: 2018,
      directores: ["Bob Persichetti", "Peter Ramsey", "Rodney Rothman"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Animación", "Acción"],
      duracion_min: 117,
      clasificacion: "+7",
      reparto_principal: [
        {
          nombre: "Shameik Moore",
          personaje: "Miles Morales"
        },
        {
          nombre: "Hailee Steinfeld",
          personaje: "Gwen Stacy"
        },
        {
          nombre: "Mahershala Ali",
          personaje: "Aaron Davis"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "3D",
        tipo_version: "Doblada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "2D"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2019,
        categoria: "Mejor película animada"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 16,
    id_pelicula: 16,
    titulo_pelicula: "Amélie",
    ficha: {
      titulo_original: "Le Fabuleux Destin d'Amélie Poulain",
      anio_estreno: 2001,
      directores: ["Jean-Pierre Jeunet"],
      paises: ["Francia"],
      idioma_original: "Francés",
      generos: ["Comedia romántica"],
      duracion_min: 122,
      clasificacion: "+12",
      reparto_principal: [
        {
          nombre: "Audrey Tautou",
          personaje: "Amélie Poulain"
        },
        {
          nombre: "Mathieu Kassovitz",
          personaje: "Nino Quincampoix"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Francés",
        subtitulos: "Español",
        formato: "VIP",
        tipo_version: "Subtitulada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Francés",
      subtitulos: "Español",
      formato: "VIP"
    },
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 17,
    id_pelicula: 17,
    titulo_pelicula: "Pulp Fiction",
    ficha: {
      titulo_original: "Pulp Fiction",
      anio_estreno: 1994,
      directores: ["Quentin Tarantino"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Crimen", "Drama"],
      duracion_min: 154,
      clasificacion: "+18",
      reparto_principal: [
        {
          nombre: "John Travolta",
          personaje: "Vincent Vega"
        },
        {
          nombre: "Samuel L. Jackson",
          personaje: "Jules Winnfield"
        },
        {
          nombre: "Uma Thurman",
          personaje: "Mia Wallace"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Inglés",
      subtitulos: "Español",
      formato: "2D"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 1995,
        categoria: "Mejor guion original"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 18,
    id_pelicula: 18,
    titulo_pelicula: "Gladiador",
    ficha: {
      titulo_original: "Gladiator",
      anio_estreno: 2000,
      directores: ["Ridley Scott"],
      paises: ["Estados Unidos", "Reino Unido"],
      idioma_original: "Inglés",
      generos: ["Acción", "Drama"],
      duracion_min: 155,
      clasificacion: "+15",
      reparto_principal: [
        {
          nombre: "Russell Crowe",
          personaje: "Máximo Décimo Meridio"
        },
        {
          nombre: "Joaquin Phoenix",
          personaje: "Cómodo"
        },
        {
          nombre: "Connie Nielsen",
          personaje: "Lucila"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "IMAX",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "IMAX",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "IMAX"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2001,
        categoria: "Mejor película"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 19,
    id_pelicula: 19,
    titulo_pelicula: "Deadpool y Wolverine",
    ficha: {
      titulo_original: "Deadpool & Wolverine",
      anio_estreno: 2024,
      directores: ["Shawn Levy"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Acción", "Comedia"],
      duracion_min: 128,
      clasificacion: "+15",
      reparto_principal: [
        {
          nombre: "Ryan Reynolds",
          personaje: "Wade Wilson / Deadpool"
        },
        {
          nombre: "Hugh Jackman",
          personaje: "Logan / Wolverine"
        },
        {
          nombre: "Emma Corrin",
          personaje: "Cassandra Nova"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "3D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "IMAX",
        tipo_version: "Subtitulada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "2D"
    },
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 20,
    id_pelicula: 20,
    titulo_pelicula: "Moana 2",
    ficha: {
      titulo_original: "Moana 2",
      anio_estreno: 2024,
      directores: ["David G. Derrick Jr.", "Jason Hand", "Dana Ledoux Miller"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Animación", "Aventura"],
      duracion_min: 100,
      clasificacion: "Todo publico",
      reparto_principal: [
        {
          nombre: "Auli'i Cravalho",
          personaje: "Moana"
        },
        {
          nombre: "Dwayne Johnson",
          personaje: "Maui"
        },
        {
          nombre: "Rose Matafeo",
          personaje: "Loto"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "3D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "2D"
    },
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 21,
    id_pelicula: 21,
    titulo_pelicula: "Top Gun: Maverick",
    ficha: {
      titulo_original: "Top Gun: Maverick",
      anio_estreno: 2022,
      directores: ["Joseph Kosinski"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Acción", "Drama"],
      duracion_min: 130,
      clasificacion: "+12",
      reparto_principal: [
        {
          nombre: "Tom Cruise",
          personaje: "Pete \"Maverick\" Mitchell"
        },
        {
          nombre: "Miles Teller",
          personaje: "Bradley \"Rooster\" Bradshaw"
        },
        {
          nombre: "Jennifer Connelly",
          personaje: "Penny Benjamin"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "3D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "IMAX",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "3D"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2023,
        categoria: "Mejor sonido"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 22,
    id_pelicula: 22,
    titulo_pelicula: "Casablanca",
    ficha: {
      titulo_original: "Casablanca",
      anio_estreno: 1942,
      directores: ["Michael Curtiz"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Romance", "Drama"],
      duracion_min: 102,
      clasificacion: "+7",
      reparto_principal: [
        {
          nombre: "Humphrey Bogart",
          personaje: "Rick Blaine"
        },
        {
          nombre: "Ingrid Bergman",
          personaje: "Ilsa Lund"
        },
        {
          nombre: "Paul Henreid",
          personaje: "Victor Laszlo"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "VIP",
        tipo_version: "Subtitulada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Inglés",
      subtitulos: "Español",
      formato: "VIP"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 1944,
        categoria: "Mejor película"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 23,
    id_pelicula: 23,
    titulo_pelicula: "Interestelar",
    ficha: {
      titulo_original: "Interstellar",
      anio_estreno: 2014,
      directores: ["Christopher Nolan"],
      paises: ["Estados Unidos", "Reino Unido"],
      idioma_original: "Inglés",
      generos: ["Ciencia ficción", "Drama"],
      duracion_min: 169,
      clasificacion: "+12",
      reparto_principal: [
        {
          nombre: "Matthew McConaughey",
          personaje: "Joseph Cooper"
        },
        {
          nombre: "Anne Hathaway",
          personaje: "Amelia Brand"
        },
        {
          nombre: "Jessica Chastain",
          personaje: "Murph"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "IMAX",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "IMAX",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "IMAX"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2015,
        categoria: "Mejores efectos visuales"
      }
    ],
    observaciones: "Película con escenas en formato IMAX expandido.",
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 24,
    id_pelicula: 24,
    titulo_pelicula: "El Padrino",
    ficha: {
      titulo_original: "The Godfather",
      anio_estreno: 1972,
      directores: ["Francis Ford Coppola"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Crimen", "Drama"],
      duracion_min: 175,
      clasificacion: "+15",
      reparto_principal: [
        {
          nombre: "Marlon Brando",
          personaje: "Vito Corleone"
        },
        {
          nombre: "Al Pacino",
          personaje: "Michael Corleone"
        },
        {
          nombre: "James Caan",
          personaje: "Sonny Corleone"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "2D"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 1973,
        categoria: "Mejor película"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 25,
    id_pelicula: 2,
    titulo_pelicula: "Coco",
    ficha: {
      titulo_original: "Coco",
      anio_estreno: 2017,
      directores: ["Lee Unkrich"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Animación", "Familiar"],
      duracion_min: 105,
      clasificacion: "Todo publico",
      reparto_principal: [
        {
          nombre: "Anthony Gonzalez",
          personaje: "Miguel"
        },
        {
          nombre: "Gael García Bernal",
          personaje: "Héctor"
        },
        {
          nombre: "Benjamin Bratt",
          personaje: "Ernesto de la Cruz"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "3D",
        tipo_version: "Doblada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "2D"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2018,
        categoria: "Mejor película animada"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 26,
    id_pelicula: 25,
    titulo_pelicula: "Pobres criaturas",
    ficha: {
      titulo_original: "Poor Things",
      anio_estreno: 2023,
      directores: ["Yorgos Lanthimos"],
      paises: ["Irlanda", "Reino Unido", "Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Comedia dramática", "Ciencia ficción"],
      duracion_min: 141,
      clasificacion: "+18",
      reparto_principal: [
        {
          nombre: "Emma Stone",
          personaje: "Bella Baxter"
        },
        {
          nombre: "Mark Ruffalo",
          personaje: "Duncan Wedderburn"
        },
        {
          nombre: "Willem Dafoe",
          personaje: "Godwin Baxter"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "3D",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Inglés",
      subtitulos: "Español",
      formato: "3D"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2024,
        categoria: "Mejor actriz"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 27,
    id_pelicula: 10,
    titulo_pelicula: "Barbie",
    ficha: {
      titulo_original: "Barbie",
      anio_estreno: 2023,
      directores: ["Greta Gerwig"],
      paises: ["Estados Unidos", "Reino Unido"],
      idioma_original: "Inglés",
      generos: ["Comedia", "Fantasía"],
      duracion_min: 114,
      clasificacion: "+12",
      reparto_principal: [
        {
          nombre: "Margot Robbie",
          personaje: "Barbie"
        },
        {
          nombre: "Ryan Gosling",
          personaje: "Ken"
        },
        {
          nombre: "America Ferrera",
          personaje: "Gloria"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "IMAX",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "IMAX"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2024,
        categoria: "Mejor canción original"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 28,
    id_pelicula: 6,
    titulo_pelicula: "Encanto",
    ficha: {
      titulo_original: "Encanto",
      anio_estreno: 2021,
      directores: ["Byron Howard", "Jared Bush"],
      paises: ["Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Animación", "Musical"],
      duracion_min: 102,
      clasificacion: "Todo publico",
      reparto_principal: [
        {
          nombre: "Stephanie Beatriz",
          personaje: "Mirabel"
        },
        {
          nombre: "María Cecilia Botero",
          personaje: "Abuela Alma"
        },
        {
          nombre: "John Leguizamo",
          personaje: "Bruno"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "3D",
        tipo_version: "Doblada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "2D"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2022,
        categoria: "Mejor película animada"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 29,
    id_pelicula: 3,
    titulo_pelicula: "Parásitos",
    ficha: {
      titulo_original: "Gisaengchung",
      anio_estreno: 2019,
      directores: ["Bong Joon-ho"],
      paises: ["Corea del Sur"],
      idioma_original: "Coreano",
      generos: ["Thriller", "Drama"],
      duracion_min: 132,
      clasificacion: "+15",
      reparto_principal: [
        {
          nombre: "Song Kang-ho",
          personaje: "Kim Ki-taek"
        },
        {
          nombre: "Choi Woo-shik",
          personaje: "Kim Ki-woo"
        },
        {
          nombre: "Park So-dam",
          personaje: "Kim Ki-jung"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Coreano",
        subtitulos: "Español",
        formato: "3D",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Coreano",
        subtitulos: "Español",
        formato: "VIP",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Coreano",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Coreano",
      subtitulos: "Español",
      formato: "VIP"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2020,
        categoria: "Mejor película"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_funcion: 30,
    id_pelicula: 12,
    titulo_pelicula: "Mad Max: Furia en el camino",
    ficha: {
      titulo_original: "Mad Max: Fury Road",
      anio_estreno: 2015,
      directores: ["George Miller"],
      paises: ["Australia", "Estados Unidos"],
      idioma_original: "Inglés",
      generos: ["Acción", "Ciencia ficción"],
      duracion_min: 120,
      clasificacion: "+15",
      reparto_principal: [
        {
          nombre: "Tom Hardy",
          personaje: "Max Rockatansky"
        },
        {
          nombre: "Charlize Theron",
          personaje: "Furiosa"
        },
        {
          nombre: "Nicholas Hoult",
          personaje: "Nux"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Doblada"
      },
      {
        idioma_audio: "Inglés",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "IMAX",
        tipo_version: "Doblada"
      }
    ],
    version_exhibida: {
      idioma_audio: "Español",
      subtitulos: "Ninguno",
      formato: "2D"
    },
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2016,
        categoria: "Mejor diseño de vestuario"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  }
]);

db.fichas_tecnicas_peliculas.countDocuments();
