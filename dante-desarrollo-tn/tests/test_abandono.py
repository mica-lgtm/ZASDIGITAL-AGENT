from tn.client import TiendaNubeClient
from tn import abandono


def c():
    return TiendaNubeClient(store_id="123", token="tok")


def test_resumen_abandono_calcula_tasa(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/checkouts",
        json=[{"id": 1}, {"id": 2}, {"id": 3}],
    )
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/orders", json=[{"id": 10}]
    )
    r = abandono.resumen_abandono(c(), desde="2026-06-01")
    assert r["checkouts_abandonados"] == 3
    assert r["ordenes_completadas"] == 1
    assert r["tasa_abandono_pct"] == 75.0


def test_resumen_abandono_ventana_vacia(requests_mock):
    requests_mock.get("https://api.tiendanube.com/v1/123/checkouts", json=[])
    requests_mock.get("https://api.tiendanube.com/v1/123/orders", json=[])
    r = abandono.resumen_abandono(c(), desde="2026-06-01")
    assert r["tasa_abandono_pct"] == 0


def test_productos_mas_abandonados_agrega(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/checkouts",
        json=[
            {"id": 1, "products": [
                {"product_id": 7, "name": "Alfombra", "quantity": 2},
                {"product_id": 8, "name": "Cuadro", "quantity": 1},
            ]},
            {"id": 2, "products": [
                {"product_id": 7, "name": "Alfombra", "quantity": 1},
            ]},
        ],
    )
    r = abandono.productos_mas_abandonados(c(), desde="2026-06-01")
    assert r[0] == {"product_id": 7, "nombre": "Alfombra", "veces": 3}
    assert r[1]["product_id"] == 8


def test_valor_abandonado_suma_totales(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/checkouts",
        json=[{"id": 1, "total": "1500.50"}, {"id": 2, "total": None}],
    )
    assert abandono.valor_abandonado(c(), desde="2026-06-01") == 1500.5
