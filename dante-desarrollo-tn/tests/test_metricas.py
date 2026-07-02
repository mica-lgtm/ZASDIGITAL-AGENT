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


def test_rendimiento_por_producto_agrega_items(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/orders",
        json=[
            {"id": 1, "products": [
                {"product_id": 7, "name": "Alfombra", "price": "100.00", "quantity": 2},
                {"product_id": 8, "name": "Cuadro", "price": "50.00", "quantity": 1},
            ]},
            {"id": 2, "products": [
                {"product_id": 7, "name": "Alfombra", "price": "100.00", "quantity": 1},
            ]},
        ],
    )
    r = metricas.rendimiento_por_producto(c(), desde="2026-06-01")
    assert r[0]["product_id"] == 7
    assert r[0]["unidades"] == 3
    assert r[0]["revenue"] == 300.0
    assert r[0]["num_ordenes"] == 2
    assert r[1]["product_id"] == 8


def test_comparar_ventanas_computa_deltas(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/orders",
        [
            {"json": [{"id": 1, "total": "100.00"}]},
            {"json": [{"id": 2, "total": "150.00"}, {"id": 3, "total": "150.00"}]},
        ],
    )
    r = metricas.comparar_ventanas(
        c(), "2026-05-01", "2026-05-31", "2026-06-01", "2026-06-30"
    )
    assert r["delta_pedidos_pct"] == 100.0
    assert r["delta_ingresos_pct"] == 200.0
    assert r["delta_aov_pct"] == 50.0


def test_comparar_ventanas_antes_cero_no_divide(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/orders",
        [
            {"json": []},
            {"json": [{"id": 1, "total": "100.00"}]},
        ],
    )
    r = metricas.comparar_ventanas(
        c(), "2026-05-01", "2026-05-31", "2026-06-01", "2026-06-30"
    )
    assert r["delta_pedidos_pct"] is None
    assert r["despues"]["pedidos"] == 1


def test_serie_temporal_agrupa_por_dia(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/orders",
        json=[
            {"id": 1, "total": "100.00", "created_at": "2026-06-02T10:00:00+0000"},
            {"id": 2, "total": "50.00", "created_at": "2026-06-02T18:00:00+0000"},
            {"id": 3, "total": "200.00", "created_at": "2026-06-01T09:00:00+0000"},
        ],
    )
    r = metricas.serie_temporal(c(), desde="2026-06-01")
    assert r == [
        {"fecha": "2026-06-01", "pedidos": 1, "ingresos": 200.0},
        {"fecha": "2026-06-02", "pedidos": 2, "ingresos": 150.0},
    ]
