# Sol · Reporte Diario Multi-Canal

Ver `CLAUDE.md` para identidad, alcance y reglas duras. Este README es el setup técnico.

## Estado actual (Fase 1 — MVP)

Implementados y probados: `canales/meta_ads.py`, `canales/google_ads.py`, `canales/tienda_nube.py`, `roster.py`, `sheets.py`, `reporte.py`, `formato_whatsapp.py`, `whatsapp.py`, `orquestador.py`.

Pendientes de implementar (Fase 2 — quedan como stubs que levantan `NotImplementedError`, ya registrados en `reporte.CANALES` para cuando se completen): `canales/tiktok_ads.py`, `canales/pinterest_ads.py`, `canales/meli_ads.py`, `canales/perfit.py`, `canales/meta_organico.py`.

## Prerrequisitos antes de correr esto en serio (Fase 0, ver plan)

1. **Google Sheets**: crear un proyecto de GCP, habilitar la Sheets API, generar una cuenta de servicio y descargar su JSON key a `secrets/sheets-service-account.json` (gitignored). Compartir la planilla maestra de clientes con el email de esa cuenta de servicio (permiso Editor). Completar `SOL_SHEETS_SPREADSHEET_ID` en `.env` con el ID de la planilla (el valor entre `/d/` y `/edit` en la URL).
   - La planilla necesita una hoja de roster (por defecto `Roster`, configurable con `SOL_SHEETS_HOJA_ROSTER`) con columnas `marca` y una columna por canal (valor no vacío = activo; ver `roster.py`).
   - Y una hoja de detalle diario (por defecto `Datos Diarios`, configurable con `SOL_SHEETS_HOJA_DATOS`) donde `sheets.py` va a appendear filas.
2. **Meta Ads**: un token de acceso de larga duración (System User, no el de 24hs) del Business Manager que ya usa Mateo, con permiso `ads_read` sobre las cuentas publicitarias de cada marca. Completar `SOL_META_ACCESS_TOKEN` y, por marca, `SOL_<MARCA>_META_AD_ACCOUNT_ID` (el ID numérico de la cuenta, sin el prefijo `act_`).
3. **Google Ads**: OAuth2 (no un bearer token simple). Necesitás un developer token aprobado (nivel Basic o superior), un cliente OAuth2 (client_id/client_secret) y un refresh token generado una vez con ese cliente contra la cuenta MCC. Completar `SOL_GOOGLE_ADS_DEVELOPER_TOKEN`, `SOL_GOOGLE_ADS_CLIENT_ID`, `SOL_GOOGLE_ADS_CLIENT_SECRET`, `SOL_GOOGLE_ADS_REFRESH_TOKEN`, `SOL_GOOGLE_ADS_LOGIN_CUSTOMER_ID` (ID de la MCC) y, por marca, `SOL_<MARCA>_GOOGLE_ADS_CUSTOMER_ID` (ID de la cuenta de cliente).
4. **Tienda Nube**: no requiere configuración acá — `canales/tienda_nube.py` reusa `dante-desarrollo-tn/.env` de solo lectura. Alcanza con que ese `.env` de Dante esté completo para las marcas que correspondan.
5. **WhatsApp** (recién necesario para Fase 4): activar WhatsApp Business Platform en el Business Manager, conseguir número + token permanente + plantilla de mensaje aprobada por Meta. Completar las variables `SOL_WHATSAPP_*`. Hasta que esto esté listo, correr todo con `--sin-whatsapp` (imprime el mensaje por consola en vez de enviarlo).

## Instalación

```bash
cd sol-reporte-diario
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # completar con datos reales
```

## Uso

```bash
python3 orquestador.py --fecha 2026-07-01 --canales meta_ads,tienda_nube --sin-whatsapp
```

- `--fecha`: día a reportar, `YYYY-MM-DD`. Default: ayer (hora Argentina).
- `--canales`: lista separada por comas para limitar el run a ciertos canales (útil mientras se agregan canales de a uno). Default: todos los que el roster marque activos.
- `--sin-whatsapp`: imprime el mensaje formateado por consola en vez de mandarlo por WhatsApp. Usar hasta que el prerrequisito 4 esté resuelto.

## Tests

```bash
pytest
```

## Scheduling (Fase 5)

No hay cron propio acá. Una vez validado el pipeline a mano (ver plan, sección Verificación), se crea una rutina diaria con el skill `/schedule` a las 9:00 hora Argentina que corre `python3 orquestador.py` desde esta carpeta.
