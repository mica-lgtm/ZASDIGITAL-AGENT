# Playbook · Auditoría y actualización SEO masiva

Objetivo: cerrar los gaps de SEO/contenido del catálogo (títulos SEO, meta descriptions, descripciones de producto) que son quick wins de conversión y tráfico orgánico.

## 1. Auditar

```bash
python -m cli.dante bulk-seo <tienda> --dry-run
```

Salida: tabla de productos con flags `sin_seo_title`, `sin_seo_desc`, `sin_descripcion`, `descripcion_corta` (< 100 caracteres sin tags), `handle_vacio`.

Equivalente por código: `seo.auditar_seo_catalogo(client)`.

## 2. Redactar (tarea de Dante, no del CLI)

El CLI **no** auto-genera textos: SEO genérico sin voz de marca es de baja calidad. Dante redacta cada texto con:

- **seo_title**: ≤ 60 caracteres, keyword del producto + marca. Sin keyword stuffing.
- **seo_description**: ≤ 155 caracteres, beneficio concreto + CTA suave.
- **description** (si falta o es corta): HTML rico — bullets de beneficios, medidas/materiales, cuidados. Es contenido de conversión, no solo SEO.
- Español rioplatense, voseo si la marca lo usa, precios formato $1.290.

## 3. Aplicar

Por código (preferido para lotes):

```python
from tn.tiendas import tienda
from tn import seo

client = tienda("piloto")
seo.bulk_actualizar_seo(client, [
    {"id": 123, "seo_title": "Alfombra Yute Natural 2x3 | Marca", "seo_description": "..."},
    {"id": 124, "seo_description": "...", "handle": "cuadro-abstracto-60x90"},
])
```

O producto por producto vía MCP: `actualizar_seo_producto(...)`.

El rate-limit (~40 req/min) lo absorbe el client con retry en 429; los lotes grandes simplemente tardan.

## 4. Medir

Es un cambio de catálogo, no un experimento A/B: documentar como EXP con ventana antes/después (`metricas.comparar_ventanas()`) a 30 días, y registrar en `aprendizajes.md`.
