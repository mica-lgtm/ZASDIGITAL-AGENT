"""Cliente de LECTURA para Google Ads, vía el cliente oficial `google-ads`
(GAQL sobre gRPC, OAuth2 + developer token). Mismo patrón de wrapper que
`sol-reporte-diario/canales/google_ads.py` -- se puede inyectar un fake en
tests porque el cliente oficial habla gRPC, no HTTP plano.

Este módulo NUNCA debe importar ni exponer nada de `ads/mutate.py`. Es usado
por `ads/reportes.py`, que a su vez es usado por las tres rutinas programadas
-- todo de solo lectura.

Env esperadas:
  ADA_GOOGLE_ADS_DEVELOPER_TOKEN, ADA_GOOGLE_ADS_CLIENT_ID,
  ADA_GOOGLE_ADS_CLIENT_SECRET, ADA_GOOGLE_ADS_REFRESH_TOKEN,
  ADA_GOOGLE_ADS_LOGIN_CUSTOMER_ID (cuenta MCC)
  ADA_<MARCA>_GOOGLE_ADS_CUSTOMER_ID (por marca)
"""

import os


def _requerido(env, clave):
    valor = env.get(clave)
    if not valor:
        raise ValueError(f"Falta {clave} en .env")
    return valor


def credenciales_mcc(env=None):
    """Lee las credenciales de la MCC compartida desde el entorno. No arma el
    cliente todavía -- separado para poder testear la validación de env sin
    tocar gRPC."""
    env = env or os.environ
    return {
        "developer_token": _requerido(env, "ADA_GOOGLE_ADS_DEVELOPER_TOKEN"),
        "client_id": _requerido(env, "ADA_GOOGLE_ADS_CLIENT_ID"),
        "client_secret": _requerido(env, "ADA_GOOGLE_ADS_CLIENT_SECRET"),
        "refresh_token": _requerido(env, "ADA_GOOGLE_ADS_REFRESH_TOKEN"),
        "login_customer_id": _requerido(env, "ADA_GOOGLE_ADS_LOGIN_CUSTOMER_ID").replace("-", ""),
    }


def customer_id_de_marca(marca, env=None):
    env = env or os.environ
    customer_id = _requerido(env, f"ADA_{marca.upper()}_GOOGLE_ADS_CUSTOMER_ID")
    return customer_id.replace("-", "")


class GoogleAdsQueryClient:
    """Envuelve GoogleAdsClient para poder inyectar un fake en tests. Expone
    un único método genérico `buscar` -- cada reporte en `ads/reportes.py`
    arma su propio GAQL (`ads/queries.py`) y lo pasa acá."""

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

    def buscar(self, customer_id, query):
        """Ejecuta un GAQL de solo lectura y devuelve la lista de filas
        (materializa el stream para que sea fácil de testear/inspeccionar)."""
        from google.ads.googleads.errors import GoogleAdsException

        service = self._client.get_service("GoogleAdsService")
        try:
            respuesta = service.search(customer_id=customer_id, query=query)
        except GoogleAdsException as exc:
            raise RuntimeError(f"Google Ads API error para {customer_id}: {exc}") from exc
        return list(respuesta)


def cliente_desde_env(env=None):
    creds = credenciales_mcc(env)
    return GoogleAdsQueryClient(**creds)
