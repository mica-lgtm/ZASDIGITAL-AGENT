from tn.client import TiendaNubeClient
from tn import metricas


def c():
    return TiendaNubeClient(store_id="123", token="tok")


def test_ordenes_pasa_filtros(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/orders",
        json=[{"id": 1, "total": "100.00"}],
    )
    o = metricas.ordenes(c(), desde="2026-06-01")
    assert o[0]["id"] == 1
    assert "created_at_min=2026-06-01" in requests_mock.last_request.url


def test_resumen_ventana_calcula_aov(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/orders",
        json=[{"id": 1, "total": "100.00"}, {"id": 2, "total": "300.00"}],
    )
    r = metricas.resumen_ventana(c(), desde="2026-06-01", hasta="2026-06-30")
    assert r["pedidos"] == 2
    assert r["ingresos"] == 400.0
    assert r["aov"] == 200.0


def test_resumen_ventana_sin_pedidos(requests_mock):
    requests_mock.get("https://api.tiendanube.com/v1/123/orders", json=[])
    r = metricas.resumen_ventana(c(), desde="2026-06-01", hasta="2026-06-30")
    assert r["pedidos"] == 0
    assert r["aov"] == 0


def test_resumen_ventana_tolera_total_nulo(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/orders",
        json=[{"id": 1, "total": None}, {"id": 2, "total": "200.00"}],
    )
    r = metricas.resumen_ventana(c(), desde="2026-06-01", hasta="2026-06-30")
    assert r["pedidos"] == 2
    assert r["ingresos"] == 200.0
