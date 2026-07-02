"""Envío por WhatsApp Cloud API. Requiere que el prerrequisito de Fase 0 esté
resuelto (número de WhatsApp Business + token permanente + plantilla
aprobada) -- ver README, prerrequisito 4.

WhatsApp exige que un mensaje disparado por el negocio (no en respuesta a un
mensaje reciente del usuario) use una plantilla pre-aprobada por Meta. Como
Sol siempre dispara a las 9am por su cuenta, `enviar_plantilla` es el camino
normal: manda el reporte como el parámetro {{1}} de la plantilla
SOL_WHATSAPP_TEMPLATE_NAME. `enviar_texto` sólo sirve como mensaje de
seguimiento dentro de la ventana de 24hs que la plantilla abre."""

import os

import requests


def _config(env=None):
    env = env or os.environ
    config = {
        "api_version": env.get("SOL_WHATSAPP_API_VERSION", "v19.0"),
        "phone_number_id": env.get("SOL_WHATSAPP_PHONE_NUMBER_ID"),
        "token": env.get("SOL_WHATSAPP_ACCESS_TOKEN"),
        "destinatario": env.get("SOL_WHATSAPP_RECIPIENT_MICA"),
        "template_name": env.get("SOL_WHATSAPP_TEMPLATE_NAME", "reporte_diario"),
    }
    faltantes = [k for k in ("phone_number_id", "token", "destinatario") if not config[k]]
    if faltantes:
        raise ValueError(
            f"Faltan variables SOL_WHATSAPP_* en .env: {faltantes} (ver README, prerrequisito 4)"
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
