# EXP-NNN · <slug> · <tienda>

## brief
- **Hipótesis:** Si <cambio>, entonces <métrica> mejora porque <razón>.
- **Métrica objetivo:** <conversión | AOV | clics CTA | carritos>.
- **Diseño del test:** <A/B por cupón/UTM | ventana antes/después>.
- **Criterio de éxito:** <umbral concreto, p. ej. +X% en métrica>.
- **Plan de rollback:** borrar script_id / revertir cambio.

## implementacion
- **Fecha publicación:** YYYY-MM-DD
- **Archivos front:** `front/<tienda>/<exp>/variant.js`
- **URL hosteada:** <url pública>
- **script_id(s):** <ids devueltos por la Scripts API>
- **Qué hace:** <descripción técnica del cambio>

## resultado
- **Ventana medida:** <desde> → <hasta>
- **Antes:** pedidos / ingresos / AOV
- **Después:** pedidos / ingresos / AOV
- **Veredicto:** GANA | PIERDE | NEUTRO
- **Aprendizaje:** <qué nos enseñó; se destila a aprendizajes.md>
