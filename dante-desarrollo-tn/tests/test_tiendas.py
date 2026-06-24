import pytest
from tn.tiendas import cargar_tiendas, tienda

ENV = {
    "DANTE_PILOTO_STORE_ID": "123",
    "DANTE_PILOTO_TOKEN": "tok",
    "DANTE_PILOTO_URL": "https://piloto.example",
    "OTRA_VAR": "ignorar",
}


def test_cargar_tiendas_parsea_por_marca():
    t = cargar_tiendas(ENV)
    assert t["piloto"]["store_id"] == "123"
    assert t["piloto"]["token"] == "tok"
    assert t["piloto"]["url"] == "https://piloto.example"


def test_tienda_devuelve_cliente_configurado():
    c = tienda("piloto", ENV)
    assert c.store_id == "123"
    assert c.token == "tok"


def test_tienda_inexistente_falla():
    with pytest.raises(KeyError):
        tienda("noexiste", ENV)
