def listar(client, **params):
    return client.get_all("coupons", params or None)


def obtener(client, coupon_id):
    return client.get(f"coupons/{coupon_id}")


def crear(client, codigo, tipo, valor, max_usos=None, valido_hasta=None, min_precio=None):
    """Crea un cupón. tipo: 'percentage' | 'absolute'.

    Para atribución de experimentos, un cupón de 0% sirve como tracker
    de brazo sin alterar el precio.
    """
    data = {"code": codigo, "type": tipo, "value": str(valor)}
    if max_usos is not None:
        data["max_uses"] = max_usos
    if valido_hasta:
        data["end_date"] = valido_hasta
    if min_precio is not None:
        data["min_price"] = min_precio
    return client.post("coupons", data)


def actualizar(client, coupon_id, data):
    return client.put(f"coupons/{coupon_id}", data)


def borrar(client, coupon_id):
    return client.delete(f"coupons/{coupon_id}")


def uso_por_cupon(client, codigo, desde=None, hasta=None):
    """Órdenes que usaron un código de cupón. Mecanismo de atribución de experimentos."""
    params = {}
    if desde:
        params["created_at_min"] = desde
    if hasta:
        params["created_at_max"] = hasta
    ordenes = client.get_all("orders", params or None)
    con_cupon = [
        o for o in ordenes
        if any(c.get("code") == codigo for c in (o.get("coupon") or []))
    ]
    return {"codigo": codigo, "ordenes": len(con_cupon), "detalle": con_cupon}
