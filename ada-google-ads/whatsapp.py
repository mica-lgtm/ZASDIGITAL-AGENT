"""Envío por WhatsApp Cloud API. Copiado y adaptado de
`sol-reporte-diario/whatsapp.py` (mismo número/token de WhatsApp Business,
plantilla propia). Ver README, prerrequisito 3.

WhatsApp exige que un mensaje disparado por el negocio (no en respuesta a un
mensaje reciente del usuario) use una plantilla pre-aprobada por Meta. Como
las rutinas de Ada disparan solas por `/schedule`, `enviar_plantilla` es el
camino normal: manda el resumen como el parámetro {{1}} de la plantilla
ADA_WHATSAPP_TEMPLATE_NAME."""

import os

import requests


def _config(env=None):
    env = env or os.environ
    config = {
        "api_version": env.get("ADA_WHATSAPP_API_VERSION", "v19.0"),
        "phone_number_id": env.get("ADA_WHATSAPP_PHONE_NUMBER_ID"),
        "token": env.get("ADA_WHATSAPP_ACCESS_TOKEN"),
        "destinatario": env.get("ADA_WHATSAPP_RECIPIENT_MICA"),
        "template_name": env.get("ADA_WHATSAPP_TEMPLATE_NAME", "ada_resumen_ejecutivo"),
    }
    faltantes = [k for k in ("phone_number_id", "token", "destinatario") if not config[k]]
    if faltantes:
        raise ValueError(
            f"Faltan variables ADA_WHATSAPP_* en .env: {faltantes} (ver README, prerrequisito 3)"
        )
    return config


def _post(config, payload):
    url = f"https://graph.facebook.com/{config['api_version']}/{config['phone_number_id']}/messages"
    headers = {"Authorization": f"Bearer {config['token']}", "Content-Type": "application/json"}
    resp = requests.post(url, headers=headers, json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()


def enviar_plantilla(mensaje, env=None):
    config = _config(env)
    payload = {
        "messaging_product": "whatsapp",
        "to": config["destinatario"],
        "type": "template",
        "template": {
            "name": config["template_name"],
            "language": {"code": "es_AR"},
            "components": [{"type": "body", "parameters": [{"type": "text", "text": mensaje}]}],
        },
    }
    return _post(config, payload)


def enviar_texto(mensaje, env=None):
    config = _config(env)
    payload = {
        "messaging_product": "whatsapp",
        "to": config["destinatario"],
        "type": "text",
        "text": {"body": mensaje},
    }
    return _post(config, payload)
