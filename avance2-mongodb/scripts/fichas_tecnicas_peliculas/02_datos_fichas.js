// Avance 2 - MongoDB - Coleccion fichas_tecnicas_peliculas
// Responsable: Santiago Rojas
//
// Inserta una ficha tecnica por PELICULA (id_pelicula de PostgreSQL), sin id_funcion.
// Asi las peliculas con dos funciones (Coco, Encanto, Barbie, Parasitos, Mad Max)
// tienen una sola ficha. Titulo, duracion y clasificacion coinciden con PostgreSQL.
// Datos de prueba; "versiones" es el catalogo de versiones que el cine puede exhibir.
// Son 37 fichas: id_pelicula 1 a 25 (con funciones) y 26 a 37 (catalogo sin
// funciones programadas, cine colombiano y latinoamericano).

db.fichas_tecnicas_peliculas.deleteMany({});

// Insercion valida que se ACEPTA (evidencia del $jsonSchema): pelicula 1
db.fichas_tecnicas_peliculas.insertOne(
{
  id_pelicula: 1,
  titulo_pelicula: "Oppenheimer",
  ficha: {
    titulo_original: "Oppenheimer",
    anio_estreno: 2023,
    directores: [
      "Christopher Nolan"
    ],
    paises: [
      "Estados Unidos",
      "Reino Unido"
    ],
    idioma_original: "Inglés",
    generos: [
      "Drama",
      "Biografía"
    ],
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
  premios: [
    {
      nombre: "Premio Óscar",
      anio: 2024,
      categoria: "Mejor película"
    }
  ],
  actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
});

// Resto de documentos
db.fichas_tecnicas_peliculas.insertMany([
  {
    id_pelicula: 2,
    titulo_pelicula: "Coco",
    ficha: {
      titulo_original: "Coco",
      anio_estreno: 2017,
      directores: [
        "Lee Unkrich"
      ],
      paises: [
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Animación",
        "Familiar"
      ],
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
    id_pelicula: 3,
    titulo_pelicula: "Parásitos",
    ficha: {
      titulo_original: "Gisaengchung",
      anio_estreno: 2019,
      directores: [
        "Bong Joon-ho"
      ],
      paises: [
        "Corea del Sur"
      ],
      idioma_original: "Coreano",
      generos: [
        "Thriller",
        "Drama"
      ],
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
    id_pelicula: 4,
    titulo_pelicula: "Dune: Parte Dos",
    ficha: {
      titulo_original: "Dune: Part Two",
      anio_estreno: 2024,
      directores: [
        "Denis Villeneuve"
      ],
      paises: [
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Ciencia ficción",
        "Aventura"
      ],
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
    id_pelicula: 5,
    titulo_pelicula: "La La Land",
    ficha: {
      titulo_original: "La La Land",
      anio_estreno: 2016,
      directores: [
        "Damien Chazelle"
      ],
      paises: [
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Musical",
        "Romance"
      ],
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
    id_pelicula: 6,
    titulo_pelicula: "Encanto",
    ficha: {
      titulo_original: "Encanto",
      anio_estreno: 2021,
      directores: [
        "Byron Howard",
        "Jared Bush"
      ],
      paises: [
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Animación",
        "Musical"
      ],
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
    id_pelicula: 7,
    titulo_pelicula: "El Irlandés",
    ficha: {
      titulo_original: "The Irishman",
      anio_estreno: 2019,
      directores: [
        "Martin Scorsese"
      ],
      paises: [
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Drama",
        "Crimen"
      ],
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
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 8,
    titulo_pelicula: "Joker",
    ficha: {
      titulo_original: "Joker",
      anio_estreno: 2019,
      directores: [
        "Todd Phillips"
      ],
      paises: [
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Thriller",
        "Drama"
      ],
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
    id_pelicula: 9,
    titulo_pelicula: "Intensamente 2",
    ficha: {
      titulo_original: "Inside Out 2",
      anio_estreno: 2024,
      directores: [
        "Kelsey Mann"
      ],
      paises: [
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Animación",
        "Comedia"
      ],
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
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 10,
    titulo_pelicula: "Barbie",
    ficha: {
      titulo_original: "Barbie",
      anio_estreno: 2023,
      directores: [
        "Greta Gerwig"
      ],
      paises: [
        "Estados Unidos",
        "Reino Unido"
      ],
      idioma_original: "Inglés",
      generos: [
        "Comedia",
        "Fantasía"
      ],
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
    id_pelicula: 11,
    titulo_pelicula: "Cinema Paradiso",
    ficha: {
      titulo_original: "Nuovo Cinema Paradiso",
      anio_estreno: 1988,
      directores: [
        "Giuseppe Tornatore"
      ],
      paises: [
        "Italia",
        "Francia"
      ],
      idioma_original: "Italiano",
      generos: [
        "Drama"
      ],
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
    observaciones: "Existe una versión extendida del director de 173 min; en cartelera se exhibe la versión de estreno de 155 min.",
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 12,
    titulo_pelicula: "Mad Max: Furia en el camino",
    ficha: {
      titulo_original: "Mad Max: Fury Road",
      anio_estreno: 2015,
      directores: [
        "George Miller"
      ],
      paises: [
        "Australia",
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Acción",
        "Ciencia ficción"
      ],
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
    id_pelicula: 13,
    titulo_pelicula: "Avatar: El camino del agua",
    ficha: {
      titulo_original: "Avatar: The Way of Water",
      anio_estreno: 2022,
      directores: [
        "James Cameron"
      ],
      paises: [
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Ciencia ficción",
        "Aventura"
      ],
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
    id_pelicula: 14,
    titulo_pelicula: "El Origen",
    ficha: {
      titulo_original: "Inception",
      anio_estreno: 2010,
      directores: [
        "Christopher Nolan"
      ],
      paises: [
        "Estados Unidos",
        "Reino Unido"
      ],
      idioma_original: "Inglés",
      generos: [
        "Ciencia ficción",
        "Acción"
      ],
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
    id_pelicula: 15,
    titulo_pelicula: "Spider-Man: Un nuevo universo",
    ficha: {
      titulo_original: "Spider-Man: Into the Spider-Verse",
      anio_estreno: 2018,
      directores: [
        "Bob Persichetti",
        "Peter Ramsey",
        "Rodney Rothman"
      ],
      paises: [
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Animación",
        "Acción"
      ],
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
    id_pelicula: 16,
    titulo_pelicula: "Amélie",
    ficha: {
      titulo_original: "Le Fabuleux Destin d'Amélie Poulain",
      anio_estreno: 2001,
      directores: [
        "Jean-Pierre Jeunet"
      ],
      paises: [
        "Francia"
      ],
      idioma_original: "Francés",
      generos: [
        "Comedia romántica"
      ],
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
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 17,
    titulo_pelicula: "Pulp Fiction",
    ficha: {
      titulo_original: "Pulp Fiction",
      anio_estreno: 1994,
      directores: [
        "Quentin Tarantino"
      ],
      paises: [
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Crimen",
        "Drama"
      ],
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
    id_pelicula: 18,
    titulo_pelicula: "Gladiador",
    ficha: {
      titulo_original: "Gladiator",
      anio_estreno: 2000,
      directores: [
        "Ridley Scott"
      ],
      paises: [
        "Estados Unidos",
        "Reino Unido"
      ],
      idioma_original: "Inglés",
      generos: [
        "Acción",
        "Drama"
      ],
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
    id_pelicula: 19,
    titulo_pelicula: "Deadpool y Wolverine",
    ficha: {
      titulo_original: "Deadpool & Wolverine",
      anio_estreno: 2024,
      directores: [
        "Shawn Levy"
      ],
      paises: [
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Acción",
        "Comedia"
      ],
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
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 20,
    titulo_pelicula: "Moana 2",
    ficha: {
      titulo_original: "Moana 2",
      anio_estreno: 2024,
      directores: [
        "David G. Derrick Jr.",
        "Jason Hand",
        "Dana Ledoux Miller"
      ],
      paises: [
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Animación",
        "Aventura"
      ],
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
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 21,
    titulo_pelicula: "Top Gun: Maverick",
    ficha: {
      titulo_original: "Top Gun: Maverick",
      anio_estreno: 2022,
      directores: [
        "Joseph Kosinski"
      ],
      paises: [
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Acción",
        "Drama"
      ],
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
    id_pelicula: 22,
    titulo_pelicula: "Casablanca",
    ficha: {
      titulo_original: "Casablanca",
      anio_estreno: 1942,
      directores: [
        "Michael Curtiz"
      ],
      paises: [
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Romance",
        "Drama"
      ],
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
    id_pelicula: 23,
    titulo_pelicula: "Interestelar",
    ficha: {
      titulo_original: "Interstellar",
      anio_estreno: 2014,
      directores: [
        "Christopher Nolan"
      ],
      paises: [
        "Estados Unidos",
        "Reino Unido"
      ],
      idioma_original: "Inglés",
      generos: [
        "Ciencia ficción",
        "Drama"
      ],
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
    id_pelicula: 24,
    titulo_pelicula: "El Padrino",
    ficha: {
      titulo_original: "The Godfather",
      anio_estreno: 1972,
      directores: [
        "Francis Ford Coppola"
      ],
      paises: [
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Crimen",
        "Drama"
      ],
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
    id_pelicula: 25,
    titulo_pelicula: "Pobres criaturas",
    ficha: {
      titulo_original: "Poor Things",
      anio_estreno: 2023,
      directores: [
        "Yorgos Lanthimos"
      ],
      paises: [
        "Irlanda",
        "Reino Unido",
        "Estados Unidos"
      ],
      idioma_original: "Inglés",
      generos: [
        "Comedia dramática",
        "Ciencia ficción"
      ],
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
    id_pelicula: 26,
    titulo_pelicula: "El abrazo de la serpiente",
    ficha: {
      titulo_original: "El abrazo de la serpiente",
      anio_estreno: 2015,
      directores: [
        "Ciro Guerra"
      ],
      paises: [
        "Colombia",
        "Venezuela",
        "Argentina"
      ],
      idioma_original: "Español",
      generos: [
        "Drama",
        "Aventura"
      ],
      duracion_min: 125,
      clasificacion: "+12",
      reparto_principal: [
        {
          nombre: "Nilbio Torres",
          personaje: "Karamakate joven"
        },
        {
          nombre: "Jan Bijvoet",
          personaje: "Theodor von Martius"
        },
        {
          nombre: "Antonio Bolívar",
          personaje: "Karamakate anciano"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Original"
      }
    ],
    premios: [
      {
        nombre: "Quincena de Realizadores de Cannes",
        anio: 2015,
        categoria: "Art Cinema Award"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 27,
    titulo_pelicula: "Pájaros de verano",
    ficha: {
      titulo_original: "Pájaros de verano",
      anio_estreno: 2018,
      directores: [
        "Cristina Gallego",
        "Ciro Guerra"
      ],
      paises: [
        "Colombia",
        "Dinamarca",
        "México"
      ],
      idioma_original: "Wayuunaiki",
      generos: [
        "Crimen",
        "Drama"
      ],
      duracion_min: 125,
      clasificacion: "+15",
      reparto_principal: [
        {
          nombre: "Carmiña Martínez",
          personaje: "Úrsula"
        },
        {
          nombre: "José Acosta",
          personaje: "Rapayet"
        },
        {
          nombre: "Natalia Reyes",
          personaje: "Zaida"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Wayuunaiki",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 28,
    titulo_pelicula: "Monos",
    ficha: {
      titulo_original: "Monos",
      anio_estreno: 2019,
      directores: [
        "Alejandro Landes"
      ],
      paises: [
        "Colombia",
        "Argentina",
        "Países Bajos",
        "Alemania"
      ],
      idioma_original: "Español",
      generos: [
        "Thriller",
        "Aventura"
      ],
      duracion_min: 102,
      clasificacion: "+15",
      reparto_principal: [
        {
          nombre: "Julianne Nicholson",
          personaje: "La Doctora"
        },
        {
          nombre: "Moisés Arias",
          personaje: "Bigfoot"
        },
        {
          nombre: "Sofía Buenaventura",
          personaje: "Rambo"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Original"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 29,
    titulo_pelicula: "La estrategia del caracol",
    ficha: {
      titulo_original: "La estrategia del caracol",
      anio_estreno: 1993,
      directores: [
        "Sergio Cabrera"
      ],
      paises: [
        "Colombia"
      ],
      idioma_original: "Español",
      generos: [
        "Comedia dramática"
      ],
      duracion_min: 115,
      clasificacion: "+7",
      reparto_principal: [
        {
          nombre: "Frank Ramírez",
          personaje: "Jacinto"
        },
        {
          nombre: "Fausto Cabrera",
          personaje: "Romero"
        },
        {
          nombre: "Humberto Dorado",
          personaje: "Holguín"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Original"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 30,
    titulo_pelicula: "Rodrigo D: No futuro",
    ficha: {
      titulo_original: "Rodrigo D: No futuro",
      anio_estreno: 1990,
      directores: [
        "Víctor Gaviria"
      ],
      paises: [
        "Colombia"
      ],
      idioma_original: "Español",
      generos: [
        "Drama"
      ],
      duracion_min: 93,
      clasificacion: "+15",
      reparto_principal: [
        {
          nombre: "Ramiro Meneses",
          personaje: "Rodrigo"
        },
        {
          nombre: "Carlos Mario Restrepo",
          personaje: "Ricardo"
        },
        {
          nombre: "Jaime Osorio Gómez",
          personaje: "Emilio"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Original"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 31,
    titulo_pelicula: "La vendedora de rosas",
    ficha: {
      titulo_original: "La vendedora de rosas",
      anio_estreno: 1998,
      directores: [
        "Víctor Gaviria"
      ],
      paises: [
        "Colombia"
      ],
      idioma_original: "Español",
      generos: [
        "Drama"
      ],
      duracion_min: 110,
      clasificacion: "+12",
      reparto_principal: [
        {
          nombre: "Lady Tabares",
          personaje: "Mónica"
        },
        {
          nombre: "Leidy Tabares",
          personaje: "Andrea"
        },
        {
          nombre: "Giovanni Quiroz",
          personaje: "Anderson"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Original"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 32,
    titulo_pelicula: "Roma",
    ficha: {
      titulo_original: "Roma",
      anio_estreno: 2018,
      directores: [
        "Alfonso Cuarón"
      ],
      paises: [
        "México",
        "Estados Unidos"
      ],
      idioma_original: "Español",
      generos: [
        "Drama"
      ],
      duracion_min: 135,
      clasificacion: "+15",
      reparto_principal: [
        {
          nombre: "Yalitza Aparicio",
          personaje: "Cleo"
        },
        {
          nombre: "Marina de Tavira",
          personaje: "Sofía"
        },
        {
          nombre: "Diego Cortina Autrey",
          personaje: "Toño"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Original"
      },
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "VIP",
        tipo_version: "Original"
      }
    ],
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2019,
        categoria: "Mejor director"
      },
      {
        nombre: "Premio Óscar",
        anio: 2019,
        categoria: "Mejor fotografía"
      },
      {
        nombre: "Premio Óscar",
        anio: 2019,
        categoria: "Mejor película en lengua extranjera"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 33,
    titulo_pelicula: "Amores perros",
    ficha: {
      titulo_original: "Amores perros",
      anio_estreno: 2000,
      directores: [
        "Alejandro González Iñárritu"
      ],
      paises: [
        "México"
      ],
      idioma_original: "Español",
      generos: [
        "Drama"
      ],
      duracion_min: 154,
      clasificacion: "+18",
      reparto_principal: [
        {
          nombre: "Emilio Echevarría",
          personaje: "El Chivo"
        },
        {
          nombre: "Gael García Bernal",
          personaje: "Octavio"
        },
        {
          nombre: "Goya Toledo",
          personaje: "Valeria"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Original"
      }
    ],
    premios: [
      {
        nombre: "Semana de la Crítica de Cannes",
        anio: 2000,
        categoria: "Gran Premio"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 34,
    titulo_pelicula: "Ciudad de Dios",
    ficha: {
      titulo_original: "Cidade de Deus",
      anio_estreno: 2002,
      directores: [
        "Fernando Meirelles",
        "Kátia Lund"
      ],
      paises: [
        "Brasil"
      ],
      idioma_original: "Portugués",
      generos: [
        "Crimen",
        "Drama"
      ],
      duracion_min: 130,
      clasificacion: "+18",
      reparto_principal: [
        {
          nombre: "Alexandre Rodrigues",
          personaje: "Buscapé"
        },
        {
          nombre: "Leandro Firmino",
          personaje: "Zé Pequeño"
        },
        {
          nombre: "Matheus Nachtergaele",
          personaje: "Sandro Cenoura"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Portugués",
        subtitulos: "Español",
        formato: "2D",
        tipo_version: "Subtitulada"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 35,
    titulo_pelicula: "El secreto de sus ojos",
    ficha: {
      titulo_original: "El secreto de sus ojos",
      anio_estreno: 2009,
      directores: [
        "Juan José Campanella"
      ],
      paises: [
        "Argentina",
        "España"
      ],
      idioma_original: "Español",
      generos: [
        "Thriller",
        "Drama"
      ],
      duracion_min: 129,
      clasificacion: "+15",
      reparto_principal: [
        {
          nombre: "Ricardo Darín",
          personaje: "Benjamín Espósito"
        },
        {
          nombre: "Soledad Villamil",
          personaje: "Irene Menéndez Hastings"
        },
        {
          nombre: "Guillermo Francella",
          personaje: "Pablo Sandoval"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Original"
      }
    ],
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2010,
        categoria: "Mejor película en lengua extranjera"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 36,
    titulo_pelicula: "Relatos salvajes",
    ficha: {
      titulo_original: "Relatos salvajes",
      anio_estreno: 2014,
      directores: [
        "Damián Szifron"
      ],
      paises: [
        "Argentina",
        "España"
      ],
      idioma_original: "Español",
      generos: [
        "Comedia",
        "Thriller"
      ],
      duracion_min: 122,
      clasificacion: "+15",
      reparto_principal: [
        {
          nombre: "Ricardo Darín",
          personaje: "Simón Fischer"
        },
        {
          nombre: "Érica Rivas",
          personaje: "Romina"
        },
        {
          nombre: "Rita Cortese",
          personaje: "Cocinera"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Original"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  },
  {
    id_pelicula: 37,
    titulo_pelicula: "Una mujer fantástica",
    ficha: {
      titulo_original: "Una mujer fantástica",
      anio_estreno: 2017,
      directores: [
        "Sebastián Lelio"
      ],
      paises: [
        "Chile",
        "Alemania",
        "España",
        "Estados Unidos"
      ],
      idioma_original: "Español",
      generos: [
        "Drama"
      ],
      duracion_min: 104,
      clasificacion: "+12",
      reparto_principal: [
        {
          nombre: "Daniela Vega",
          personaje: "Marina Vidal"
        },
        {
          nombre: "Francisco Reyes",
          personaje: "Orlando"
        },
        {
          nombre: "Luis Gnecco",
          personaje: "Gabo"
        }
      ]
    },
    versiones: [
      {
        idioma_audio: "Español",
        subtitulos: "Ninguno",
        formato: "2D",
        tipo_version: "Original"
      }
    ],
    premios: [
      {
        nombre: "Premio Óscar",
        anio: 2018,
        categoria: "Mejor película en lengua extranjera"
      }
    ],
    actualizado_en: ISODate("2026-11-09T12:00:00-05:00")
  }
]);

db.fichas_tecnicas_peliculas.countDocuments();
