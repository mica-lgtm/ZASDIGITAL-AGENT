from tn.client import TiendaNubeClient
from tn import productos


def c():
    return TiendaNubeClient(store_id="123", token="tok")


def test_listar_productos(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/products", json=[{"id": 1}, {"id": 2}]
    )
    assert len(productos.listar(c())) == 2


def test_obtener_producto(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/products/9", json={"id": 9}
    )
    assert productos.obtener(c(), 9)["id"] == 9


def test_actualizar_producto(requests_mock):
    requests_mock.put(
        "https://api.tiendanube.com/v1/123/products/9", json={"id": 9, "name": "Nuevo"}
    )
    assert productos.actualizar(c(), 9, {"name": "Nuevo"})["name"] == "Nuevo"
