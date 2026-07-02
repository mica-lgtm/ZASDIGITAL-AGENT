from tn.client import TiendaNubeClient
from tn import cupones


def c():
    return TiendaNubeClient(store_id="123", token="tok")


def test_crear_cupon_manda_payload(requests_mock):
    requests_mock.post(
        "https://api.tiendanube.com/v1/123/coupons", json={"id": 9, "code": "EXP10"}
    )
    r = cupones.crear(c(), "EXP10", "percentage", 10, max_usos=100)
    assert r["id"] == 9
    body = requests_mock.last_request.json()
    assert body["code"] == "EXP10"
    assert body["type"] == "percentage"
    assert body["value"] == "10"
    assert body["max_uses"] == 100


def test_crear_cupon_omite_opcionales(requests_mock):
    requests_mock.post("https://api.tiendanube.com/v1/123/coupons", json={"id": 9})
    cupones.crear(c(), "TRACK", "percentage", 0)
    body = requests_mock.last_request.json()
    assert "max_uses" not in body
    assert "end_date" not in body


def test_borrar_cupon(requests_mock):
    requests_mock.delete(
        "https://api.tiendanube.com/v1/123/coupons/9", status_code=200, json={}
    )
    assert cupones.borrar(c(), 9) is True


def test_uso_por_cupon_filtra_ordenes(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/orders",
        json=[
            {"id": 1, "coupon": [{"code": "EXP10"}]},
            {"id": 2, "coupon": []},
            {"id": 3, "coupon": [{"code": "OTRO"}]},
        ],
    )
    r = cupones.uso_por_cupon(c(), "EXP10", desde="2026-06-01")
    assert r["ordenes"] == 1
    assert r["detalle"][0]["id"] == 1
    assert "created_at_min=2026-06-01" in requests_mock.last_request.url
