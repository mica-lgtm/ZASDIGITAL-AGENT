def listar(client, **params):
    return client.get_all("products", params or None)


def obtener(client, producto_id):
    return client.get(f"products/{producto_id}")


def actualizar(client, producto_id, data):
    return client.put(f"products/{producto_id}", data)
