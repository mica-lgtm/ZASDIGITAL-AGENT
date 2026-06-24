from tn import productos


def snapshot_tienda(client):
    """Estado real de la tienda vía API. Fuente de verdad para no inventar datos."""
    info = client.get("store")
    prods = productos.listar(client)
    return {
        "info": info,
        "productos": prods,
        "total_productos": len(prods),
    }
