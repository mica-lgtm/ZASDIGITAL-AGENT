from canales import tienda_nube


def test_stats_dia_reusa_metricas_de_dante(monkeypatch, requests_mock):
    monkeypatch.setenv("DANTE_PILOTO_STORE_ID", "999")
    monkeypatch.setenv("DANTE_PILOTO_TOKEN", "tok")
    monkeypatch.setenv("DANTE_PILOTO_URL", "https://tienda.example.com")
    requests_mock.get(
        "https://api.tiendanube.com/v1/999/orders",
        json=[{"id": 1, "total": "100.00"}, {"id": 2, "total": "300.00"}],
    )

    fila = tienda_nube.stats_dia("piloto", "2026-06-01")

    assert fila["canal"] == "tienda_nube"
    assert fila["marca"] == "piloto"
    assert fila["conversiones"] == 2
    assert fila["ingresos"] == 400.0
    assert fila["spend"] is None
    assert fila["cpa"] is None
