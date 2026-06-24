from tn.client import TiendaNubeClient
from tn import scripts


def c():
    return TiendaNubeClient(store_id="123", token="tok")


def test_registrar_script(requests_mock):
    requests_mock.post(
        "https://api.tiendanube.com/v1/123/scripts",
        json={"id": 55, "src": "https://cdn/x.js", "event": "onload", "where": "store"},
    )
    r = scripts.registrar(c(), "https://cdn/x.js", where="store")
    assert r["id"] == 55
    assert requests_mock.last_request.json()["src"] == "https://cdn/x.js"
    assert requests_mock.last_request.json()["where"] == "store"


def test_listar_scripts(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/scripts", json=[{"id": 55}]
    )
    assert scripts.listar(c())[0]["id"] == 55


def test_borrar_script(requests_mock):
    requests_mock.delete(
        "https://api.tiendanube.com/v1/123/scripts/55", status_code=200
    )
    assert scripts.borrar(c(), 55) is True
