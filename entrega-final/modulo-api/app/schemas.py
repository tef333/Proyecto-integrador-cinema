"""Modelos Pydantic de entrada. Los rechazos de validacion se traducen a HTTP 422."""
from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator


class CompraIn(BaseModel):
    id_funcion: int = Field(ge=1)
    id_espectador: int = Field(ge=1)
    id_tipo_boleta: int = Field(ge=1)
    ids_asiento: list[int] = Field(min_length=1, max_length=10, description="una silla por boleta")
    canal_venta: Literal["Taquilla", "Online"]
    metodo_pago: Literal["Efectivo", "Tarjeta", "Transferencia"]
    id_staff: Optional[int] = Field(default=None, ge=1)
    idempotency_key: str = Field(min_length=8, max_length=64,
                                 description="una clave por intento de compra; repetirla no duplica la venta")

    @model_validator(mode="after")
    def reglas_cruzadas(self):
        if any(a < 1 for a in self.ids_asiento):
            raise ValueError("ids_asiento debe contener enteros positivos")
        if len(set(self.ids_asiento)) != len(self.ids_asiento):
            raise ValueError("ids_asiento no puede repetir sillas")
        if self.canal_venta == "Online" and self.id_staff is not None:
            raise ValueError("las ventas Online no llevan id_staff")
        if self.canal_venta == "Taquilla" and self.id_staff is None:
            raise ValueError("las ventas de Taquilla requieren id_staff")
        if self.canal_venta == "Online" and self.metodo_pago == "Efectivo":
            raise ValueError("el efectivo solo aplica en taquilla")
        return self
