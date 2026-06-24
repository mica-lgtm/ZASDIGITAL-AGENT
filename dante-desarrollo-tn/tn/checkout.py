def cart_permalink(store_url, items):
    """Arma una URL que pre-carga el carrito y cae en el checkout nativo.

    items: lista de (variant_id, cantidad). El primero define el permalink base;
    el resto se agrega vía query `add_to_cart=variant:qty`.
    """
    if not items:
        raise ValueError("items no puede estar vacío")
    base = store_url.rstrip("/")
    primer_id, _ = items[0]
    url = f"{base}/comprar/{primer_id}"
    extras = [f"add_to_cart={vid}:{qty}" for vid, qty in items[1:]]
    if extras:
        url += "?" + "&".join(extras)
    return url


def draft_order(client, items, customer=None):
    """Crea una orden borrador y devuelve la respuesta (incluye checkout_url)."""
    payload = {
        "products": [{"variant_id": vid, "quantity": qty} for vid, qty in items]
    }
    if customer:
        payload["customer"] = customer
    return client.post("draft_orders", payload)
