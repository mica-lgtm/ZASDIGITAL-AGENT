# Solicitud de Acceso Básico — Google Ads API

Respuestas para el formulario de "Solicitar acceso básico" en el API Center
(`https://ads.google.com/aw/apicenter`, cuenta MCC "ZAS").

## 6. Please briefly describe your company's business model and how you use Google Ads.

> Zas Digital is a digital marketing agency that manages paid advertising
> (Meta Ads, Google Ads, TikTok Ads, and others) for a portfolio of e-commerce
> brands (fashion, home decor, and lifestyle retailers) in Argentina. We use
> the Google Ads API strictly as a read-only reporting integration: our
> internal tool ("Sol") pulls daily performance metrics (spend, impressions,
> clicks, conversions, conversion value) for each managed customer account
> under our manager account, consolidates them alongside other channels into
> a master spreadsheet, and sends a daily summary to the account manager via
> WhatsApp. The tool does not create, edit, or pause any campaigns — it only
> reads reporting data.

## 7. Design documentation of your tool (.pdf, .doc, or .rtf)

Ver sección completa más abajo — pegar en un Doc y exportar a PDF para subir.

## 8. Who will have access to the Google Ads API tool you are creating?

**Internal users - employees only (outsourcing, contractor included)**

Es una herramienta interna de la agencia (Sol), no la usan clientes ni el
público general.

## 9. Do you plan to use your Google Ads API token with a tool developed by someone else?

**No**

Es una herramienta propia, construida a medida (Sol, en este repo).

## 10. Do you plan to use your token for App Conversion Tracking and Remarketing API?

**No**

Sol solo lee métricas de reporting (`metrics.cost_micros`, `impressions`,
`clicks`, `ctr`, `conversions`, `conversions_value`) a nivel de cuenta. No usa
la API de conversion tracking de apps ni remarketing.

## 11. Which Google Ads campaign types does your tool support?

   > All campaign types. Our tool queries the `customer` resource for
   > account-level aggregate metrics (cost, impressions, clicks, conversions,
   > conversion value) — it does not filter or break down by campaign type, so
   > it reports total performance regardless of whether the underlying
   > campaigns are Search, Display, Shopping, Performance Max, Video, or Demand
   > Gen.

## Checkboxes finales

- "I acknowledge that all the information above is accurate." → tildar.
- "I accept the Terms and Conditions and acknowledge that my information will
  be used in accordance with Google's Privacy Policy." → tildar.

---

## Documentación de diseño (para el punto 7)

Pegar este contenido en un Google Doc / Word y exportar a PDF antes de subir.

### Sol — Reporte Diario Multi-Canal

**Qué es:** una herramienta interna de Zas Digital que centraliza las
métricas de performance de todos los canales pagos donde pautan las marcas
de la agencia (Meta Ads, Google Ads, TikTok Ads, Pinterest Ads, Mercado Libre
Ads, Perfit, Meta orgánico y Tienda Nube), las carga en una planilla maestra
de Google Sheets y envía un resumen diario por WhatsApp al equipo de cuentas.

**Uso de la Google Ads API:** exclusivamente de lectura (`GoogleAdsService.
Search`, GAQL) contra el recurso `customer`, a nivel de cuenta y por día,
para las métricas: `cost_micros`, `impressions`, `clicks`, `ctr`,
`conversions`, `conversions_value`. No se crean, editan, pausan ni activan
campañas, grupos de anuncios ni anuncios a través de la API — es
estrictamente de solo lectura.

**Arquitectura:**

1. `roster.py` lee de una planilla de Google Sheets qué marca tiene qué canal
   activo (fuente de verdad única, sin duplicar config).
2. Por cada marca con Google Ads activo, `canales/google_ads.py` arma una
   consulta GAQL contra la cuenta cliente correspondiente (bajo la cuenta MCC
   de la agencia, usando el header `login-customer-id`) y trae las métricas
   del día.
3. `reporte.py` agrega los resultados de todos los canales, calcula rollups
   por marca y total (spend, ingresos, conversiones, ROAS).
4. `sheets.py` carga una fila por (fecha, marca, canal) en la planilla
   maestra.
5. `formato_whatsapp.py` + `whatsapp.py` arman y envían un resumen de texto
   plano por WhatsApp Business a la responsable de cuentas.

**Frecuencia:** corre una vez al día (9am hora Argentina), vía una rutina
programada. No hay escritura ni modificación de campañas en ningún momento
del flujo.

**Alcance de acceso:** 9 cuentas cliente bajo la MCC de la agencia,
correspondientes a las marcas activas gestionadas por Zas Digital.
