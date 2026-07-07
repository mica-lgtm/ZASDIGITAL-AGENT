# Ada · Agente de Google Ads

Ver `CLAUDE.md` para identidad, alcance y la puerta de aprobación (regla dura). Este README es el setup técnico.

## Estado actual

Implementados: cliente de lectura (`ads/client.py`, `ads/queries.py`, `ads/reportes.py`), cruce de roster con la planilla de Sol (`roster_ada.py`), las tres rutinas de solo lectura (`orquestador_manana.py`, `orquestador_tarde.py`, `orquestador_semanal.py`), entrega por WhatsApp + markdown, y la ejecución manual aprobada (`ads/mutate.py`, `aplicar_propuesta.py`).

Pendiente (fase 2, marcado explícitamente en `ads/mutate.py`): creación de campañas Performance Max (requiere `AssetGroupService` y es más compleja que Search/Shopping).

## Prerrequisitos

1. **Google Sheets**: no requiere setup propio — `roster_ada.py` reusa la misma planilla maestra que ya usa Sol. Alcanza con copiar el mismo `secrets/sheets-service-account.json` de Sol a `secrets/` acá y completar `ADA_SHEETS_SPREADSHEET_ID` (mismo ID que `SOL_SHEETS_SPREADSHEET_ID`).
2. **Google Ads**: mismo developer token y misma cuenta MCC que usa Sol (`ADA_GOOGLE_ADS_DEVELOPER_TOKEN` = mismo valor que `SOL_GOOGLE_ADS_DEVELOPER_TOKEN`), pero un **client OAuth2 propio** — generar un client_id/client_secret nuevo en el mismo proyecto de GCP y un refresh token nuevo autorizado contra la misma MCC (no reusar el refresh token de Sol; ver razón en `CLAUDE.md`, sección "Conexión a Google Ads"). Completar `ADA_GOOGLE_ADS_CLIENT_ID/_SECRET/_REFRESH_TOKEN/_LOGIN_CUSTOMER_ID` y, por marca, `ADA_<MARCA>_GOOGLE_ADS_CUSTOMER_ID` (mismo número que ya tiene Sol).
3. **WhatsApp**: mismo número/token de WhatsApp Business que usa Sol, pero una plantilla nueva aprobada por Meta (`ada_resumen_ejecutivo`, un solo parámetro de texto). Completar `ADA_WHATSAPP_*`. Hasta que la plantilla esté aprobada, correr todo con `--sin-whatsapp`.

## Instalación

```bash
cd ada-google-ads
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # completar con datos reales
```

## Uso

```bash
python3 orquestador_manana.py --sin-whatsapp
python3 orquestador_tarde.py --sin-whatsapp
python3 orquestador_semanal.py --sin-whatsapp
```

- `--fecha`: día de referencia, `YYYY-MM-DD`. Default: ayer (mañana/tarde) o el domingo más reciente (semanal), hora Argentina.
- `--marcas`: lista separada por comas para limitar el run a ciertas marcas. Default: todas las que la planilla marque con `google_ads` activo.
- `--sin-whatsapp`: imprime el resumen por consola en vez de mandarlo por WhatsApp.

Ninguna de las tres rutinas ejecuta cambios en una cuenta real — solo generan propuestas en `propuestas/` y reportes en `reportes/`.

### Aprobar y ejecutar una propuesta

```bash
python3 aplicar_propuesta.py --ejecutar ADA-JUANITAS-20260707-001
python3 aplicar_propuesta.py --activar ADA-JUANITAS-20260707-001   # solo para nueva_campana, luego de --ejecutar
```

Este script **nunca** se corre solo ni programado — solo cuando Mica dice `APROBADO <ID>` o `ACTIVAR <ID>` en una sesión de Claude Code.

## Tests

```bash
pytest
```

`tests/test_rutinas_no_mutan.py` es la garantía (estática + runtime) de que las tres rutinas programadas jamás llaman a `ads/mutate.py`.

## Scheduling

No hay cron propio. Tres rutinas programadas con el skill `/schedule`, hora Argentina:

| Rutina | Horario ART | Comando |
|---|---|---|
| Mañana | 09:00 diario | `python3 orquestador_manana.py` |
| Tarde | 16:00 diario | `python3 orquestador_tarde.py` |
| Semanal | Domingo 10:00 | `python3 orquestador_semanal.py` |

`aplicar_propuesta.py` explícitamente **no** se registra en ningún schedule.

## Piloto

Antes de habilitar el roster completo, correr contra una sola marca real -- Simona Shop (`ADA_SIMONA_GOOGLE_ADS_CUSTOMER_ID`) -- durante una semana completa.

Mientras la planilla de Sheets de Sol no esté configurada, usar `--customer-id-directo` para saltear el roster:

```bash
python3 orquestador_manana.py --marcas simona --customer-id-directo 6688370911 --sin-whatsapp
```

## Credenciales de Google Ads: generar el refresh token propio de Ada

Ada usa el mismo developer token y la misma cuenta MCC que Sol, pero un refresh token **propio** (no el de Sol) -- ver razón en `CLAUDE.md`, sección "Conexión a Google Ads". `client_id`/`client_secret` ya están copiados de Sol en `.env`; falta generar el refresh token, que requiere un navegador (no funciona en un entorno sin display):

```bash
pip install -r requirements.txt   # incluye google-auth-oauthlib
python3 generar_refresh_token.py
```

Iniciar sesión con la cuenta de Google que tiene acceso a la MCC de Zas Digital, aceptar el consentimiento, y copiar el refresh token impreso a `ADA_GOOGLE_ADS_REFRESH_TOKEN` en `.env`.
