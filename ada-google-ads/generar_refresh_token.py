"""Genera un refresh token de Google Ads PROPIO para Ada -- distinto del
que usa Sol, aunque comparta el mismo client_id/client_secret y la misma
MCC. Ver CLAUDE.md, sección "Conexión a Google Ads", para la razón (Sol debe
seguir siendo 100% de solo lectura; que su credencial nunca esté a un .env
de distancia de código de escritura es lo que permite eso).

IMPORTANTE: correr esto en una máquina con navegador (no funciona en un
entorno sin display, como un devcontainer/codespace headless). Se corre
UNA sola vez.

Uso:
    pip install -r requirements.txt
    python3 generar_refresh_token.py

Iniciar sesión con la cuenta de Google que tiene acceso a la MCC de Zas
Digital, aceptar el consentimiento, y copiar el refresh token impreso a
ADA_GOOGLE_ADS_REFRESH_TOKEN en .env."""

import os
import sys

from dotenv import load_dotenv

SCOPES = ["https://www.googleapis.com/auth/adwords"]


def main():
    load_dotenv()

    client_id = os.environ.get("ADA_GOOGLE_ADS_CLIENT_ID")
    client_secret = os.environ.get("ADA_GOOGLE_ADS_CLIENT_SECRET")
    if not client_id or not client_secret:
        sys.exit(
            "Faltan ADA_GOOGLE_ADS_CLIENT_ID / ADA_GOOGLE_ADS_CLIENT_SECRET en .env "
            "-- completalos antes de correr este script (ya deberían estar copiados de Sol)."
        )

    from google_auth_oauthlib.flow import InstalledAppFlow

    flow = InstalledAppFlow.from_client_config(
        {
            "installed": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": ["http://localhost"],
            }
        },
        scopes=SCOPES,
    )

    print("Se va a abrir el navegador para el consentimiento de Google.")
    print("Iniciá sesión con la cuenta que tiene acceso a la MCC de Zas Digital.\n")

    credenciales = flow.run_local_server(prompt="consent")

    print("\nListo. Este es el refresh token PROPIO de Ada (no compartirlo, no commitearlo):\n")
    print(credenciales.refresh_token)
    print("\nCopialo en .env, en ADA_GOOGLE_ADS_REFRESH_TOKEN, y borrá este output de la terminal.")


if __name__ == "__main__":
    main()
