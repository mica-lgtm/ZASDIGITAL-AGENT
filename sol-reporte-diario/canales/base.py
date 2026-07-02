CAMPOS = ["spend", "impresiones", "clics", "ctr", "conversiones", "ingresos", "cpa", "roas"]
COLUMNAS = ["fecha", "marca", "canal"] + CAMPOS


def fila(canal, marca, fecha, **valores):
    """Shape normalizado que devuelven todos los canales. Los campos que no
    aplican a un canal quedan en None en vez de omitirse, para que reporte.py
    y sheets.py trabajen siempre con el mismo set de columnas."""
    base = {"canal": canal, "marca": marca, "fecha": fecha}
    base.update({campo: None for campo in CAMPOS})
    base.update(valores)
    return base
