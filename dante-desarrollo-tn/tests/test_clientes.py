from tn.client import TiendaNubeClient
from tn import clientes


def c():
    return TiendaNubeClient(store_id="123", token="tok")


def test_buscar_pasa_query(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/customers", json=[{"id": 1}]
    )
    r = clientes.buscar(c(), "ana")
    assert r[0]["id"] == 1
    assert "q=ana" in requests_mock.last_request.url


def test_ordenes_de_cliente_filtra_por_customer(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/orders", json=[{"id": 5}]
    )
    r = clientes.ordenes_de_cliente(c(), 77)
    assert r[0]["id"] == 5
    assert "customer_ids=77" in requests_mock.last_request.url


def test_resumen_clientes_recompra_y_ltv(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/customers",
        json=[{"id": 1}, {"id": 2}, {"id": 3}],
    )
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/orders",
        json=[
            {"id": 10, "total": "100.00", "customer": {"id": 1}},
            {"id": 11, "total": "300.00", "customer": {"id": 1}},
            {"id": 12, "total": "50.00", "customer": {"id": 2}},
        ],
    )
    r = clientes.resumen_clientes(c())
    assert r["total_clientes"] == 3
    assert r["clientes_con_compra"] == 2
    assert r["tasa_recompra_pct"] == 50.0
    assert r["top_ltv"][0] == {"customer_id": 1, "ordenes": 2, "ltv": 400.0}


def test_resumen_clientes_sin_ordenes(requests_mock):
    requests_mock.get("https://api.tiendanube.com/v1/123/customers", json=[])
    requests_mock.get("https://api.tiendanube.com/v1/123/orders", json=[])
    r = clientes.resumen_clientes(c())
    assert r["tasa_recompra_pct"] == 0
    assert r["top_ltv"] == []
