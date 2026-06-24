def ordenes(client, desde, hasta=None, status=None):
    params = {"created_at_min": desde}
    if hasta:
        params["created_at_max"] = hasta
    if status:
        params["status"] = status
    return client.get_all("orders", params)


def resumen_ventana(client, desde, hasta=None, status=None):
    pedidos = ordenes(client, desde, hasta, status)
    ingresos = sum(float(o.get("total") or 0) for o in pedidos)
    n = len(pedidos)
    return {
        "pedidos": n,
        "ingresos": round(ingresos, 2),
        "aov": round(ingresos / n, 2) if n else 0,
    }
