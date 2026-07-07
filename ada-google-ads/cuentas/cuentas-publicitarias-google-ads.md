# Cuentas Publicitarias de Google Ads · Mapeo por Marca

Mismos customer IDs que ya usa Sol (`SOL_<MARCA>_GOOGLE_ADS_CUSTOMER_ID`), documentados acá para que Ada no dependa de leer el `.env` de Sol. Actualizar esta tabla si una cuenta cambia.

Esta tabla se construye ahora auditando directamente la MCC de Ada vía la API de Google Ads (`ads/reportes.reporte_cuentas_cliente`), no cruzando contra la planilla de Sol -- Ada opera aparte, Sol hace su propia tarea de reporting de lectura para otros canales.

| Marca | Customer ID | Notas |
|---|---|---|
| Simona | `668-837-0911` | confirmado por API (auditoría 2026-07-07) -- marca piloto original |
| Juanitas | `809-224-4949` | confirmado por API (auditoría 2026-07-07) -- antes "dato pendiente", resuelto sin depender de Sol |
| Magnolias | `232-856-2558` | confirmado por API (auditoría 2026-07-07) -- antes "dato pendiente", resuelto sin depender de Sol |
| Tessel | `121-705-7288` | cuenta detectada en la MCC el 2026-07-07, sin ficha de marca todavía -- ver `cuentas/tessel.md` |
| Vitalis Navitas | `331-458-8133` | cuenta detectada en la MCC el 2026-07-07, sin ficha de marca todavía -- ver `cuentas/vitalis_navitas.md` |
| ZAS | `557-039-2419` | cuenta de la propia Zas Digital dentro de la MCC, sin campañas -- no es cuenta de cliente, no requiere ficha |

Hanna OK (`359-846-6227`), Mini Anima Ads (`915-070-7447`) y EssenTea 2 (`638-364-7729`) también existen en la MCC pero Mica pidió excluirlas de esta ronda -- no tienen ficha ni se auditan por ahora.

## Dato pendiente

- Para Tessel y Vitalis Navitas: confirmar con Mica si deben tratarse como cuentas activas de Ada (marca, objetivo, tope de presupuesto, tono, etc.) -- hoy solo tienen el customer ID y lo que la API expone, nada de contexto de marca.
