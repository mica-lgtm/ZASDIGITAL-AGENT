"""Lee de la planilla maestra qué marca tiene qué canal activo. La planilla
es la fuente de verdad — nada de esto se duplica en un config del repo."""

import unicodedata

import sheets

CANALES_CONOCIDOS = [
    "meta_ads",
    "google_ads",
    "tiktok_ads",
    "pinterest_ads",
    "meli_ads",
    "perfit",
    "meta_organico",
    "tienda_nube",
]


def normalizar_marca(nombre):
    """'Mini Ánima' -> 'mini_anima', para usar como clave de .env (SOL_MINI_ANIMA_...)
    y para calzar con el slug que usa dante-desarrollo-tn (DANTE_<MARCA>_...)."""
    sin_acentos = unicodedata.normalize("NFKD", nombre).encode("ascii", "ignore").decode()
    return sin_acentos.strip().lower().replace(" ", "_").replace("-", "_")


def leer_roster(planilla, hoja="Roster"):
    filas = sheets.leer_filas(planilla, hoja)
    roster = []
    for fila in filas:
        marca_original = (fila.get("marca") or fila.get("Marca") or "").strip()
        if not marca_original:
            continue
        canales_activos = [
            canal for canal in CANALES_CONOCIDOS if str(fila.get(canal, "")).strip()
        ]
        roster.append({
            "marca": normalizar_marca(marca_original),
            "marca_original": marca_original,
            "canales_activos": canales_activos,
        })
    return roster
