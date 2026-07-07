import pytest

import whatsapp


def _env():
    return {
        "ADA_WHATSAPP_PHONE_NUMBER_ID": "123",
        "ADA_WHATSAPP_ACCESS_TOKEN": "tok",
        "ADA_WHATSAPP_RECIPIENT_MICA": "+5491111111111",
        "ADA_WHATSAPP_TEMPLATE_NAME": "ada_resumen_ejecutivo",
        "ADA_WHATSAPP_API_VERSION": "v19.0",
    }


def test_config_falla_si_faltan_variables():
    with pytest.raises(ValueError):
        whatsapp._config(env={})


def test_enviar_texto(requests_mock):
    requests_mock.post(
        "https://graph.facebook.com/v19.0/123/messages",
        json={"messages": [{"id": "wamid.1"}]},
    )
    resultado = whatsapp.enviar_texto("hola", env=_env())
    assert resultado["messages"][0]["id"] == "wamid.1"
    body = requests_mock.last_request.json()
    assert body["type"] == "text"
    assert body["text"]["body"] == "hola"
    assert body["to"] == "+5491111111111"


def test_enviar_plantilla(requests_mock):
    requests_mock.post(
        "https://graph.facebook.com/v19.0/123/messages",
        json={"messages": [{"id": "wamid.2"}]},
    )
    whatsapp.enviar_plantilla("resumen del dia", env=_env())
    body = requests_mock.last_request.json()
    assert body["type"] == "template"
    assert body["template"]["name"] == "ada_resumen_ejecutivo"
    assert body["template"]["components"][0]["parameters"][0]["text"] == "resumen del dia"
