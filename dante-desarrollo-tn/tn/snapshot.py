from datetime import date, timedelta

from tn import metricas, productos, scripts


def snapshot_tienda(client):
    """Estado real de la tienda vía API. Fuente de verdad para no inventar datos."""
    info = client.get("store")
    prods = productos.listar(client)
    return {
        "info": info,
        "productos": prods,
        "total_productos": len(prods),
    }


def _texto(valor):
    if isinstance(valor, dict):
        return next((v for v in valor.values() if v), "")
    return valor or ""


def _calidad_catalogo(prods):
    sin_descripcion = sum(1 for p in prods if not _texto(p.get("description")).strip())
    sin_imagen = sum(1 for p in prods if not p.get("images"))
    sin_precio_promo = sum(
        1 for p in prods
        if not any(v.get("promotional_price") for v in p.get("variants") or [])
    )
    total = len(prods)
    completos = sum(
        1 for p in prods
        if _texto(p.get("description")).strip() and p.get("images")
    )
    return {
        "sin_descripcion": sin_descripcion,
        "sin_imagen": sin_imagen,
        "sin_precio_promo": sin_precio_promo,
        "pct_completos": round(completos / total * 100, 1) if total else 0,
    }


def snapshot_completo(client, ventana_dias=30):
    """snapshot_tienda + scripts activos + métricas recientes + calidad de catálogo."""
    base = snapshot_tienda(client)
    desde = (date.today() - timedelta(days=ventana_dias)).isoformat()
    return {
        **base,
        "scripts_activos": scripts.listar(client),
        "metricas_recientes": metricas.resumen_ventana(client, desde),
        "calidad_catalogo": _calidad_catalogo(base["productos"]),
    }
