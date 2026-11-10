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
