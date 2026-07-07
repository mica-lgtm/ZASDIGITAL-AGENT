# Pendientes

Tareas abiertas y datos pendientes por marca, agregados por las rutinas cuando detectan una ficha incompleta, una cuenta sin customer ID confirmado, o una pregunta que necesita respuesta de Mica antes de poder avanzar.

## 2026-07-07 -- Onboarding Juanitas y Magnolias (desde documentos de propuesta julio 2026) -- RESUELTO

Mica compartió 3 PDFs de propuesta estratégica "ZAS Growth Partner Julio 2026" (Simona, Juanitas, Magnolias). Se creó ficha para Juanitas y Magnolias con el contexto de Google Ads extraído. Los customer ID se resolvieron el mismo día vía auditoría directa de la MCC (ver bloque siguiente), sin depender de Sol.

## 2026-07-07 -- Auditoría completa de la MCC (a pedido de Mica: "audita todas las cuentas")

Se corrió `ads/reportes.reporte_cuentas_cliente` contra la MCC de Ada (`ADA_GOOGLE_ADS_LOGIN_CUSTOMER_ID`) para descubrir todas las cuentas reales, sin depender de la planilla de Sol. Resultado: 8 cuentas cliente + 1 cuenta propia de Zas Digital (sin campañas). Detalle completo por cuenta en `cuentas/<marca>.md`. Bug encontrado y arreglado en el camino: los campos enum de `ads/reportes.py` (estado de campaña, tipo de canal, approval status, etc.) devolvían el valor numérico crudo de la API en vez del nombre -- se agregó `_nombre_enum()` para resolverlo correctamente.

Mica pidió excluir explícitamente **Hanna OK, Mini Ánima y EssenTea 2** de esta ronda de auditoría/seguimiento (2026-07-07) -- se borraron sus fichas stub y sus customer ID de `.env`. Quedan en la MCC pero Ada no las trata como cuentas propias por ahora.

Pendientes abiertos que salieron de esta auditoría:

- [ ] **Simona**: confirmar con Mica si la apertura a Search + Display + PMax + Video + Demand Gen (contra lo que decía la ficha, "solo Search") fue decisión consciente o quedó así por campañas de temporadas pasadas nunca pausadas.
- [ ] **Simona**: aprobar o rechazar propuesta de pausar 15 campañas ENABLED con spend $0 (leftover de Sale Verano/Hot Sale/Día de la Madre/Cyber/Black Friday/Navidad 2025).
- [ ] **Simona**: revisar por qué `BUS - Simona Fest` tiene ROAS 2,79 muy por debajo del resto de la cuenta (18-23x).
- [ ] **Simona y Magnolias**: resolver conversion actions duplicadas/parecidas (riesgo de ROAS inflado por doble conteo) antes de confiar en el ROAS blended reportado.
- [ ] **Juanitas**: aprobar o rechazar propuesta de pausar 4 campañas estacionales con spend $0; confirmar por qué `BUS - Marca - B` (citada en el documento de propuesta) no aparece activa hoy.
- [ ] **Magnolias**: aprobar o rechazar propuesta de pausar 5 campañas estacionales con spend $0.
- [ ] **Tessel, Vitalis Navitas**: confirmar con Mica si deben tratarse como cuentas activas de Ada -- hoy solo tienen customer ID y lo que la API expone, sin ficha de marca ni objetivo confirmado.
- [ ] **Vitalis Navitas**: diagnosticar 5 campañas Search Generic (Colágeno, Magnesio, Omega 3, Probióticos, Suplementos Peptan) que gastan plata real, pierden 60-89% de impression share por presupuesto, y tienen 0 conversiones -- no aumentar presupuesto sin entender esto primero.
- [ ] **Tessel**: confirmar modelo de negocio real (parece lead-gen/local, no ecommerce puro) antes de diagnosticar con métricas de ROAS.
- [ ] Confirmar si los presupuestos de Google Ads propuestos en los documentos de Simona/Juanitas/Magnolias ($7,8-9,3M / $2,52M / $7,94M) son topes reales para julio 2026 o solo cifras de la propuesta comercial.
- [ ] Decisión de arquitectura: confirmar con Mica si las rutinas programadas (mañana/tarde/semanal) deben dejar de usar la planilla de Sol como toggle de activación y usar en cambio el descubrimiento directo de la MCC (ver nota en `cuentas/indice-cuentas.md`).
