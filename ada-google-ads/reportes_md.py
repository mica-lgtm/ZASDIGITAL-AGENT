"""Escribe los reportes markdown de cada rutina en `reportes/`. Un archivo
por corrida (fecha) -- el registro de auditoría detallado que complementa el
resumen ejecutivo de WhatsApp. Volver a correr la misma rutina con la misma
fecha sobreescribe el archivo de esa fecha (útil para pruebas), no acumula
versiones duplicadas."""

import os

_BASE = os.path.dirname(__file__)


def _escribir(ruta_relativa, contenido):
    ruta = os.path.join(_BASE, ruta_relativa)
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    with open(ruta, "w", encoding="utf-8") as f:
        f.write(contenido)
    return ruta


def escribir_reporte_manana(fecha, contenido):
    return _escribir(os.path.join("reportes", "diario", "manana", f"{fecha}.md"), contenido)


def escribir_reporte_tarde(fecha, contenido):
    return _escribir(os.path.join("reportes", "diario", "tarde", f"{fecha}.md"), contenido)


def escribir_reporte_semanal(fecha, contenido):
    return _escribir(os.path.join("reportes", "semanal", f"{fecha}.md"), contenido)
