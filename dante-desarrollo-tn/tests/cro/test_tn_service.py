import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../.."))

import pytest
from unittest.mock import patch, MagicMock
from apps.cro.backend.services import tn_service as svc


SAMPLE_PRODUCT = {
    "id": 1,
    "name": {"es": "Buzo Plush"},
    "description": {"es": "<p>Descripción</p>"},
    "price": "42990.00",
    "promotional_price": "36542.00",
    "images": [{"src": "https://img.example.com/1.jpg"}],
    "variants": [{"values": [{"es": "S"}, {"es": "M"}]}],
    "categories": [{"name": {"es": "Buzos"}}],
}


@pytest.fixture
def mock_client():
    with patch("apps.cro.backend.services.tn_service.make_client") as m:
        client = MagicMock()
        m.return_value = client
        yield client


def test_list_tiendas():
    with patch("apps.cro.backend.services.tn_service.cargar_tiendas",
               return_value={"simona_shop": {}}):
        result = svc.list_tiendas()
    assert "simona_shop" in result


def test_list_productos(mock_client):
    mock_client.get_all.return_value = [SAMPLE_PRODUCT]
    result = svc.list_productos("simona_shop")
    assert len(result) == 1
    assert result[0]["nombre"] == "Buzo Plush"
    assert result[0]["precio"] == "42990.00"


def test_get_producto(mock_client):
    mock_client.get.return_value = SAMPLE_PRODUCT
    result = svc.get_producto("simona_shop", 1)
    vars_ = result["variables"]
    assert vars_["nombre"] == "Buzo Plush"
    assert vars_["precio"] == "42990.00"
    assert vars_["precio_promo"] == "36542.00"
    assert "S" in vars_["variantes"]
    assert "M" in vars_["variantes"]
    assert vars_["imagen"] == "https://img.example.com/1.jpg"
    assert "Buzos" in vars_["categorias"]


def test_list_categorias(mock_client):
    mock_client.get_all.return_value = [{"id": 10, "name": {"es": "Buzos"}}]
    result = svc.list_categorias("simona_shop")
    assert result == [{"id": 10, "nombre": "Buzos"}]
