"""Crea (si no existe) la coleccion comprobantes_venta en MongoDB.

Es la coleccion que recibe el registro asociado a cada venta de PostgreSQL en
la transaccion cruzada. Tiene $jsonSchema como las otras cuatro colecciones y un
indice UNICO sobre id_venta: una venta de PostgreSQL solo puede tener un
comprobante (evita duplicados si la operacion se reintenta).

Uso:  python preparar_mongo.py
Se puede ejecutar varias veces: si la coleccion ya existe no la toca.
"""
from db import conectar_mongo

ESQUEMA = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": [
            "id_venta", "id_funcion", "id_pelicula", "id_sala", "id_espectador",
            "id_tipo_boleta", "canal_venta", "metodo_pago", "cantidad",
            "precio_unitario", "total", "estado", "fecha_venta", "creado_en",
        ],
        "properties": {
            "id_venta": {"bsonType": ["int", "long"], "minimum": 1,
                         "description": "id_venta de PostgreSQL (identificador compartido)"},
            "id_funcion": {"bsonType": ["int", "long"], "minimum": 1},
            "id_pelicula": {"bsonType": ["int", "long"], "minimum": 1},
            "id_sala": {"bsonType": ["int", "long"], "minimum": 1},
            "id_espectador": {"bsonType": ["int", "long"], "minimum": 1},
            "id_tipo_boleta": {"bsonType": ["int", "long"], "minimum": 1},
            "id_staff": {"bsonType": ["int", "long", "null"],
                         "description": "null cuando la venta es Online"},
            "canal_venta": {"enum": ["Taquilla", "Online"]},
            "metodo_pago": {"enum": ["Efectivo", "Tarjeta", "Transferencia"]},
            "cantidad": {"bsonType": ["int", "long"], "minimum": 1, "maximum": 10},
            "precio_unitario": {"bsonType": "decimal"},
            "total": {"bsonType": "decimal"},
            "estado": {"enum": ["emitido", "anulado"]},
            "titulo_pelicula": {"bsonType": "string"},
            "nombre_sala": {"bsonType": "string"},
            "fecha_hora_funcion": {"bsonType": "date"},
            "fecha_venta": {"bsonType": "date"},
            "creado_en": {"bsonType": "date"},
            "origen": {"bsonType": "string"},
            # Opcionales (migracion final): no estan en 'required', asi que los
            # comprobantes anteriores siguen siendo validos.
            "ids_asiento": {"bsonType": "array", "minItems": 1, "maxItems": 10,
                            "items": {"bsonType": ["int", "long"], "minimum": 1},
                            "description": "sillas de las boletas de la venta"},
            "idempotency_key": {"bsonType": "string", "minLength": 8, "maxLength": 64},
        },
    }
}


def main():
    cliente, base = conectar_mongo()
    try:
        if "comprobantes_venta" not in base.list_collection_names():
            base.create_collection("comprobantes_venta", validator=ESQUEMA,
                                   validationLevel="strict", validationAction="error")
            print("Coleccion comprobantes_venta creada con $jsonSchema")
        else:
            print("La coleccion comprobantes_venta ya existe; no se modifica")
        base.comprobantes_venta.create_index("id_venta", unique=True, name="uq_comprobantes_id_venta")
        base.comprobantes_venta.create_index([("id_funcion", 1), ("fecha_venta", -1)],
                                             name="idx_comprobantes_funcion_fecha")
        print("Indices listos")
    finally:
        cliente.close()


if __name__ == "__main__":
    main()
