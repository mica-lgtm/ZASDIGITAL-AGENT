import pytest

from canales import meta_ads


def _env():
    return {
        "SOL_META_ACCESS_TOKEN": "tok",
        "SOL_PILOTO_META_AD_ACCOUNT_ID": "123",
        "SOL_META_API_VERSION": "v19.0",
    }


def test_stats_dia_normaliza_spend_conversiones_e_ingresos(requests_mock):
    requests_mock.get(
        "https://graph.facebook.com/v19.0/act_123/insights",
        json={"data": [{
            "spend": "100.50",
            "impressions": "1000",
            "clicks": "20",
            "ctr": "2.0",
            "actions": [{"action_type": "purchase", "value": "5"}],
            "action_values": [{"action_type": "purchase", "value": "750.00"}],
        }]},
    )
    fila = meta_ads.stats_dia("piloto", "2026-06-01", env=_env())
    assert fila["canal"] == "meta_ads"
    assert fila["spend"] == 100.5
    assert fila["impresiones"] == 1000
    assert fila["clics"] == 20
    assert fila["conversiones"] == 5
    assert fila["ingresos"] == 750.0
    assert fila["cpa"] == 20.1
    assert fila["roas"] == round(750 / 100.5, 2)


def test_stats_dia_sin_actividad_devuelve_ceros(requests_mock):
    requests_mock.get("https://graph.facebook.com/v19.0/act_123/insights", json={"data": []})
    fila = meta_ads.stats_dia("piloto", "2026-06-01", env=_env())
    assert fila["spend"] == 0.0
    assert fila["conversiones"] == 0
    assert fila["cpa"] is None
    assert fila["roas"] is None


def test_stats_dia_falla_si_falta_token():
    with pytest.raises(ValueError):
        meta_ads.stats_dia("piloto", "2026-06-01", env={"SOL_PILOTO_META_AD_ACCOUNT_ID": "123"})


def test_stats_dia_falla_si_falta_ad_account_id():
    with pytest.raises(ValueError):
        meta_ads.stats_dia("piloto", "2026-06-01", env={"SOL_META_ACCESS_TOKEN": "tok"})
