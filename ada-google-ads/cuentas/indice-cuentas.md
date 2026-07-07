# Índice de cuentas · Ada (Google Ads)

## Regla de uso

Antes de auditar o proponer algo para una marca, leo su ficha en esta carpeta (`cuentas/<marca>.md`).

## Cómo se descubren las cuentas (actualizado 2026-07-07)

Ada audita su propia MCC directamente vía la API de Google Ads (`ads/reportes.reporte_cuentas_cliente`, corrido contra `ADA_GOOGLE_ADS_LOGIN_CUSTOMER_ID`) -- no depende de la planilla maestra de Sol para saber qué cuentas existen. Sol hace su propio trabajo de reporting de lectura para otros canales; Ada trabaja aparte sobre Google Ads.

- Cuenta que existe en la MCC sin ficha en `cuentas/` → se reporta como bloqueante ("cuenta detectada, ficha faltante — no puedo personalizar, avisar a Mica") y no se inventa su contexto.
- Ficha en `cuentas/` cuya cuenta ya no aparece en la MCC (fue removida/desvinculada) → se marca como "posible ficha obsoleta" para revisar con Mica.
- Marca que Mica menciona pero no aparece en la MCC ni acá → no la trato como cuenta activa, pregunto si es una cuenta nueva, una inactiva, o un error de nombre.

Nota pendiente de resolver con Mica: las tres rutinas programadas (`orquestador_manana.py`, `orquestador_tarde.py`, `orquestador_semanal.py`) todavía usan la planilla de Sol como toggle de "qué marca está activa para procesar hoy" (vía `roster_ada.marcas_google_ads_activas`). Esta auditoría manual reemplaza ese toggle por descubrimiento directo de la MCC, pero las rutinas automáticas en sí no se tocaron todavía -- confirmar con Mica si corresponde migrarlas también a este mismo modelo.

## Cuentas auditadas en la MCC (2026-07-07)

| Marca | Ficha | Customer ID | Estado real (auditoría 2026-07-07) |
|---|---|---|---|
| Simona | `simona.md` | `668-837-0911` | Activa, 20 campañas ENABLED (Search/Display/PMax/Video/Demand Gen), ROAS blended 21,6x |
| Juanitas | `juanitas.md` | `809-224-4949` | Activa, 5 campañas ENABLED (Search/PMax), solo 1 con spend real |
| Magnolias | `magnolias.md` | `232-856-2558` | Activa, 11 campañas ENABLED (Search/PMax), mejor ROAS real de la MCC (25,2x) |
| Tessel | `tessel.md` | `121-705-7288` | Activa, 3 campañas ENABLED, ROAS 0 (conversiones de contacto/llamada, no venta), sin ficha de marca |
| Vitalis Navitas | `vitalis_navitas.md` | `331-458-8133` | Activa, 14 campañas ENABLED, ROAS blended más bajo de la MCC (5,8x), sin ficha de marca |
| ZAS | -- | `557-039-2419` | Cuenta de la propia Zas Digital, sin campañas -- no es cliente, no requiere ficha |

Hanna OK (`359-846-6227`), Mini Ánima (`915-070-7447`) y EssenTea 2 (`638-364-7729`) también existen en la MCC pero Mica pidió excluirlas de esta ronda de auditoría/seguimiento -- no tienen ficha ni se tratan como cuentas de Ada por ahora.

(Esta tabla se actualiza a mano después de cada auditoría -- se re-audita corriendo `ads/reportes.reporte_cuentas_cliente` contra la MCC, no leyendo esta tabla como fuente de verdad.)
