import sys
from datetime import date, timedelta
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parents[4]))

from tn import metricas as metricas_mod
from tn import scripts as scripts_mod
from tn import seo as seo_mod
from tn.tiendas import cargar_tiendas, tienda as make_client


def list_tiendas() -> list[str]:
    return list(cargar_tiendas().keys())


def _extract_variables(product: dict) -> dict:
    def multilang(field):
        v = product.get(field, {}) or {}
        return v.get("es") or v.get("pt") or next(iter(v.values()), "") if v else ""

    images = product.get("images") or []
    imagen = images[0]["src"] if images else ""

    variantes = []
    for variant in product.get("variants") or []:
        for val in variant.get("values") or []:
            text = val.get("es") or val.get("pt") or ""
            if text and text not in variantes:
                variantes.append(text)

    categorias = [
        (cat.get("name") or {}).get("es") or ""
        for cat in product.get("categories") or []
    ]

    return {
        "nombre": multilang("name"),
        "descripcion": multilang("description"),
        "precio": product.get("price") or "",
        "precio_promo": product.get("promotional_price") or "",
        "imagen": imagen,
        "variantes": variantes,
        "categorias": [c for c in categorias if c],
    }


def list_productos(nombre_tienda: str, q: str = "") -> list[dict]:
    client = make_client(nombre_tienda)
    params = {"q": q} if q else {}
    prods = client.get_all("products", params or None)
    return [
        {
            "id": p["id"],
            "nombre": (_extract_variables(p))["nombre"],
            "precio": p.get("price") or "",
            "imagen": (_extract_variables(p))["imagen"],
        }
        for p in prods
    ]


def get_producto(nombre_tienda: str, producto_id: int) -> dict:
    client = make_client(nombre_tienda)
    product = client.get(f"products/{producto_id}")
    return {**product, "variables": _extract_variables(product)}


def list_categorias(nombre_tienda: str) -> list[dict]:
    client = make_client(nombre_tienda)
    cats = client.get_all("categories")
    return [
        {"id": c["id"], "nombre": (c.get("name") or {}).get("es") or ""}
        for c in cats
    ]


def get_metricas(nombre_tienda: str, dias: int = 30) -> dict:
    client = make_client(nombre_tienda)
    desde = (date.today() - timedelta(days=dias)).isoformat()
    resumen = metricas_mod.resumen_ventana(client, desde)
    serie = metricas_mod.serie_temporal(client, desde)
    return {**resumen, "serie_temporal": serie, "dias": dias}


def get_salud_tienda(nombre_tienda: str) -> dict:
    client = make_client(nombre_tienda)
    seo_data = seo_mod.auditar_seo_catalogo(client)
    scripts_activos = scripts_mod.listar(client)

    total = len(seo_data)
    sin_desc = sum(1 for p in seo_data if p["sin_descripcion"])
    sin_seo = sum(1 for p in seo_data if p["sin_seo_title"])
    pct_catalogo = round((total - sin_desc) / total * 100, 1) if total else 0
    pct_seo = round((total - sin_seo) / total * 100, 1) if total else 0

    return {
        "score": round(pct_catalogo * 0.6 + pct_seo * 0.4, 1),
        "total_productos": total,
        "sin_descripcion": sin_desc,
        "sin_seo_title": sin_seo,
        "scripts_activos": len(scripts_activos),
        "catalogo_completo_pct": pct_catalogo,
        "seo_completo_pct": pct_seo,
    }


def borrar_script(nombre_tienda: str, script_id: int) -> bool:
    client = make_client(nombre_tienda)
    return scripts_mod.borrar(client, script_id)
