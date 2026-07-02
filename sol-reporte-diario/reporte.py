"""Agregación diaria: recorre marca x canal activo, normaliza y calcula
rollups. Una falla de un canal para una marca no debe tumbar el resto del
reporte -- por eso cada llamada va en su propio try/except."""

from canales import (
    google_ads,
    meli_ads,
    meta_ads,
    meta_organico,
    perfit,
    pinterest_ads,
    tienda_nube,
    tiktok_ads,
)

CANALES = {
    "meta_ads": meta_ads.stats_dia,
    "google_ads": google_ads.stats_dia,
    "tiktok_ads": tiktok_ads.stats_dia,
    "pinterest_ads": pinterest_ads.stats_dia,
    "meli_ads": meli_ads.stats_dia,
    "perfit": perfit.stats_dia,
    "meta_organico": meta_organico.stats_dia,
    "tienda_nube": tienda_nube.stats_dia,
}


def generar_reporte(fecha, roster, canales=None):
    """`canales`, si se pasa, limita el run a esa lista (ej. mientras se prueba
    un canal nuevo de a uno). Por default corre todo lo que el roster marque
    activo para cada marca."""
    permitidos = set(canales) if canales else None
    filas = []
    errores = []

    for cliente in roster:
        for canal in cliente["canales_activos"]:
            if permitidos is not None and canal not in permitidos:
                continue
            fn = CANALES.get(canal)
            if fn is None:
                errores.append({"marca": cliente["marca"], "canal": canal, "error": "canal desconocido"})
                continue
            try:
                filas.append(fn(cliente["marca"], fecha))
            except Exception as exc:  # cualquier canal puede fallar por su cuenta
                errores.append({"marca": cliente["marca"], "canal": canal, "error": str(exc)})

    rollups_por_marca = _rollups_por_marca(filas)
    return {
        "fecha": fecha,
        "filas": filas,
        "rollups_por_marca": rollups_por_marca,
        "rollup_total": _rollup(rollups_por_marca.values()),
        "errores": errores,
    }


def _rollups_por_marca(filas):
    rollups = {}
    for fila in filas:
        r = rollups.setdefault(fila["marca"], {"spend": 0.0, "ingresos": 0.0, "conversiones": 0})
        r["spend"] += fila.get("spend") or 0
        r["ingresos"] += fila.get("ingresos") or 0
        r["conversiones"] += fila.get("conversiones") or 0
    for r in rollups.values():
        r["roas"] = round(r["ingresos"] / r["spend"], 2) if r["spend"] else None
    return rollups


def _rollup(rollups_por_marca):
    total = {"spend": 0.0, "ingresos": 0.0, "conversiones": 0}
    for r in rollups_por_marca:
        total["spend"] += r["spend"]
        total["ingresos"] += r["ingresos"]
        total["conversiones"] += r["conversiones"]
    total["roas"] = round(total["ingresos"] / total["spend"], 2) if total["spend"] else None
    return total
