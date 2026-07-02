from tn.client import TiendaNubeClient
from tn import seo


def c():
    return TiendaNubeClient(store_id="123", token="tok")


def test_obtener_seo_extrae_campos(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/products/9",
        json={
            "id": 9,
            "name": {"es": "Alfombra"},
            "seo_title": {"es": "Alfombra artesanal"},
            "seo_description": {"es": "Tejida a mano"},
            "handle": {"es": "alfombra-artesanal"},
            "google_shopping_category": None,
        },
    )
    r = seo.obtener_seo(c(), 9)
    assert r["id"] == 9
    assert r["seo_title"] == {"es": "Alfombra artesanal"}
    assert "name" not in r


def test_actualizar_seo_manda_solo_provistos(requests_mock):
    requests_mock.put(
        "https://api.tiendanube.com/v1/123/products/9", json={"id": 9}
    )
    seo.actualizar_seo(c(), 9, titulo_seo="Nuevo título")
    body = requests_mock.last_request.json()
    assert body == {"seo_title": {"es": "Nuevo título"}}


def test_auditar_seo_catalogo_flags(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/products",
        json=[
            {
                "id": 1,
                "name": {"es": "Completo"},
                "seo_title": {"es": "t"},
                "seo_description": {"es": "d"},
                "description": {"es": "<p>" + "x" * 150 + "</p>"},
                "handle": {"es": "completo"},
            },
            {
                "id": 2,
                "name": {"es": "Incompleto"},
                "seo_title": {"es": ""},
                "seo_description": None,
                "description": {"es": "<p>corta</p>"},
                "handle": {"es": ""},
            },
            {
                "id": 3,
                "name": {"es": "Vacío"},
                "description": None,
            },
        ],
    )
    r = seo.auditar_seo_catalogo(c())

    completo = next(p for p in r if p["id"] == 1)
    assert not completo["sin_seo_title"]
    assert not completo["sin_descripcion"]
    assert not completo["descripcion_corta"]

    incompleto = next(p for p in r if p["id"] == 2)
    assert incompleto["sin_seo_title"]
    assert incompleto["sin_seo_desc"]
    assert incompleto["descripcion_corta"]
    assert incompleto["handle_vacio"]

    vacio = next(p for p in r if p["id"] == 3)
    assert vacio["sin_descripcion"]
    assert not vacio["descripcion_corta"]


def test_bulk_actualizar_seo(requests_mock):
    requests_mock.put(
        "https://api.tiendanube.com/v1/123/products/1", json={"id": 1}
    )
    requests_mock.put(
        "https://api.tiendanube.com/v1/123/products/2", json={"id": 2}
    )
    r = seo.bulk_actualizar_seo(c(), [
        {"id": 1, "seo_title": "Uno"},
        {"id": 2, "seo_description": "Dos", "handle": "dos"},
    ])
    assert len(r) == 2
    assert requests_mock.call_count == 2
