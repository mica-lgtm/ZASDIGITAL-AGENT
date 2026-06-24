from tn.client import TiendaNubeClient
from tn import snapshot


def c():
    return TiendaNubeClient(store_id="123", token="tok")


def test_snapshot_junta_info_y_productos(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/store", json={"id": 123, "name": "Piloto"}
    )
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/products",
        json=[{"id": 1, "name": "P1"}],
    )
    snap = snapshot.snapshot_tienda(c())
    assert snap["info"]["name"] == "Piloto"
    assert snap["productos"][0]["name"] == "P1"
    assert snap["total_productos"] == 1
