from tn.client import TiendaNubeClient
from tn import checkout


def c():
    return TiendaNubeClient(store_id="123", token="tok")


def test_cart_permalink_un_item():
    url = checkout.cart_permalink("https://piloto.example", [(900, 1)])
    assert url == "https://piloto.example/comprar/900"


def test_cart_permalink_varios_items_usa_query():
    url = checkout.cart_permalink("https://piloto.example/", [(900, 2), (901, 1)])
    assert url.startswith("https://piloto.example/comprar/900?")
    assert "add_to_cart=901:1" in url


def test_draft_order_devuelve_checkout_url(requests_mock):
    requests_mock.post(
        "https://api.tiendanube.com/v1/123/draft_orders",
        json={"id": 7, "checkout_url": "https://piloto.example/checkout/7"},
    )
    r = checkout.draft_order(c(), [(900, 1)])
    assert r["checkout_url"].endswith("/checkout/7")
    assert requests_mock.last_request.json()["products"] == [
        {"variant_id": 900, "quantity": 1}
    ]


def test_cart_permalink_items_vacio_falla():
    import pytest

    with pytest.raises(ValueError):
        checkout.cart_permalink("https://piloto.example", [])
