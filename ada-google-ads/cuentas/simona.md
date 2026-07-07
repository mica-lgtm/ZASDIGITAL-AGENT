# Simona Shop

> Ficha adaptada del brief que ya existía para el Centro de Mando Mica (recuperado de `git show 0f179ad^:cuentas/simona-shop.md`), recortada y extendida para Ada. Las secciones sobre email/PDP/creativos/automatizaciones se mantienen como contexto de marca útil aunque no sean de Google Ads directamente.

## Datos generales

- Nombre de la marca: Simona Shop
- URL de la tienda: https://www.simonashop.com.ar
- Plataforma: Tienda Nube
- Rubro: Indumentaria femenina
- Estado actual de la cuenta: activa -- marca piloto para validar el pipeline de Ada
- Responsable interno en Zas: Mica
- Nivel de prioridad: Alto

## Qué vende

- Categorías principales: indumentaria femenina, otoño/invierno, básicos, final sale, sets sastreros, blazers, denim, sweaters, camisas, remeras y musculosas, línea masculina menor.
- Ticket promedio aproximado: entre $97.000 y $155.000 según período (dato de auditoría previa -- confirmar vigencia antes de fijar objetivos de CPA/ROAS).
- Estacionalidades importantes: otoño/invierno, verano, Hot Sale, Cyber, Final Sale, lanzamientos de temporada.

## Público objetivo

- Quién compra: mujeres interesadas en moda, prendas de temporada, básicos y looks completos.
- Edad aproximada: clienta promedio cercana a los 50 años (auditoría previa), aunque la comunicación puede sentirse más joven.
- Género principal: mujeres.
- Ubicación: Argentina, mayor concentración en Buenos Aires, CABA, Córdoba y Santa Fe.
- Motivaciones: renovar guardarropa, prendas de temporada, looks completos, descuentos, cuotas, básicos combinables.
- Dolores o miedos: dudas de talle/calce, información incompleta en la ficha, dudas de cambios, costo de envío, abandono en checkout.
- Objeciones frecuentes: talle, calce, composición de tela, cambios/devoluciones, envío, medios de pago, stock.

## Tono de voz

- Estilo de comunicación: cálido, cercano, canchero, claro, con emojis (nivel medio, sin saturar).
- Palabras que usa: look, temporada, básicos, combiná, armá tu outfit, sumalo a tu placard, aprovechá.
- Palabras que evita: "increíble", "imperdible", "explotó", promesas exageradas, frases genéricas de moda sin contenido real.
- Emojis permitidos: ✨ 🛍️ 🤍 🔥 👖 🧥

## Identidad visual

- Colores principales: blanco (fondo), negro (texto/contraste), gris claro (secundario).
- Colores secundarios: beige, camel, chocolate, verde botella, verde natural.
- Estilo visual: moda comercial, looks de temporada, fotos de producto y lifestyle, estética clara y aspiracional.

## Promociones y beneficios

- Envío gratis: sí, compras superiores a $149.900 (Correo Argentino) -- **confirmar vigencia con Mica antes de usarlo en un anuncio**.
- Cuotas: 6 y 12 cuotas sin interés detectadas en campañas anteriores -- confirmar condiciones vigentes.
- Descuento por transferencia: 20% detectado en campañas anteriores -- confirmar si sigue vigente y si es acumulable.
- Regla dura (heredada del brief original): no usar ninguna promoción sin validación previa de Mica.

## Google Ads

- ID de cuenta: ver `ADA_SIMONA_GOOGLE_ADS_CUSTOMER_ID` en `.env` / `cuentas-publicitarias-google-ads.md`.
- Objetivo de cuenta: CPA objetivo / ROAS objetivo: **dato pendiente** -- confirmar con Mica antes de usar como umbral en las heurísticas de `conocimiento/diagnosticos-y-senales.md`.
- Conversion actions trackeadas: dato pendiente -- confirmar vía `ads/reportes.reporte_conversion_actions` en la primera corrida real.
- Tipos de campaña permitidos: [x] Search -- confirmado como el único tipo habilitado por ahora (Shopping/PMax/Display quedan pendientes de habilitar).
- Tope de presupuesto diario/mensual: dato pendiente -- confirmar con Mica antes de aprobar cualquier `ajuste_presupuesto`.
- Negativas propias: además de `conocimiento/negativas-baseline.md`, evaluar excluir búsquedas de "outlet"/"usado" si la marca no vende second-hand (confirmar).
- Calendario de estacionalidad/promos específico: Hot Sale, Cyber, Final Sale, lanzamientos de temporada (otoño/invierno y verano) -- cruzar fechas exactas con `conocimiento/calendario-estacional.md` en cada edición.

## Canales activos

- Meta Ads: sí. Google Ads: sí (piloto de Ada). TikTok Ads: sí. Pinterest: sí. Email marketing: sí (Perfit). Otros: WhatsApp, Instagram, Facebook.

## Reglas importantes

- Qué NO inventar: promociones vigentes, acumulabilidad de descuentos, stock, talles disponibles, umbral de envío gratis, fechas exactas de campaña, CPA/ROAS objetivo (todo esto son "dato pendiente" hasta que Mica lo confirme para Google Ads específicamente).
- Qué siempre validar con Mica: promos vigentes, tope de presupuesto, si el tono debe sonar más juvenil o más adulto, cualquier propuesta de campaña nueva antes de generarla en detalle.
- Qué evitar: pujas o presupuestos agresivos hasta no tener CPA/ROAS objetivo confirmado.

## Pendientes de información

- [ ] Confirmar CPA/ROAS objetivo para Google Ads.
- [ ] Confirmar conversion actions activas y si están trackeando correctamente.
- [ ] Confirmar tope de presupuesto diario/mensual.
- [ ] Confirmar si Shopping/Performance Max están habilitados para esta cuenta o si por ahora es solo Search.
- [ ] Confirmar vigencia de envío gratis / cuotas / transferencia al momento de esta auditoría.
