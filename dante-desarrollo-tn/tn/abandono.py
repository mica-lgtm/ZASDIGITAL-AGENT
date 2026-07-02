def listar_checkouts(client, desde=None, hasta=None):
    """Checkouts iniciados y no completados (carritos abandonados)."""
    params = {}
    if desde:
        params["created_at_min"] = desde
    if hasta:
        params["created_at_max"] = hasta
    return client.get_all("checkouts", params or None)


def resumen_abandono(client, desde, hasta=None):
    """Tasa de abandono checkout→compra. Proxy lower-funnel:
    TN no expone page views, así que no es CVR de sesiones."""
    abandonados = listar_checkouts(client, desde, hasta)
    params = {"created_at_min": desde}
    if hasta:
        params["created_at_max"] = hasta
    completadas = client.get_all("orders", params)
    total = len(abandonados) + len(completadas)
    return {
        "checkouts_abandonados": len(abandonados),
        "ordenes_completadas": len(completadas),
        "tasa_abandono_pct": round(len(abandonados) / total * 100, 1) if total else 0,
    }


def productos_mas_abandonados(client, desde, hasta=None, top_n=10):
    """Productos que más aparecen en carritos abandonados: prioridad CRO."""
    conteo = {}
    for checkout in listar_checkouts(client, desde, hasta):
        for item in checkout.get("products") or []:
            pid = item.get("product_id")
            if pid is None:
                continue
            entrada = conteo.setdefault(pid, {"nombre": item.get("name"), "veces": 0})
            entrada["veces"] += int(item.get("quantity") or 1)
    top = sorted(conteo.items(), key=lambda kv: kv[1]["veces"], reverse=True)[:top_n]
    return [{"product_id": pid, **datos} for pid, datos in top]


def valor_abandonado(client, desde, hasta=None):
    """ARG$ totales en carritos abandonados de la ventana."""
    total = sum(
        float(c.get("total") or 0) for c in listar_checkouts(client, desde, hasta)
    )
    return round(total, 2)
