"""Fase 2 — pendiente de implementar.

Meta Business Suite orgánico (Instagram/Facebook Insights vía Graph API),
distinto de canales/meta_ads.py: aunque comparte el mismo Business Manager,
necesita su propio scope de permisos (instagram_manage_insights,
pages_read_engagement), no alcanza con el token de Ads.

Env esperadas:
  SOL_META_SYSTEM_USER_TOKEN (a nivel cuenta, con los scopes de insights)
  SOL_<MARCA>_META_PAGE_ID, SOL_<MARCA>_META_IG_BUSINESS_ID (por marca)
"""


def stats_dia(marca, fecha):
    raise NotImplementedError(
        "canales.meta_organico: pendiente de Fase 2. Ver docstring del "
        "módulo para las credenciales necesarias."
    )
