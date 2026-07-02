"""Fase 2 — pendiente de implementar. El más delicado de los seis pendientes:
el access token de Mercado Libre expira cada 6hs, así que este módulo necesita
su propia lógica de refresh (refresh_token -> access_token) antes de poder
pedir métricas, además del cliente `requests` de Product/Display Ads.

Env esperadas:
  SOL_MELI_CLIENT_ID, SOL_MELI_CLIENT_SECRET (a nivel cuenta)
  SOL_<MARCA>_MELI_USER_ID, SOL_<MARCA>_MELI_REFRESH_TOKEN (por marca)
"""


def stats_dia(marca, fecha):
    raise NotImplementedError(
        "canales.meli_ads: pendiente de Fase 2. Ver docstring del módulo "
        "para las credenciales necesarias."
    )
