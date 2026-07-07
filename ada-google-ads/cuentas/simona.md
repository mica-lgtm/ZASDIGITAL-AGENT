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
- Objetivo de cuenta: CPA objetivo / ROAS objetivo: **dato pendiente** -- confirmar con Mica antes de usar como umbral en las heurísticas de `conocimiento/diagnosticos-y-senales.md`. El documento "Simona x ZAS - Propuesta Integral Julio 2026" propone un ROAS de cuenta consolidado (todos los canales) de 10x, con Google Ads aportando ~8x -- son cifras de propuesta comercial, no un objetivo confirmado por Mica específicamente para Google.
- Conversion actions trackeadas (auditoría real 2026-07-07): 26 totales, 23 `ENABLED` -- incluye varias conversiones de la misma familia con nombres parecidos (`Purchase`, `GA4SIMONA (web) purchase`, `Simona Tienda Nube - GA4 (web) purchase`, `Tiendanube Website purchases`, `Tiendanube Backend purchases`, más eventos de embudo `cp1_agregar_al_carrito`/`cp2_iniciar_pago`/`cp3_información_de_pago`). **Mismo riesgo que en Magnolias**: varias conversiones de compra en paralelo pueden estar duplicando el conteo. Confirmar con Mica cuál es la conversión primaria antes de usar CPA/ROAS como umbral de decisión.
- Tipos de campaña permitidos: **corregido tras auditoría real (2026-07-07) -- la ficha decía "solo Search" pero esto ya no es así.** La cuenta real tiene campañas `ENABLED` de **SEARCH, DISPLAY, PERFORMANCE_MAX, VIDEO y DEMAND_GEN** simultáneamente (20 campañas `ENABLED` sobre 148 totales en la ventana auditada). El checklist de abajo se corrige para reflejar la realidad, no lo que decía el documento de propuesta ni la versión anterior de esta ficha: [x] Search [x] Shopping/PMax [x] Display [x] Video [x] Demand Gen -- **confirmar con Mica si esta apertura de canales fue una decisión consciente o quedó así por creación de campañas de temporadas pasadas sin que se haya revisado el alcance.**
- Presupuesto Google Ads julio 2026 (propuesto, no confirmado como tope duro): $7,8M-$9,3M, equivalente al 20% del presupuesto total de paid media de la marca ($39-46,5M) según el documento de propuesta. Confirmar con Mica si esta cifra es el tope real a usar en `diagnosticos-y-senales.md` (impression share perdido por presupuesto) o si el tope de la cuenta de Google es otro.
- Tope de presupuesto diario/mensual: dato pendiente de confirmación explícita por Mica -- ver cifra propuesta arriba.
- Negativas propias: además de `conocimiento/negativas-baseline.md`, evaluar excluir búsquedas de "outlet"/"usado" si la marca no vende second-hand (confirmar).
- Calendario de estacionalidad/promos específico: Hot Sale, Cyber, Final Sale, lanzamientos de temporada (otoño/invierno y verano) -- cruzar fechas exactas con `conocimiento/calendario-estacional.md` en cada edición.

### Auditoría real de la cuenta (2026-07-07, ventana 2026-06-01 a 2026-07-07)

- 148 campañas totales, **20 en estado ENABLED**, spend $5.319.998, 918 conversiones, $114.958.771 en ingresos, ROAS 21,6 blended (sujeto al riesgo de conversiones duplicadas señalado arriba).
- De las 20 `ENABLED`, **15 tienen spend $0** -- un patrón de leftover estacional mucho más marcado que en las otras cuentas: campañas nombradas para Sale Verano, Hot Sale, Día de la Madre, Cyber, Black Friday, Navidad 2025, todas con nombres tipo `N1/N2/N3 - (Temporada) - Canal` en Display/Video/Demand Gen/PMax. Es probable que esta sea la explicación real de por qué la cuenta "tiene" Display/Video/Demand Gen: se crearon para campañas de temporada específicas y nunca se pausaron ni se removieron al terminar la fecha. **Candidatas fuertes a una limpieza formal vía propuesta** (no se pausa nada sin `APROBADO`).
- Campañas con spend real (5 de las 20 activas):
  - `BUS - Marca - C` (Search): $3.299.960, ROAS 19,76, IS perdida por presupuesto 14,9% -- candidata a aumento de presupuesto.
  - `PMax - Top Sellers - Jun 2026`: $635.312, ROAS 18,98, IS perdida por presupuesto 15% -- candidata a aumento de presupuesto.
  - `P Max - Cupon ARGENTINA 20% OFF`: $264.082, ROAS 23,22, IS perdida por presupuesto 7,6%.
  - `PMax - Simona Fest`: $94.726, ROAS 13,39, IS perdida por presupuesto 17,2%.
  - `BUS - Simona Fest` (Search): $74.071, ROAS 2,79 -- **ROAS muy por debajo del resto de la cuenta**, candidata a revisar (keywords, landing, o si el nombre "Fest" corresponde a una promo ya vencida).
- 103 asset groups de PMax detectados (91 `ENABLED`) -- volumen alto, consistente con que PMax lleva tiempo en uso real pese a lo que decía la ficha.

## Canales activos

- Meta Ads: sí. Google Ads: sí (piloto de Ada). TikTok Ads: sí. Pinterest: sí. Email marketing: sí (Perfit). Otros: WhatsApp, Instagram, Facebook.

## Reglas importantes

- Qué NO inventar: promociones vigentes, acumulabilidad de descuentos, stock, talles disponibles, umbral de envío gratis, fechas exactas de campaña, CPA/ROAS objetivo (todo esto son "dato pendiente" hasta que Mica lo confirme para Google Ads específicamente).
- Qué siempre validar con Mica: promos vigentes, tope de presupuesto, si el tono debe sonar más juvenil o más adulto, cualquier propuesta de campaña nueva antes de generarla en detalle.
- Qué evitar: pujas o presupuestos agresivos hasta no tener CPA/ROAS objetivo confirmado.

## Pendientes de información

- [ ] Confirmar CPA/ROAS objetivo para Google Ads.
- [x] ~~Confirmar si Shopping/Performance Max están habilitados~~ -- resuelto por auditoría real 2026-07-07: la cuenta ya tiene Search, Display, PMax, Video y Demand Gen activos. Pendiente ahora: confirmar con Mica si esto fue decisión consciente.
- [ ] Resolver el riesgo de conversion actions duplicadas (`Purchase`, 3 variantes de "purchase" de GA4/Tiendanube) antes de confiar en el ROAS blended de 21,6x.
- [ ] Confirmar tope de presupuesto diario/mensual.
- [ ] Confirmar vigencia de envío gratis / cuotas / transferencia al momento de esta auditoría.
- [ ] Confirmar si $7,8M-$9,3M es el tope real de presupuesto de Google Ads para julio 2026 o solo una cifra de propuesta comercial.
- [ ] Aprobar o rechazar la propuesta de pausar las 15 campañas ENABLED con spend $0 (leftover de Sale Verano/Hot Sale/Día de la Madre/Cyber/Black Friday/Navidad 2025).
- [ ] Revisar por qué `BUS - Simona Fest` tiene ROAS 2,79, muy por debajo del resto de campañas activas de la cuenta (18-23x).
