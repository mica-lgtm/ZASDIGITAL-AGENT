def listar(client, **params):
    return client.get_all("customers", params or None)


def obtener(client, customer_id):
    return client.get(f"customers/{customer_id}")


def buscar(client, q):
    return client.get_all("customers", {"q": q})


def ordenes_de_cliente(client, customer_id):
    return client.get_all("orders", {"customer_ids": customer_id})


def resumen_clientes(client, desde=None):
    """Agregados de la base de clientes: recompra y top LTV.

    Recorre clientes y órdenes completas; puede ser lento en tiendas grandes.
    """
    params = {"created_at_min": desde} if desde else None
    clientes = client.get_all("customers", params)
    ordenes = client.get_all("orders", params)

    por_cliente = {}
    for o in ordenes:
        cid = (o.get("customer") or {}).get("id")
        if cid is None:
            continue
        acumulado = por_cliente.setdefault(cid, {"ordenes": 0, "ltv": 0.0})
        acumulado["ordenes"] += 1
        acumulado["ltv"] += float(o.get("total") or 0)

    recompradores = sum(1 for v in por_cliente.values() if v["ordenes"] > 1)
    con_compra = len(por_cliente)
    top = sorted(por_cliente.items(), key=lambda kv: kv[1]["ltv"], reverse=True)[:10]

    return {
        "total_clientes": len(clientes),
        "clientes_con_compra": con_compra,
        "tasa_recompra_pct": round(recompradores / con_compra * 100, 1) if con_compra else 0,
        "top_ltv": [
            {"customer_id": cid, "ordenes": v["ordenes"], "ltv": round(v["ltv"], 2)}
            for cid, v in top
        ],
    }
