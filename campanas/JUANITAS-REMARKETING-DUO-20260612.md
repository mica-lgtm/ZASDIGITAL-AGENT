# Juanitas · 2 Campañas de Remarketing · 2026-06-12

**Estado: PROPUESTA**
Cuenta destino de la prueba: `1137471693099903` (cuenta de test fondeada, indicada por Mica — no analizada, solo destino de subida).
Cuenta analizada: `1250953146394306` · "Juanitas | Meta Partner" (principal minorista validada).

---

## 1. Diagnóstico (datos reales, con fuente y período)

**Fuente: MCP de Meta + CSV del Drive (`Juanitas-Meta-Partner-May-1-2026-al-May-31-2026.csv`).**

Cuenta completa, últimos 30 días (13-may → 11-jun-2026): inversión $12.413.400, 816 compras, CPA $15.213, ROAS 4,58, CPM $4.727, CTR 3,22%.

Historial de remarketing (ventana 14-mar → 11-jun-2026, nivel conjunto):

| Campaña | Audiencia usada | Inversión | Compras | CPA | ROAS | CPM |
|---|---|---|---|---|---|---|
| RMK - Cupón LOQUIERO5 - Placas | VC, ATC e IC **30D** menos PUR 30D | $70.110 | 10 | $7.011 | **10,48** | $4.860 |
| RMK - Catalogo - Testeo Publicos (always-on, activa) | VC, ATC e IC **45D** menos PUR 30D | $103.569 | 8 | $12.946 | **5,01** | $3.925 |
| RMK - HOT DAYS 2026 - Catalogo | VC, ATC e IC **7D** menos PUR 30D | $119.022 | 3 | $39.674 | **1,95** | $10.024 |
| CD - Promo x2 Camisetas - Cupón | ATC, IC y VW **14D** | $65.322 | 3 | $21.774 | 2,35 | $6.731 |

(VC = vista de contenido, ATC = carrito, IC = checkout iniciado, PUR = compradoras, VW = visitantes web.)

**Hallazgos confirmados:**
1. El remarketing es hoy ~2,4% del gasto de la cuenta ($293k de $12,4M en 30d). Está subinvertido frente al 25% de referencia de la estructura base ecommerce.
2. La fórmula que funcionó: **ventana amplia (30-45D) excluyendo compradoras 30D**. Con cupón + urgencia (LOQUIERO5) hizo ROAS 10,48; como catálogo always-on, 5,01. Ambas con frecuencia sana (2,3-3,0).
3. Las ventanas cortas (7D y 14D) fracasaron: audiencia chica → CPM se dispara ($10.000-18.800 según el CSV de mayo) y el ROAS cae a 1,95-2,84. No repetir.
4. **No existe ninguna campaña de recompra a compradoras**: todas las RMK excluyen PUR 30D y ninguna apunta a clientas pasadas. La ficha marca la recompra como la oportunidad #1 (producto de reposición, ciclo 60/90/120 días, ticket promedio ~$67.138 ene-abr según ficha).
5. Hay una RMK activa en aprendizaje ("RMK - Cupón LOQUIERO5 FINDE LARGO", audiencia 30D) — la propuesta no compite con ella en la cuenta real sin antes revisarla.

---

## 2. Objetivo y métrica de éxito

- **Campaña A (funnel caliente):** ventas. Éxito = ROAS ≥ 6 y CPA ≤ $15.000 a los 14 días (entre el 5,01 del always-on y el 10,48 del cupón).
- **Campaña B (recompra):** ventas a clientas. No hay benchmark previo (es el gap) → test para validar: éxito inicial = CPA ≤ CPA de cuenta ($15.213) con ROAS ≥ 4,58 a los 14 días.

## 3. Estrategia

- **A — Funnel caliente:** recuperar a quienes vieron producto / cargaron carrito / iniciaron checkout en los últimos 30-45 días y no compraron. Oferta: cupón con urgencia real (validado: es el formato de mayor ROAS de la cuenta) + respuesta a objeciones de talle/cambios (dolores #1 de la ficha). Ventana 30D vs 45D como A/B de volumen.
- **B — Recompra "Renová tu cajón":** compradoras de 60-180 días (ciclo de reposición cumplido) y dormidas de 180-365 días (winback). Ángulo: packs x3/x6/x12 y reposición ("tu cajón te lo estaba pidiendo"). Excluye compradoras de los últimos 60 días para no quemar.
- **Timing:** always-on, revisión a 14 días post-aprendizaje. Sin fecha fin.

## 4. Estructura

### Campaña A · `JUANITAS_META_REMARKETING_FUNNEL-CALIENTE_JUN2026`
Objetivo: OUTCOME_SALES · CBO · Presupuesto sugerido: **8% del gasto diario de la cuenta** (~$33.000/día sobre el run-rate actual de $414k/día — supuesto, ajustable). Para la PRUEBA en cuenta test: $5.000/día, PAUSADA.

| Conjunto | Audiencia | Región | Anuncios |
|---|---|---|---|
| `VC-ATC-IC-30D_RMK-CALIENTE_ARG` | VC+ATC+IC 30D, excl. PUR 30D | ARG excl. Tierra del Fuego | 3 placas + 1 carrusel |
| `VC-ATC-IC-45D_RMK-CALIENTE_ARG` | VC+ATC+IC 45D, excl. PUR 30D | ARG excl. Tierra del Fuego | mismos anuncios |

Anuncios (URL: https://juanitas.ar/ · UTM: `utm_source=meta&utm_medium=paid&utm_campaign=juanitas_rmk_funnel-caliente_jun2026&utm_content=[anuncio]`):

1. `PLACA_CUPON-URGENCIA_GENERAL_V1` — Hook: "Lo dejaste en el carrito. Tu cajón te lo estaba pidiendo." + cupón **LOQUIERO5** + envío gratis a partir de $50.000. CTA: "Usá tu cupón".
2. `PLACA_OBJECION-TALLES_GENERAL_V1` — Hook: "¿Dudas con el talle? Te ayudamos a elegir." Responde la objeción #1 (guía de talles + cambios). Bonus: envío gratis desde $50.000. CTA: "Encontrá tu talle".
3. `PLACA_RECORDATORIO_PACKS_V1` — Hook: "Seguís a una bombacha de distancia de renovar tu cajón." Beneficio packs. CTA: "Terminá tu compra".
4. `CARRUSEL_CATALOGO_MAS-VENDIDOS_V1` — Carrusel de más vendidos (colaless tiro alto, packs). Réplica del formato always-on que hace ROAS 5,01.

Apuesta A/B: gana la placa de cupón (es el patrón LOQUIERO5, ROAS 10,48); la de talles debería ganar en CTR aunque convierta menos directo.

### Campaña B · `JUANITAS_META_RECOMPRA_RENOVA-TU-CAJON_JUN2026`
Objetivo: OUTCOME_SALES · CBO · Presupuesto sugerido: **4% del gasto diario** (~$16.500/día — supuesto). Para la PRUEBA: $5.000/día, PAUSADA.

| Conjunto | Audiencia | Región | Anuncios |
|---|---|---|---|
| `PUR-60-180D_RECOMPRA_ARG` | Compradoras 180D, excl. PUR 60D | ARG excl. Tierra del Fuego | 3 placas |
| `PUR-180-365D_WINBACK_ARG` | Compradoras 365D, excl. PUR 180D | ARG excl. Tierra del Fuego | mismas placas |

Anuncios (UTM campaign: `juanitas_recompra_renova-tu-cajon_jun2026`):

1. `PLACA_RECOMPRA_CAJON_V1` — Hook: "¿Hace cuánto no renovás tu cajón?" (frase winback de la ficha). Packs x3/x6. CTA: "Renovalo ahora".
2. `PLACA_CROSSSELL_PACKX6_V1` — Hook: "Si el pack x3 te quedó corto, pasá al x6." Cross-sell por historial. CTA: "Subí de pack".
3. `PLACA_EMOCIONAL_COMODIDAD_V1` — Hook: "Las que ya eligieron Juanitas, saben." Prueba social + comodidad diaria. CTA: "Volvé por más".

Apuesta A/B: gana `PLACA_RECOMPRA_CAJON_V1` en el conjunto 60-180D (mensaje calza justo con el ciclo de reposición).

## 5. Creativos

Copys finales: los de la sección 4. Imágenes: se generan con `banana` en formatos 1:1 y 9:16 y se guardan en `creativos/juanitas-remarketing-duo/` **después de que Mica confirme cupón, umbral de envío gratis y política de cambios** (regla: no publicar promos sin validación). Las placas que no dependen de promos pueden generarse de inmediato si Mica lo pide.

## 6. Métricas a monitorear

- **24/48/72hs:** entrega activa, CPM (alerta si supera ~$8.000 en RMK, señal de audiencia chica — patrón HOT DAYS), frecuencia (alerta > 4).
- **7 días:** CPA y ROAS vs. métrica de éxito; CTR de cada placa para el A/B.
- **Post-aprendizaje (14 días):** decidir escala (si A supera ROAS 6, subir hacia el 25% de referencia gradualmente; si B valida CPA, es la prueba de que la recompra paga y se documenta como benchmark nuevo).

## 7. Notas de la prueba

- La cuenta de test `1137471693099903` **tiene el píxel de Juanitas conectado** (confirmado por Mica 2026-06-12). Las audiencias de sitio (VC/ATC/IC) y de compradoras se pueden usar tal cual están documentadas.
- No pisa a "RMK - Cupón LOQUIERO5 FINDE LARGO" (confirmado por Mica 2026-06-12).
- Todo se sube **PAUSADO** y en estado borrador. Nada se activa sin "ACTIVAR [campaña]".

## 8. Datos confirmados por Mica (2026-06-12)

1. ✅ Cupón: **LOQUIERO5**
2. ✅ Envío gratis: a partir de **$50.000**
3. ✅ No pisa a "RMK - Cupón LOQUIERO5 FINDE LARGO"
4. ✅ Píxel de Juanitas conectado en la cuenta test `1137471693099903`

---

## 9. IDs de Meta (cuenta test `1137471693099903`) · Estado: SUBIDA PAUSADA ✅

> Subido 2026-06-12. Todo en estado PAUSED. Para activar: "ACTIVAR [nombre de campaña]".

### Campaña A · `JUANITAS_META_REMARKETING_FUNNEL-CALIENTE_JUN2026`
**Campaign ID:** `120252164254610428`

| Conjunto | ID |
|---|---|
| `VC-ATC-IC-30D_RMK-CALIENTE_ARG` | `120252165771810428` |
| `VC-ATC-IC-45D_RMK-CALIENTE_ARG` | `120252165773910428` |

| Anuncio | Conjunto | Ad ID | Creative ID |
|---|---|---|---|
| PLACA_CUPON-URGENCIA_GENERAL_V1 | 30D | `120252166923730428` | `1533899528090476` |
| PLACA_OBJECION-TALLES_GENERAL_V1 | 30D | `120252166927710428` | `1085910567331421` |
| PLACA_RECORDATORIO_PACKS_V1 | 30D | `120252166960830428` | `1018893137246866` |
| CARRUSEL_CATALOGO_MAS-VENDIDOS_V1 | 30D | `120252166971730428` | `1869256611145336` |
| PLACA_CUPON-URGENCIA_GENERAL_V1 | 45D | `120252167488840428` | `1533899528090476` |
| PLACA_OBJECION-TALLES_GENERAL_V1 | 45D | `120252167492780428` | `1085910567331421` |
| PLACA_RECORDATORIO_PACKS_V1 | 45D | `120252167495680428` | `1018893137246866` |
| CARRUSEL_CATALOGO_MAS-VENDIDOS_V1 | 45D | `120252167498000428` | `1869256611145336` |

### Campaña B · `JUANITAS_META_RECOMPRA_RENOVA-TU-CAJON_JUN2026`
**Campaign ID:** `120252164483340428`

| Conjunto | ID |
|---|---|
| `PUR-60-180D_RECOMPRA_ARG` | `120252165774810428` |
| `PUR-180-365D_WINBACK_ARG` | `120252165778180428` |

| Anuncio | Conjunto | Ad ID | Creative ID |
|---|---|---|---|
| PLACA_RECOMPRA_CAJON_V1 | 60-180D | `120252167499330428` | `1643275333596749` |
| PLACA_CROSSSELL_PACKX6_V1 | 60-180D | `120252167501680428` | `2728696477505941` |
| PLACA_EMOCIONAL_COMODIDAD_V1 | 60-180D | `120252167503890428` | `2540551889712056` |
| PLACA_RECOMPRA_CAJON_V1 | 180-365D | `120252167506090428` | `1643275333596749` |
| PLACA_CROSSSELL_PACKX6_V1 | 180-365D | `120252167508990428` | `2728696477505941` |
| PLACA_EMOCIONAL_COMODIDAD_V1 | 180-365D | `120252167512360428` | `2540551889712056` |

### Antes de pasar a la cuenta real, completar manualmente en Ads Manager:
1. **Audiencias custom** en cada conjunto (VC+ATC+IC 30D/45D, Compradoras 60-180D/180-365D con exclusiones correspondientes) — no disponibles en cuenta test sin tráfico real suficiente.
2. **Exclusión Tierra del Fuego** — agregar como `excluded_geo_locations` en targeting de cada adset.
3. **Imágenes finales** — reemplazar imagen de prueba con los creativos exportados de `creativos/juanitas-remarketing-duo/creativos.html` (7 placas).
4. **Carrusel real** — el ad `CARRUSEL_CATALOGO_MAS-VENDIDOS_V1` fue subido como placa; reconvertir a carrusel catálogo con `product_set_id` del catálogo Juanitas.

---

**Estado: SUBIDA PAUSADA ✅ · Para activar: "ACTIVAR JUANITAS_META_REMARKETING_FUNNEL-CALIENTE_JUN2026" o "ACTIVAR JUANITAS_META_RECOMPRA_RENOVA-TU-CAJON_JUN2026"**
