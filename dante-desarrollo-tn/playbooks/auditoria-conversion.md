# Playbook · Auditoría de conversión inicial

Atajo: `python -m cli.dante audit <tienda>` corre los pasos 1-4 de una.

1. **Estado real:** `snapshot.snapshot_completo(client)` → info, catálogo, scripts activos, métricas de 30 días y calidad de catálogo. Nunca razonar de memoria.
2. **Funnel:** `abandono.resumen_abandono(client, desde)` → tasa de abandono checkout→compra; `abandono.valor_abandonado()` → ARG$ en riesgo; `abandono.productos_mas_abandonados()` → dónde enfocar.
3. **Baseline:** `metricas.resumen_ventana()` del último mes (pedidos, ingresos, AOV) y `metricas.rendimiento_por_producto()` → qué vende de verdad.
4. **Quick wins de catálogo:** `seo.auditar_seo_catalogo(client)` → productos sin descripción/SEO (ver `playbooks/bulk-seo.md`).
5. **Diagnóstico de madurez:** aplicar el árbol de decisión de CLAUDE.md (tienda nueva → catálogo primero; con tráfico y CVR bajo → LIFT en PDP; CVR ok y AOV bajo → bundles/cross-sell; si el lever es tráfico → escalarlo a Mica).
6. **Hipótesis:** listar 3-5 mejoras y puntuarlas con **ICE** (Impact, Confidence, Ease — ver CLAUDE.md). Solo se ejecuta ICE ≥ 7.
7. Cada hipótesis elegida se convierte en un experimento con `experimentos/_PLANTILLA.md`.
