


# Spec: Landing de Conversión — Alfombra Algodón Crudo · Magnolias Deco

**Fecha:** 2026-06-25
**Experimento:** EXP-001
**Tienda:** Magnolias Deco (`magnoliasdeco.com.ar`)
**Producto:** Alfombra Algodón Crudo (ID: 134409509)

---

## Objetivo

Crear una landing de conversión alta para público caliente (tráfico de ads Meta). Diseño completamente diferente a la PDP actual de TN. React + Vercel, checkout en TN nativo vía cart permalink.

**Hipótesis:** Una landing sin distracciones, con selector de medida prominente y CTA directo al checkout, convierte mejor que la PDP estándar de TN para tráfico caliente de Meta Ads.

**Métrica objetivo:** Tasa de conversión de la landing (clicks CTA / visitantes únicos). Baseline: conversión actual de la PDP de TN.

---

## Producto

| Campo | Valor |
|-------|-------|
| Nombre | Alfombra Algodón Crudo |
| ID TN | 134409509 |
| URL actual | magnoliasdeco.com.ar/productos/alfombra-algodon-crudo/ |

### Variantes con stock

| Medida | Precio | Stock | Variant ID |
|--------|--------|-------|------------|
| 45x60 | $12.990 | 263 | 525296880 |
| 110x60 | $18.990 | 304 | 571696664 |
| 200x60 | $33.990 | 40 | 525296884 |
| 160x120 | $48.990 | 14 | 577598652 |

### Imágenes (TN CDN)
13 imágenes disponibles. Hero = imagen 1. Galería = imágenes 2–7.

---

## Arquitectura y flujo

```
[Anuncio Meta] → [landing.magnoliasdeco.com.ar] → [Selector medida] → [Cart permalink TN] → [Checkout TN nativo]
```

El usuario nunca sale del ecosistema TN para pagar. La landing es solo la entrada.

**Cart permalink:** `https://www.magnoliasdeco.com.ar/checkout/cart?add={VARIANT_ID}&quantity=1`

**Sin fetch en carga:** el contenido del producto está hardcodeado en el bundle. Carga instantánea. Solo el stock hace un fetch async a `/api/stock` (no bloquea render).

---

## Layout (mobile-first)

1. **Header mínimo** — logo Magnolias centrado, sin navegación
2. **Hero** — foto full-width ratio 4:5 (imagen 1 del producto)
3. **Buy Block:**
   - Nombre del producto (Elms Sans Black, h1)
   - Precio dinámico según medida seleccionada
   - Selector de medidas: chips horizontales, activo = rojo `#B32626`
   - Botón "COMPRAR AHORA" full-width, rojo, → cart permalink
   - Contador de stock ("Quedan X disponibles") — se actualiza con la medida
4. **Trust Strip** — 3 íconos: Envío a todo el país / Pago seguro / Devolución simple
5. **Galería** — grid 2 columnas, 6 fotos del producto
6. **Beneficios** — 3 bullets: Natural y artesanal / Suave y liviana / Combina con todo
7. **Segundo CTA** — mismo botón rojo, refuerzo al pie
8. **Footer** — logo + link a magnoliasdeco.com.ar

---

## Stack técnico

- **React 18 + Vite** — bundle objetivo < 80kb gzipped
- **CSS variables** — design system Magnolias (tokens.css), sin Tailwind ni UI libs
- **Elms Sans** — fonts bundleados como assets estáticos
- **Vercel** — deploy desde `dante-desarrollo-tn/`, subdominio `landing.magnoliasdeco.com.ar`
- **Serverless `/api/stock`** — Vercel function, consulta TN API server-side (token no expuesto al browser)

### Estructura de archivos

```
front/magnolias_deco/EXP-001-landing-alfombra/
├── index.html
├── vite.config.js
├── package.json
├── vercel.json
├── public/fonts/          ← Elms Sans (copiados de assets-clientes)
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── Hero.jsx
│   │   ├── BuyBlock.jsx
│   │   ├── TrustStrip.jsx
│   │   ├── Gallery.jsx
│   │   └── Benefits.jsx
│   ├── data/product.js    ← variantes, imágenes, precios hardcodeados
│   └── styles/tokens.css  ← design system Magnolias
└── api/
    └── stock.js           ← Vercel serverless, GET /api/stock?variant_id=X
```

---

## Design system (Magnolias)

| Token | Valor |
|-------|-------|
| `--bg` | `#F8F3EA` (off-white cálido) |
| `--accent` | `#B32626` (rojo CTA) |
| `--accent-hover` | `#8F1D1D` |
| `--fg1` | `#0A0A0A` (títulos) |
| `--fg2` | `#1F1F1F` (body) |
| `--font-sans` | Elms Sans |
| `--border` | `#E2D7C6` |

---

## Registro del experimento

```
experimentos/magnolias_deco/EXP-001-landing-alfombra/
├── brief.md         ← hipótesis, audience, producto, URL
├── implementacion.md
└── resultado.md     ← a completar post-lanzamiento
```

---

## Rollback

Nada que revertir en la tienda TN — la landing es externa. Para bajar: despausar el anuncio o cambiar la URL de destino del ad.

---

## Pendiente post-deploy

- [ ] Configurar DNS subdominio `landing.magnoliasdeco.com.ar` en Vercel
- [ ] Agregar `DANTE_MAGNOLIAS_DECO_TOKEN` como env var en Vercel (para `/api/stock`)
- [ ] Medir conversión vs PDP original durante 7 días mínimo
- [ ] Registrar resultado en `experimentos/magnolias_deco/EXP-001-landing-alfombra/resultado.md`
