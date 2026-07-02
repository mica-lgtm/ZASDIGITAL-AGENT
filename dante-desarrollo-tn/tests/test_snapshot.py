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


def test_snapshot_completo_agrega_contexto(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/store", json={"id": 123, "name": "Piloto"}
    )
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/products",
        json=[
            {
                "id": 1,
                "description": {"es": "<p>Descripción completa</p>"},
                "images": [{"id": 1}],
                "variants": [{"promotional_price": "900.00"}],
            },
            {
                "id": 2,
                "description": {"es": ""},
                "images": [],
                "variants": [{"promotional_price": None}],
            },
        ],
    )
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/scripts", json=[{"id": 55}]
    )
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/orders",
        json=[{"id": 1, "total": "100.00"}],
    )
    snap = snapshot.snapshot_completo(c())
    assert snap["total_productos"] == 2
    assert snap["scripts_activos"][0]["id"] == 55
    assert snap["metricas_recientes"]["pedidos"] == 1
    assert snap["calidad_catalogo"] == {
        "sin_descripcion": 1,
        "sin_imagen": 1,
        "sin_precio_promo": 1,
        "pct_completos": 50.0,
    }
