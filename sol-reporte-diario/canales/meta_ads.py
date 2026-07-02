"""Meta Ads (paid), vía Marketing API directa (no MCP) para que orquestador.py
sea un script autónomo corrible igual a mano o por un cloud agent programado."""

import json
import os

import requests

from .base import fila

USER_AGENT = "Sol (mica@zasdigital.com)"


class MetaAdsClient:
    BASE = "https://graph.facebook.com"

    def __init__(self, access_token, api_version="v19.0", timeout=30):
        self.access_token = access_token
        self.api_version = api_version
        self.timeout = timeout

    def insights(self, ad_account_id, desde, hasta):
        url = f"{self.BASE}/{self.api_version}/act_{ad_account_id}/insights"
        params = {
            "access_token": self.access_token,
            "fields": "spend,impressions,clicks,ctr,actions,action_values",
            "time_range": json.dumps({"since": desde, "until": hasta}),
        }
        resp = requests.get(url, params=params, timeout=self.timeout)
        resp.raise_for_status()
        return resp.json()


def _valor_accion(acciones, tipo):
    for accion in acciones or []:
        if accion.get("action_type") == tipo:
            return float(accion.get("value") or 0)
    return 0.0


def stats_dia(marca, fecha, env=None):
    env = env or os.environ
    token = env.get("SOL_META_ACCESS_TOKEN")
    if not token:
        raise ValueError("Falta SOL_META_ACCESS_TOKEN en .env")
    ad_account_id = env.get(f"SOL_{marca.upper()}_META_AD_ACCOUNT_ID")
    if not ad_account_id:
        raise ValueError(f"Falta SOL_{marca.upper()}_META_AD_ACCOUNT_ID en .env")
    api_version = env.get("SOL_META_API_VERSION", "v19.0")

    client = MetaAdsClient(access_token=token, api_version=api_version)
    datos = client.insights(ad_account_id, fecha, fecha).get("data", [])

    if not datos:
        return fila(
            "meta_ads", marca, fecha,
            spend=0.0, impresiones=0, clics=0, ctr=0.0,
            conversiones=0, ingresos=0.0, cpa=None, roas=None,
        )

    fila_api = datos[0]
    spend = float(fila_api.get("spend") or 0)
    impresiones = int(float(fila_api.get("impressions") or 0))
    clics = int(float(fila_api.get("clicks") or 0))
    ctr = float(fila_api.get("ctr") or 0)
    conversiones = int(round(_valor_accion(fila_api.get("actions"), "purchase")))
    ingresos = _valor_accion(fila_api.get("action_values"), "purchase")

    return fila(
        "meta_ads", marca, fecha,
        spend=spend, impresiones=impresiones, clics=clics, ctr=ctr,
        conversiones=conversiones, ingresos=ingresos,
        cpa=round(spend / conversiones, 2) if conversiones else None,
        roas=round(ingresos / spend, 2) if spend else None,
    )
