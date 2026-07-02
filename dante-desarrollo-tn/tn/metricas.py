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


def rendimiento_por_producto(client, desde, hasta=None, top_n=10):
    """Top productos por revenue real de la ventana (no por catálogo)."""
    acumulado = {}
    for o in ordenes(client, desde, hasta):
        vistos_en_orden = set()
        for item in o.get("products") or []:
            pid = item.get("product_id")
            if pid is None:
                continue
            entrada = acumulado.setdefault(
                pid, {"nombre": item.get("name"), "unidades": 0, "revenue": 0.0, "num_ordenes": 0}
            )
            cantidad = int(item.get("quantity") or 1)
            entrada["unidades"] += cantidad
            entrada["revenue"] += float(item.get("price") or 0) * cantidad
            if pid not in vistos_en_orden:
                entrada["num_ordenes"] += 1
                vistos_en_orden.add(pid)
    top = sorted(acumulado.items(), key=lambda kv: kv[1]["revenue"], reverse=True)[:top_n]
    return [
        {"product_id": pid, **datos, "revenue": round(datos["revenue"], 2)}
        for pid, datos in top
    ]


def _delta_pct(antes, despues):
    if not antes:
        return None
    return round((despues - antes) / antes * 100, 1)


def comparar_ventanas(client, desde1, hasta1, desde2, hasta2):
    """Antes/después de un experimento. Deltas en %, None si el antes es 0."""
    antes = resumen_ventana(client, desde1, hasta1)
    despues = resumen_ventana(client, desde2, hasta2)
    return {
        "antes": antes,
        "despues": despues,
        "delta_pedidos_pct": _delta_pct(antes["pedidos"], despues["pedidos"]),
        "delta_ingresos_pct": _delta_pct(antes["ingresos"], despues["ingresos"]),
        "delta_aov_pct": _delta_pct(antes["aov"], despues["aov"]),
    }


def serie_temporal(client, desde, hasta=None, agrupacion="dia"):
    """Serie de {fecha, pedidos, ingresos} agrupada por día (o semana ISO)."""
    por_fecha = {}
    for o in ordenes(client, desde, hasta):
        creado = (o.get("created_at") or "")[:10]
        if not creado:
            continue
        if agrupacion == "semana":
            import datetime as _dt
            iso = _dt.date.fromisoformat(creado).isocalendar()
            clave = f"{iso[0]}-W{iso[1]:02d}"
        else:
            clave = creado
        punto = por_fecha.setdefault(clave, {"pedidos": 0, "ingresos": 0.0})
        punto["pedidos"] += 1
        punto["ingresos"] += float(o.get("total") or 0)
    return [
        {"fecha": fecha, "pedidos": v["pedidos"], "ingresos": round(v["ingresos"], 2)}
        for fecha, v in sorted(por_fecha.items())
    ]
