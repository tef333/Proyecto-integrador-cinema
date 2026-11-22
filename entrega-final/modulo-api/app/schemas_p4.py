"""Modelos de entrada de resenas e incidentes (P4).

Reparto de validaciones (dos lineas de defensa):
  - Pydantic revisa la FORMA: campos obligatorios, tipos y que venga el detalle que corresponde al tipo.
  - El $jsonSchema de MongoDB revisa los RANGOS y valores permitidos (calificacion 1-5, enums, minimos).
    Si lo incumple, MongoDB responde con error 121 y la API lo traduce a HTTP 422 (ver errores.py).
"""
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, StrictBool, StrictInt, StrictStr, model_validator


class AspectosIn(BaseModel):
    imagen: Optional[StrictInt] = None
    sonido: Optional[StrictInt] = None
    comodidad: Optional[StrictInt] = None
    servicio: Optional[StrictInt] = None


class ResenaIn(BaseModel):
    id_funcion: StrictInt = Field(ge=1)
    id_espectador: StrictInt = Field(ge=1)
    calificacion: StrictInt
    comentario: StrictStr
    recomendaria: Optional[StrictBool] = None
    etiquetas: Optional[list[StrictStr]] = None
    aspectos: Optional[AspectosIn] = None


class DetalleFallaIn(BaseModel):
    equipo: StrictStr
    codigo_error: StrictStr
    minutos_interrupcion: StrictInt
    funcion_cancelada: StrictBool


class CompensacionIn(BaseModel):
    tipo: StrictStr
    valor: float


class DetalleQuejaIn(BaseModel):
    id_espectador: StrictInt = Field(ge=1)
    categoria: StrictStr
    canal: StrictStr
    compensacion: Optional[CompensacionIn] = None


class DetalleSeguridadIn(BaseModel):
    tipo_evento: StrictStr
    zona: StrictStr
    personas_involucradas: StrictInt
    se_llamo_autoridad: StrictBool
    autoridad: Optional[StrictStr] = None


class IncidenteIn(BaseModel):
    tipo: Literal["falla_tecnica", "queja_servicio", "incidente_seguridad"]
    severidad: StrictStr
    descripcion: StrictStr
    id_staff: StrictInt = Field(ge=1, description="quien reporta; el cargo se toma de PostgreSQL")
    id_sala: Optional[StrictInt] = Field(default=None, ge=1)
    id_funcion: Optional[StrictInt] = Field(default=None, ge=1)
    fecha_hora: Optional[datetime] = Field(default=None, description="por defecto, ahora")
    detalle_falla_tecnica: Optional[DetalleFallaIn] = None
    detalle_queja: Optional[DetalleQuejaIn] = None
    detalle_seguridad: Optional[DetalleSeguridadIn] = None

    @model_validator(mode="after")
    def detalle_segun_tipo(self):
        campo = {"falla_tecnica": "detalle_falla_tecnica", "queja_servicio": "detalle_queja",
                 "incidente_seguridad": "detalle_seguridad"}
        for t, c in campo.items():
            presente = getattr(self, c) is not None
            if t == self.tipo and not presente:
                raise ValueError(f"un incidente de tipo {t} requiere {c}")
            if t != self.tipo and presente:
                raise ValueError(f"{c} no corresponde a un incidente de tipo {self.tipo}")
        return self
