import pytest

from canales import google_ads


def _env():
    return {
        "SOL_GOOGLE_ADS_DEVELOPER_TOKEN": "dev-tok",
        "SOL_GOOGLE_ADS_CLIENT_ID": "client-id",
        "SOL_GOOGLE_ADS_CLIENT_SECRET": "client-secret",
        "SOL_GOOGLE_ADS_REFRESH_TOKEN": "refresh-tok",
        "SOL_GOOGLE_ADS_LOGIN_CUSTOMER_ID": "123-456-7890",
        "SOL_PILOTO_GOOGLE_ADS_CUSTOMER_ID": "111-222-3333",
    }


class _Metricas:
    def __init__(self, cost_micros, impressions, clicks, ctr, conversions, conversions_value):
        self.cost_micros = cost_micros
        self.impressions = impressions
        self.clicks = clicks
        self.ctr = ctr
        self.conversions = conversions
        self.conversions_value = conversions_value


class _ClientFalso:
    def __init__(self, metrics, customer_id_esperado=None, fecha_esperada=None):
        self._metrics = metrics
        self.customer_id_esperado = customer_id_esperado
        self.fecha_esperada = fecha_esperada
        self.llamado_con = None

    def metricas_dia(self, customer_id, fecha):
        self.llamado_con = (customer_id, fecha)
        if self.customer_id_esperado is not None:
            assert customer_id == self.customer_id_esperado
        if self.fecha_esperada is not None:
            assert fecha == self.fecha_esperada
        return self._metrics


def test_stats_dia_normaliza_spend_conversiones_e_ingresos():
    metrics = _Metricas(
        cost_micros=100_500_000,
        impressions=1000,
        clicks=20,
        ctr=0.02,
        conversions=5,
        conversions_value=750.0,
    )
    client = _ClientFalso(metrics, customer_id_esperado="1112223333", fecha_esperada="2026-06-01")

    fila = google_ads.stats_dia("piloto", "2026-06-01", env=_env(), client=client)

    assert fila["canal"] == "google_ads"
    assert fila["spend"] == 100.5
    assert fila["impresiones"] == 1000
    assert fila["clics"] == 20
    assert fila["ctr"] == 2.0
    assert fila["conversiones"] == 5
    assert fila["ingresos"] == 750.0
    assert fila["cpa"] == 20.1
    assert fila["roas"] == round(750 / 100.5, 2)


def test_stats_dia_sin_actividad_devuelve_ceros():
    client = _ClientFalso(None)
    fila = google_ads.stats_dia("piloto", "2026-06-01", env=_env(), client=client)
    assert fila["spend"] == 0.0
    assert fila["conversiones"] == 0
    assert fila["cpa"] is None
    assert fila["roas"] is None


def test_stats_dia_quita_guiones_del_customer_id():
    client = _ClientFalso(None, customer_id_esperado="1112223333")
    google_ads.stats_dia("piloto", "2026-06-01", env=_env(), client=client)
    assert client.llamado_con[0] == "1112223333"


@pytest.mark.parametrize("clave_faltante", [
    "SOL_GOOGLE_ADS_DEVELOPER_TOKEN",
    "SOL_GOOGLE_ADS_CLIENT_ID",
    "SOL_GOOGLE_ADS_CLIENT_SECRET",
    "SOL_GOOGLE_ADS_REFRESH_TOKEN",
    "SOL_GOOGLE_ADS_LOGIN_CUSTOMER_ID",
    "SOL_PILOTO_GOOGLE_ADS_CUSTOMER_ID",
])
def test_stats_dia_falla_si_falta_alguna_credencial(clave_faltante):
    env = _env()
    del env[clave_faltante]
    with pytest.raises(ValueError):
        google_ads.stats_dia("piloto", "2026-06-01", env=env, client=_ClientFalso(None))
