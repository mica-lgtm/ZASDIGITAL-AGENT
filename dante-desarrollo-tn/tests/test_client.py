import time
import pytest
import requests
from tn.client import TiendaNubeClient


def make_client():
    return TiendaNubeClient(store_id="123", token="tok")


def test_headers_incluyen_auth_y_user_agent():
    c = make_client()
    h = c._headers()
    assert h["Authentication"] == "bearer tok"
    assert "Dante" in h["User-Agent"]


def test_get_devuelve_json(requests_mock):
    c = make_client()
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/store",
        json={"id": 123, "name": "Piloto"},
    )
    assert c.get("store")["name"] == "Piloto"


def test_get_all_sigue_paginacion_por_link(requests_mock):
    c = make_client()
    base = "https://api.tiendanube.com/v1/123/products"
    requests_mock.get(
        base,
        json=[{"id": 1}],
        headers={"Link": f'<{base}?page=2>; rel="next"'},
    )
    requests_mock.get(f"{base}?page=2", json=[{"id": 2}])
    todos = c.get_all("products")
    assert [p["id"] for p in todos] == [1, 2]


def test_reintenta_en_429(requests_mock, monkeypatch):
    monkeypatch.setattr(time, "sleep", lambda s: None)
    c = make_client()
    url = "https://api.tiendanube.com/v1/123/store"
    requests_mock.get(
        url,
        [
            {"status_code": 429, "headers": {"Retry-After": "1"}, "json": {}},
            {"status_code": 200, "json": {"ok": True}},
        ],
    )
    assert c.get("store") == {"ok": True}


def test_falla_tras_agotar_reintentos_429(requests_mock, monkeypatch):
    monkeypatch.setattr(time, "sleep", lambda s: None)
    c = make_client()
    url = "https://api.tiendanube.com/v1/123/store"
    requests_mock.get(
        url,
        [{"status_code": 429, "headers": {"Retry-After": "1"}, "json": {}}] * 4,
    )
    with pytest.raises(requests.exceptions.HTTPError):
        c.get("store")
