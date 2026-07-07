# Tessel

> Ficha creada el 2026-07-07 a partir de una auditoría directa de la MCC de Ada vía la API de Google Ads. No hay ningún documento de marca ni de estrategia como fuente para esta cuenta -- todo lo que no viene de la API está marcado "dato pendiente".

## Datos generales

- Nombre de la marca: Tessel
- URL de la tienda: dato pendiente
- Plataforma: parece tener componente de Tienda Nube (conversion actions "Tiendanube Website/Backend purchases") **y** componente de negocio local/lead-gen (conversion actions "Contact", "Formulario de Contacto", múltiples de llamada telefónica y Smart Campaign) -- confirmar con Mica qué tipo de negocio es.
- Rubro: dato pendiente.
- Estado actual de la cuenta: **activa, con campañas reales corriendo**, pero sin ficha de marca ni confirmación de Mica de que deba tratarse como cuenta operativa de Ada.
- Responsable interno en Zas: dato pendiente.
- Nivel de prioridad: dato pendiente.

## Google Ads

- ID de cuenta: `121-705-7288`.
- Objetivo de cuenta: dato pendiente.
- Conversion actions trackeadas (auditoría real 2026-07-07): 15 totales, 14 `ENABLED` -- mezcla fuerte de conversiones de contacto/llamada (`Smart campaign ad clicks to call`, `Calls from ads`, `Contact`, `Formulario de Contacto`) con conversiones de ecommerce (`Tiendanube Website/Backend purchases`).
- Tipos de campaña habilitados hoy: **Search, PMax y Smart** (única cuenta de la MCC con una campaña tipo Smart activa).
- Presupuesto: dato pendiente -- no hay documento de propuesta para esta marca.

### Auditoría real de la cuenta (2026-07-07, ventana 2026-06-01 a 2026-07-07)

- Es la cuenta más chica de la MCC: solo 5 campañas totales, 3 `ENABLED`.
- **Hallazgo importante: ROAS = 0 en las tres campañas activas, pese a tener spend y conversiones.** Esto no necesariamente es un problema -- es consistente con que las conversiones trackeadas sean de contacto/llamada (sin valor monetario asignado), no de compra:
  - `TESSEL` (Smart): spend $173.713, **2.962 conversiones**, $0 de ingresos -- volumen alto de conversión, típico de campañas Smart orientadas a llamadas/contacto.
  - `Max performance - Contactos` (PMax): spend $69.543, 27 conversiones, $0 de ingresos -- el propio nombre de la campaña ("Contactos") confirma que el objetivo es genuinamente de contacto, no de venta directa.
  - `BUS - Marca` (Search): spend $85.768, 0 conversiones, $0 de ingresos -- **candidata a revisión**: gasta sin generar ninguna conversión registrada, a diferencia de las otras dos.
- Si el negocio es de contacto/lead-gen (no ecommerce puro), el CPA por contacto/llamada es la métrica relevante, no el ROAS -- antes de diagnosticar esta cuenta con las heurísticas de `diagnosticos-y-senales.md` (pensadas para ROAS/CPA de venta), confirmar con Mica el modelo de negocio real.
- 3 asset groups de PMax detectados, los 3 `ENABLED`.

## Reglas importantes

- Qué NO inventar: rubro, modelo de negocio (¿ecommerce, local, lead-gen, mixto?), objetivo de CPA -- no hay ficha de marca fuente.
- Qué siempre validar con Mica: si esta cuenta debe tratarse como cuenta activa de Ada, y qué tipo de conversión es la que realmente importa para este negocio antes de diagnosticar con métricas de ROAS.
- Qué evitar: aplicar heurísticas de ROAS/CPA de ecommerce a esta cuenta sin confirmar el modelo de negocio real.

## Pendientes de información

- [ ] Confirmar con Mica el modelo de negocio real de Tessel (ecommerce, local, lead-gen, mixto).
- [ ] Confirmar si debe tratarse como cuenta activa de Ada.
- [ ] Completar ficha de marca completa.
- [ ] Confirmar por qué `BUS - Marca` no genera ninguna conversión pese al spend.
- [ ] Confirmar cuál es la métrica de éxito real (contactos/llamadas vs. ventas) antes de proponer cualquier cambio.
