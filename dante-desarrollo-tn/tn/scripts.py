def registrar(client, src, event="onload", where="store"):
    """Da de alta un JS externo en el storefront/checkout.

    src: URL pública del .js (host estático).
    where: 'store' | 'checkout' | 'product' | ...
    """
    return client.post("scripts", {"src": src, "event": event, "where": where})


def listar(client):
    return client.get_all("scripts")


def borrar(client, script_id):
    return client.delete(f"scripts/{script_id}")
