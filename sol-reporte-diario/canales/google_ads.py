"""Google Ads, vía el cliente oficial `google-ads` (GAQL sobre gRPC, OAuth2 +
developer token — no un bearer token simple como Meta).

Env esperadas:
  SOL_GOOGLE_ADS_DEVELOPER_TOKEN, SOL_GOOGLE_ADS_CLIENT_ID,
  SOL_GOOGLE_ADS_CLIENT_SECRET, SOL_GOOGLE_ADS_REFRESH_TOKEN,
  SOL_GOOGLE_ADS_LOGIN_CUSTOMER_ID (cuenta MCC)
  SOL_<MARCA>_GOOGLE_ADS_CUSTOMER_ID (por marca)
"""

import os

from .base import fila

QUERY_METRICAS_DIA = """
    SELECT
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.conversions,
        metrics.conversions_value
    FROM customer
    WHERE segments.date = '{fecha}'
"""


class GoogleAdsQueryClient:
    """Envuelve GoogleAdsClient para que stats_dia pueda inyectar un fake en
    tests (el cliente oficial habla gRPC, no HTTP plano, así que no se puede
    mockear con requests_mock como en meta_ads.py)."""

    def __init__(self, developer_token, client_id, client_secret, refresh_token,
                 login_customer_id):
        from google.ads.googleads.client import GoogleAdsClient

        self._client = GoogleAdsClient.load_from_dict({
            "developer_token": developer_token,
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            "login_customer_id": login_customer_id,
            "use_proto_plus": True,
        })

    def metricas_dia(self, customer_id, fecha):
        from google.ads.googleads.errors import GoogleAdsException

        service = self._client.get_service("GoogleAdsService")
        query = QUERY_METRICAS_DIA.format(fecha=fecha)
        try:
            respuesta = service.search(customer_id=customer_id, query=query)
        except GoogleAdsException as exc:
            raise RuntimeError(f"Google Ads API error para {customer_id}: {exc}") from exc

        for row in respuesta:
            return row.metrics
        return None


def _requerido(env, clave):
    valor = env.get(clave)
    if not valor:
        raise ValueError(f"Falta {clave} en .env")
    return valor


def stats_dia(marca, fecha, env=None, client=None):
    env = env or os.environ

    developer_token = _requerido(env, "SOL_GOOGLE_ADS_DEVELOPER_TOKEN")
    client_id = _requerido(env, "SOL_GOOGLE_ADS_CLIENT_ID")
    client_secret = _requerido(env, "SOL_GOOGLE_ADS_CLIENT_SECRET")
    refresh_token = _requerido(env, "SOL_GOOGLE_ADS_REFRESH_TOKEN")
    login_customer_id = _requerido(env, "SOL_GOOGLE_ADS_LOGIN_CUSTOMER_ID")
    customer_id = _requerido(env, f"SOL_{marca.upper()}_GOOGLE_ADS_CUSTOMER_ID")
    customer_id = customer_id.replace("-", "")

    if client is None:
        client = GoogleAdsQueryClient(
            developer_token=developer_token,
            client_id=client_id,
            client_secret=client_secret,
            refresh_token=refresh_token,
            login_customer_id=login_customer_id.replace("-", ""),
        )

    metrics = client.metricas_dia(customer_id, fecha)

    if metrics is None:
        return fila(
            "google_ads", marca, fecha,
            spend=0.0, impresiones=0, clics=0, ctr=0.0,
            conversiones=0, ingresos=0.0, cpa=None, roas=None,
        )

    spend = round(metrics.cost_micros / 1_000_000, 2)
    impresiones = int(metrics.impressions)
    clics = int(metrics.clicks)
    ctr = round(metrics.ctr * 100, 4)
    conversiones = int(round(metrics.conversions))
    ingresos = float(metrics.conversions_value)

    return fila(
        "google_ads", marca, fecha,
        spend=spend, impresiones=impresiones, clics=clics, ctr=ctr,
        conversiones=conversiones, ingresos=ingresos,
        cpa=round(spend / conversiones, 2) if conversiones else None,
        roas=round(ingresos / spend, 2) if spend else None,
    )
