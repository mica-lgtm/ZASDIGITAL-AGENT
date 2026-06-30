# Landing Alfombra Algodón Crudo — Magnolias Deco Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una landing React de conversión alta para la Alfombra Algodón Crudo de Magnolias Deco, con selector de medida, precio dinámico, stock en tiempo real vía Vercel serverless, y checkout directo a TN.

**Architecture:** React 18 + Vite SPA hosteada en Vercel (`landing.magnoliasdeco.com.ar`). El contenido del producto está hardcodeado en el bundle (carga instantánea). El stock se fetcha async desde `/api/stock` (Vercel serverless que consulta TN API con token server-side). El CTA apunta a `magnoliasdeco.com.ar/comprar/{variant_id}` — checkout nativo TN.

**Tech Stack:** React 18, Vite 5, Vitest + @testing-library/react, CSS variables (design system Magnolias), Vercel (SPA + serverless), Elms Sans (font local bundleada).

**Rutas importantes:**
- Proyecto: `dante-desarrollo-tn/front/magnolias_deco/EXP-001-landing-alfombra/`
- Todos los comandos se corren desde esa carpeta salvo que se indique lo contrario
- Fuente de fonts: `madame-social-content-manager/assets-clientes/magnolias-deco/fonts/`

---

## Datos del producto (referencia rápida)

```js
// Cart permalink format (de tn/checkout.py):
// https://www.magnoliasdeco.com.ar/comprar/{variant_id}

const VARIANTS = [
  { id: 525296880, label: '45×60',   price: 12990, stock: 263 },
  { id: 571696664, label: '110×60',  price: 18990, stock: 304 },
  { id: 525296884, label: '200×60',  price: 33990, stock: 40  },
  { id: 577598652, label: '160×120', price: 48990, stock: 14  },
]

const IMAGES = [
  'https://acdn-us.mitiendanube.com/stores/002/238/751/products/img_9932-c6cd1d4768731f7ace17209965505693-1024-1024.jpg',
  'https://acdn-us.mitiendanube.com/stores/002/238/751/products/20220924_133418-1-a149f29bd9084724d116640463580693-1024-1024.jpg',
  'https://acdn-us.mitiendanube.com/stores/002/238/751/products/20220924_142750-3-fbd5460af72d58758716640453936495-1024-1024.jpg',
  'https://acdn-us.mitiendanube.com/stores/002/238/751/products/20220924_152529-829746a21d3b82232e16640450482476-1024-1024.jpg',
  'https://acdn-us.mitiendanube.com/stores/002/238/751/products/20220924_131755-1-c29b5209b32d1cf84316640464982589-1024-1024.jpg',
  'https://acdn-us.mitiendanube.com/stores/002/238/751/products/20220924_141201-45fd6d0d8b6f556b6416640450482626-1024-1024.jpg',
]
```

---

## File Map

| Archivo | Responsabilidad |
|---------|----------------|
| `package.json` | Deps: react, vite, vitest, testing-library |
| `vite.config.js` | Build config + test config (jsdom) |
| `index.html` | Entry point HTML |
| `vercel.json` | Deploy config: SPA + serverless `/api/stock` |
| `public/fonts/*.ttf` | Elms Sans (copiados de assets-clientes) |
| `src/styles/tokens.css` | Design system Magnolias (colores, tipografía, spacing) |
| `src/data/product.js` | Variantes, imágenes, textos — fuente de verdad del bundle |
| `src/components/Hero.jsx` | Foto full-width hero |
| `src/components/BuyBlock.jsx` | Selector medida + precio dinámico + CTA checkout |
| `src/components/TrustStrip.jsx` | 3 trust signals |
| `src/components/Gallery.jsx` | Grid 2 columnas de fotos |
| `src/components/Benefits.jsx` | 3 bullets de beneficios |
| `src/App.jsx` | Ensambla todos los componentes + maneja estado de variante activa |
| `src/main.jsx` | Entry point React |
| `src/test/setup.js` | Setup de @testing-library/jest-dom |
| `api/stock.js` | Vercel serverless: consulta TN API, devuelve stock por variant_id |

---

## Task 1: Scaffold del proyecto + setup de tests

**Files:**
- Create: `front/magnolias_deco/EXP-001-landing-alfombra/package.json`
- Create: `front/magnolias_deco/EXP-001-landing-alfombra/vite.config.js`
- Create: `front/magnolias_deco/EXP-001-landing-alfombra/index.html`
- Create: `front/magnolias_deco/EXP-001-landing-alfombra/src/test/setup.js`
- Create: `front/magnolias_deco/EXP-001-landing-alfombra/public/fonts/` (copiar fonts)

- [ ] **Crear la carpeta del proyecto**

```bash
mkdir -p front/magnolias_deco/EXP-001-landing-alfombra/{src/{components,data,styles,test},public/fonts,api}
```

- [ ] **Crear `package.json`**

```json
{
  "name": "magnolias-landing-alfombra",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.1",
    "vite": "^5.3.4",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Crear `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
```

- [ ] **Crear `src/test/setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Crear `index.html`**

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Alfombra Algodón Crudo — Magnolias</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Copiar fonts de Elms Sans**

```bash
# Desde la raíz del repo dante-desarrollo-tn:
cp ../madame-social-content-manager/assets-clientes/magnolias-deco/fonts/*.ttf \
   front/magnolias_deco/EXP-001-landing-alfombra/public/fonts/
```

Verificar que estén los 11 archivos .ttf:
```bash
ls front/magnolias_deco/EXP-001-landing-alfombra/public/fonts/
# Expected: ElmsSans-Black.ttf  ElmsSans-Bold.ttf  ElmsSans-Regular.ttf  etc.
```

- [ ] **Instalar dependencias**

```bash
cd front/magnolias_deco/EXP-001-landing-alfombra
npm install
```

- [ ] **Verificar que el test runner arranca**

```bash
# Crear un test placeholder para verificar setup
cat > src/test/setup.test.js << 'EOF'
describe('setup', () => {
  it('jest-dom matchers are available', () => {
    const div = document.createElement('div')
    expect(div).toBeDefined()
  })
})
EOF
npm test
```

Expected output: `1 test passed`

- [ ] **Commit**

```bash
git add front/magnolias_deco/EXP-001-landing-alfombra/
git commit -m "feat(EXP-001): scaffold React+Vite landing alfombra magnolias"
```

---

## Task 2: Design tokens CSS

**Files:**
- Create: `src/styles/tokens.css`

- [ ] **Crear `src/styles/tokens.css`**

```css
@font-face {
  font-family: "Elms Sans";
  src: url("/fonts/ElmsSans-ExtraLight.ttf") format("truetype");
  font-weight: 200; font-display: swap;
}
@font-face {
  font-family: "Elms Sans";
  src: url("/fonts/ElmsSans-Light.ttf") format("truetype");
  font-weight: 300; font-display: swap;
}
@font-face {
  font-family: "Elms Sans";
  src: url("/fonts/ElmsSans-Regular.ttf") format("truetype");
  font-weight: 400; font-display: swap;
}
@font-face {
  font-family: "Elms Sans";
  src: url("/fonts/ElmsSans-Medium.ttf") format("truetype");
  font-weight: 500; font-display: swap;
}
@font-face {
  font-family: "Elms Sans";
  src: url("/fonts/ElmsSans-SemiBold.ttf") format("truetype");
  font-weight: 600; font-display: swap;
}
@font-face {
  font-family: "Elms Sans";
  src: url("/fonts/ElmsSans-Bold.ttf") format("truetype");
  font-weight: 700; font-display: swap;
}
@font-face {
  font-family: "Elms Sans";
  src: url("/fonts/ElmsSans-ExtraBold.ttf") format("truetype");
  font-weight: 800; font-display: swap;
}
@font-face {
  font-family: "Elms Sans";
  src: url("/fonts/ElmsSans-Black.ttf") format("truetype");
  font-weight: 900; font-display: swap;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --red:          #B32626;
  --red-dark:     #8F1D1D;
  --red-soft:     #F5E7E4;
  --black:        #0A0A0A;
  --charcoal:     #1F1F1F;
  --white:        #FFFFFF;
  --offwhite:     #F8F3EA;
  --beige:        #E9D8C3;
  --sand:         #D8BFA3;
  --wood:         #B98A5F;
  --warm-gray:    #BEB7AE;

  --bg:           var(--offwhite);
  --bg-alt:       var(--beige);
  --fg1:          var(--black);
  --fg2:          var(--charcoal);
  --fg3:          #5A544C;
  --accent:       var(--red);
  --accent-hover: var(--red-dark);
  --border:       #E2D7C6;

  --font-sans: "Elms Sans", "Helvetica Neue", Arial, sans-serif;

  --space-1: 4px;  --space-2: 8px;   --space-3: 12px;
  --space-4: 16px; --space-5: 24px;  --space-6: 32px;
  --space-7: 48px; --space-8: 64px;  --space-9: 96px;

  --radius-sm: 4px; --radius-md: 8px;
  --radius-lg: 16px; --radius-pill: 999px;

  --shadow-sm: 0 1px 3px rgba(40,28,16,.06);
  --shadow-md: 0 6px 20px rgba(40,28,16,.08);
}

html, body {
  background: var(--bg);
  color: var(--fg1);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Commit**

```bash
git add front/magnolias_deco/EXP-001-landing-alfombra/src/styles/tokens.css
git commit -m "feat(EXP-001): design tokens Magnolias (Elms Sans + colores)"
```

---

## Task 3: Datos del producto

**Files:**
- Create: `src/data/product.js`
- Create: `src/data/product.test.js`

- [ ] **Escribir el test primero**

```js
// src/data/product.test.js
import { PRODUCT, VARIANTS, IMAGES, STORE_URL } from './product.js'

describe('product data', () => {
  it('tiene exactamente 4 variantes con stock > 0', () => {
    const conStock = VARIANTS.filter(v => v.stock > 0)
    expect(conStock).toHaveLength(4)
  })

  it('cada variante tiene id, label, price y stock', () => {
    for (const v of VARIANTS) {
      expect(v.id).toBeTypeOf('number')
      expect(v.label).toBeTypeOf('string')
      expect(v.price).toBeTypeOf('number')
      expect(v.stock).toBeTypeOf('number')
    }
  })

  it('tiene al menos 6 imágenes', () => {
    expect(IMAGES.length).toBeGreaterThanOrEqual(6)
  })

  it('cart permalink format es correcto', () => {
    const v = VARIANTS[0]
    expect(`${STORE_URL}/comprar/${v.id}`).toBe(
      'https://www.magnoliasdeco.com.ar/comprar/525296880'
    )
  })
})
```

- [ ] **Correr el test — debe fallar**

```bash
npm test -- src/data/product.test.js
```

Expected: FAIL — `Cannot find module './product.js'`

- [ ] **Crear `src/data/product.js`**

```js
export const STORE_URL = 'https://www.magnoliasdeco.com.ar'

export const PRODUCT = {
  name: 'Alfombra Algodón Crudo',
  description: 'Textura suave y tono crudo para vestir tu casa con calma. Tejido artesanal que aporta calidez sin recargar.',
}

export const VARIANTS = [
  { id: 525296880, label: '45×60',   price: 12990, stock: 263 },
  { id: 571696664, label: '110×60',  price: 18990, stock: 304 },
  { id: 525296884, label: '200×60',  price: 33990, stock: 40  },
  { id: 577598652, label: '160×120', price: 48990, stock: 14  },
]

export const IMAGES = [
  'https://acdn-us.mitiendanube.com/stores/002/238/751/products/img_9932-c6cd1d4768731f7ace17209965505693-1024-1024.jpg',
  'https://acdn-us.mitiendanube.com/stores/002/238/751/products/20220924_133418-1-a149f29bd9084724d116640463580693-1024-1024.jpg',
  'https://acdn-us.mitiendanube.com/stores/002/238/751/products/20220924_142750-3-fbd5460af72d58758716640453936495-1024-1024.jpg',
  'https://acdn-us.mitiendanube.com/stores/002/238/751/products/20220924_152529-829746a21d3b82232e16640450482476-1024-1024.jpg',
  'https://acdn-us.mitiendanube.com/stores/002/238/751/products/20220924_131755-1-c29b5209b32d1cf84316640464982589-1024-1024.jpg',
  'https://acdn-us.mitiendanube.com/stores/002/238/751/products/20220924_141201-45fd6d0d8b6f556b6416640450482626-1024-1024.jpg',
]

export function cartUrl(variantId) {
  return `${STORE_URL}/comprar/${variantId}`
}
```

- [ ] **Correr el test — debe pasar**

```bash
npm test -- src/data/product.test.js
```

Expected: `4 tests passed`

- [ ] **Commit**

```bash
git add src/data/
git commit -m "feat(EXP-001): product data con variantes y URLs de imágenes"
```

---

## Task 4: Componente Hero

**Files:**
- Create: `src/components/Hero.jsx`
- Create: `src/components/Hero.test.jsx`

- [ ] **Escribir el test primero**

```jsx
// src/components/Hero.test.jsx
import { render, screen } from '@testing-library/react'
import Hero from './Hero.jsx'

const IMG = 'https://example.com/alfombra.jpg'

describe('Hero', () => {
  it('muestra la imagen hero', () => {
    render(<Hero src={IMG} alt="Alfombra Algodón Crudo" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', IMG)
    expect(img).toHaveAttribute('alt', 'Alfombra Algodón Crudo')
  })
})
```

- [ ] **Correr el test — debe fallar**

```bash
npm test -- src/components/Hero.test.jsx
```

Expected: FAIL — `Cannot find module './Hero.jsx'`

- [ ] **Crear `src/components/Hero.jsx`**

```jsx
export default function Hero({ src, alt }) {
  return (
    <div style={{
      width: '100%',
      aspectRatio: '4/5',
      overflow: 'hidden',
      background: 'var(--beige)',
    }}>
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
        loading="eager"
        fetchpriority="high"
      />
    </div>
  )
}
```

- [ ] **Correr el test — debe pasar**

```bash
npm test -- src/components/Hero.test.jsx
```

Expected: `1 test passed`

- [ ] **Commit**

```bash
git add src/components/Hero.jsx src/components/Hero.test.jsx
git commit -m "feat(EXP-001): Hero component"
```

---

## Task 5: Componente BuyBlock (core de conversión)

**Files:**
- Create: `src/components/BuyBlock.jsx`
- Create: `src/components/BuyBlock.test.jsx`

Este es el componente central: selector de medida → precio dinámico → CTA al checkout.

- [ ] **Escribir los tests primero**

```jsx
// src/components/BuyBlock.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BuyBlock from './BuyBlock.jsx'

const VARIANTS = [
  { id: 111, label: '45×60',   price: 12990, stock: 263 },
  { id: 222, label: '110×60',  price: 18990, stock: 304 },
]

describe('BuyBlock', () => {
  it('muestra el nombre del producto', () => {
    render(<BuyBlock name="Alfombra Algodón Crudo" variants={VARIANTS} stockMap={{}} />)
    expect(screen.getByRole('heading')).toHaveTextContent('Alfombra Algodón Crudo')
  })

  it('muestra el precio de la primera variante por defecto', () => {
    render(<BuyBlock name="Alfombra" variants={VARIANTS} stockMap={{}} />)
    expect(screen.getByTestId('precio')).toHaveTextContent('$12.990')
  })

  it('actualiza el precio al seleccionar otra medida', async () => {
    const user = userEvent.setup()
    render(<BuyBlock name="Alfombra" variants={VARIANTS} stockMap={{}} />)
    await user.click(screen.getByRole('button', { name: '110×60' }))
    expect(screen.getByTestId('precio')).toHaveTextContent('$18.990')
  })

  it('el CTA apunta al checkout de la variante seleccionada', async () => {
    const user = userEvent.setup()
    render(<BuyBlock name="Alfombra" variants={VARIANTS} stockMap={{}} />)
    expect(screen.getByRole('link', { name: /comprar/i })).toHaveAttribute(
      'href',
      'https://www.magnoliasdeco.com.ar/comprar/111'
    )
    await user.click(screen.getByRole('button', { name: '110×60' }))
    expect(screen.getByRole('link', { name: /comprar/i })).toHaveAttribute(
      'href',
      'https://www.magnoliasdeco.com.ar/comprar/222'
    )
  })

  it('muestra stock cuando stockMap tiene datos', () => {
    render(<BuyBlock name="Alfombra" variants={VARIANTS} stockMap={{ 111: 263 }} />)
    expect(screen.getByTestId('stock')).toHaveTextContent('263')
  })
})
```

- [ ] **Correr los tests — deben fallar**

```bash
npm test -- src/components/BuyBlock.test.jsx
```

Expected: FAIL — `Cannot find module './BuyBlock.jsx'`

- [ ] **Crear `src/components/BuyBlock.jsx`**

```jsx
import { useState } from 'react'
import { cartUrl } from '../data/product.js'

function formatPrice(n) {
  return '$' + n.toLocaleString('es-AR')
}

export default function BuyBlock({ name, variants, stockMap }) {
  const [selected, setSelected] = useState(variants[0])

  const stockActual = stockMap[selected.id] ?? selected.stock

  return (
    <div style={{
      padding: 'var(--space-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 900,
        fontSize: '28px',
        lineHeight: 1.05,
        letterSpacing: '-0.02em',
        color: 'var(--fg1)',
      }}>
        {name}
      </h1>

      <p data-testid="precio" style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: '24px',
        color: 'var(--fg1)',
      }}>
        {formatPrice(selected.price)}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        {variants.map(v => (
          <button
            key={v.id}
            onClick={() => setSelected(v)}
            style={{
              padding: '8px 16px',
              border: `2px solid ${v.id === selected.id ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              background: v.id === selected.id ? 'var(--red-soft)' : 'var(--white)',
              color: v.id === selected.id ? 'var(--accent)' : 'var(--fg2)',
              fontFamily: 'var(--font-sans)',
              fontWeight: v.id === selected.id ? 600 : 400,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {stockActual > 0 && (
        <p data-testid="stock" style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--fg3)',
        }}>
          Quedan <strong>{stockActual}</strong> disponibles
        </p>
      )}

      <a
        href={cartUrl(selected.id)}
        style={{
          display: 'block',
          width: '100%',
          padding: '16px',
          background: 'var(--accent)',
          color: 'var(--white)',
          fontFamily: 'var(--font-sans)',
          fontWeight: 800,
          fontSize: '16px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          textAlign: 'center',
          textDecoration: 'none',
          borderRadius: 'var(--radius-md)',
          transition: 'background .15s',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'var(--accent-hover)'}
        onMouseOut={e => e.currentTarget.style.background = 'var(--accent)'}
      >
        Comprar ahora
      </a>
    </div>
  )
}
```

- [ ] **Correr los tests — deben pasar**

```bash
npm test -- src/components/BuyBlock.test.jsx
```

Expected: `5 tests passed`

- [ ] **Commit**

```bash
git add src/components/BuyBlock.jsx src/components/BuyBlock.test.jsx
git commit -m "feat(EXP-001): BuyBlock — selector medida, precio dinámico, CTA checkout"
```

---

## Task 6: TrustStrip + Gallery + Benefits

**Files:**
- Create: `src/components/TrustStrip.jsx`
- Create: `src/components/Gallery.jsx`
- Create: `src/components/Benefits.jsx`
- Create: `src/components/secondary.test.jsx`

- [ ] **Escribir los tests**

```jsx
// src/components/secondary.test.jsx
import { render, screen } from '@testing-library/react'
import TrustStrip from './TrustStrip.jsx'
import Gallery from './Gallery.jsx'
import Benefits from './Benefits.jsx'

describe('TrustStrip', () => {
  it('muestra los 3 mensajes de confianza', () => {
    render(<TrustStrip />)
    expect(screen.getByText(/Envío/i)).toBeInTheDocument()
    expect(screen.getByText(/Pago seguro/i)).toBeInTheDocument()
    expect(screen.getByText(/Devolución/i)).toBeInTheDocument()
  })
})

describe('Gallery', () => {
  const imgs = ['https://a.com/1.jpg', 'https://a.com/2.jpg', 'https://a.com/3.jpg']
  it('renderiza todas las imágenes pasadas', () => {
    render(<Gallery images={imgs} alt="Alfombra" />)
    expect(screen.getAllByRole('img')).toHaveLength(3)
  })
})

describe('Benefits', () => {
  it('muestra los 3 beneficios', () => {
    render(<Benefits />)
    expect(screen.getByText(/Natural/i)).toBeInTheDocument()
    expect(screen.getByText(/Suave/i)).toBeInTheDocument()
    expect(screen.getByText(/Combina/i)).toBeInTheDocument()
  })
})
```

- [ ] **Correr los tests — deben fallar**

```bash
npm test -- src/components/secondary.test.jsx
```

Expected: FAIL — módulos no encontrados

- [ ] **Crear `src/components/TrustStrip.jsx`**

```jsx
const ITEMS = [
  { icon: '🚚', title: 'Envío a todo el país', sub: 'Gratis en compras seleccionadas' },
  { icon: '🔒', title: 'Pago seguro', sub: 'Mercado Pago y tarjetas' },
  { icon: '↩', title: 'Devolución simple', sub: 'Sin preguntas' },
]

export default function TrustStrip() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-around',
      padding: 'var(--space-5) var(--space-4)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-alt)',
      gap: 'var(--space-3)',
    }}>
      {ITEMS.map(item => (
        <div key={item.title} style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'var(--space-1)',
          flex: 1,
        }}>
          <span style={{ fontSize: '20px' }}>{item.icon}</span>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: '11px',
            color: 'var(--fg1)',
            lineHeight: 1.3,
          }}>
            {item.title}
          </span>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '10px',
            color: 'var(--fg3)',
          }}>
            {item.sub}
          </span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Crear `src/components/Gallery.jsx`**

```jsx
export default function Gallery({ images, alt }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2px',
    }}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${alt} ${i + 1}`}
          loading="lazy"
          style={{
            width: '100%',
            aspectRatio: '1/1',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Crear `src/components/Benefits.jsx`**

```jsx
const ITEMS = [
  { emoji: '🌿', title: 'Natural y artesanal', desc: 'Tejido a mano con algodón sin tratar.' },
  { emoji: '☁️', title: 'Suave y liviana',      desc: 'Textura que se adapta a cualquier ambiente.' },
  { emoji: '🏡', title: 'Combina con todo',     desc: 'Estilo boho, escandinavo, minimalista.' },
]

export default function Benefits() {
  return (
    <div style={{
      padding: 'var(--space-7) var(--space-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)',
    }}>
      {ITEMS.map(item => (
        <div key={item.title} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '24px', flexShrink: 0 }}>{item.emoji}</span>
          <div>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: '15px',
              color: 'var(--fg1)',
              marginBottom: '2px',
            }}>
              {item.title}
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: 'var(--fg3)',
              lineHeight: 1.5,
            }}>
              {item.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Correr los tests — deben pasar**

```bash
npm test -- src/components/secondary.test.jsx
```

Expected: `5 tests passed`

- [ ] **Commit**

```bash
git add src/components/TrustStrip.jsx src/components/Gallery.jsx \
        src/components/Benefits.jsx src/components/secondary.test.jsx
git commit -m "feat(EXP-001): TrustStrip, Gallery, Benefits components"
```

---

## Task 7: App.jsx + main.jsx — ensamblado final

**Files:**
- Create: `src/App.jsx`
- Create: `src/main.jsx`

- [ ] **Crear `src/App.jsx`**

```jsx
import { useState, useEffect } from 'react'
import '../src/styles/tokens.css'
import { PRODUCT, VARIANTS, IMAGES } from './data/product.js'
import Hero from './components/Hero.jsx'
import BuyBlock from './components/BuyBlock.jsx'
import TrustStrip from './components/TrustStrip.jsx'
import Gallery from './components/Gallery.jsx'
import Benefits from './components/Benefits.jsx'

const LOGO_URL = 'https://d1a9qnv764bsoo.cloudfront.net/stores/002/238/751/themes/common/logo-742769431-1767113993-c4de664ed8a41f8318a8baf2d719ec6f1767113993.png'

export default function App() {
  const [stockMap, setStockMap] = useState({})

  useEffect(() => {
    fetch('/api/stock')
      .then(r => r.json())
      .then(data => setStockMap(data))
      .catch(() => {})
  }, [])

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        padding: 'var(--space-4)',
        display: 'flex',
        justifyContent: 'center',
        borderBottom: '1px solid var(--border)',
      }}>
        <a href="https://www.magnoliasdeco.com.ar" target="_blank" rel="noopener noreferrer">
          <img src={LOGO_URL} alt="Magnolias" style={{ height: '36px', objectFit: 'contain' }} />
        </a>
      </header>

      {/* Hero */}
      <Hero src={IMAGES[0]} alt={PRODUCT.name} />

      {/* Buy block */}
      <BuyBlock name={PRODUCT.name} variants={VARIANTS} stockMap={stockMap} />

      {/* Trust */}
      <TrustStrip />

      {/* Gallery */}
      <Gallery images={IMAGES.slice(1)} alt={PRODUCT.name} />

      {/* Benefits */}
      <Benefits />

      {/* Second CTA */}
      <div style={{ padding: 'var(--space-6) var(--space-5) var(--space-8)' }}>
        <BuyBlock name={PRODUCT.name} variants={VARIANTS} stockMap={stockMap} />
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: 'var(--space-6) var(--space-5)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        background: 'var(--bg-alt)',
      }}>
        <img src={LOGO_URL} alt="Magnolias" style={{ height: '28px', objectFit: 'contain', margin: '0 auto' }} />
        <a
          href="https://www.magnoliasdeco.com.ar"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: 'var(--fg3)',
            textDecoration: 'none',
          }}
        >
          magnoliasdeco.com.ar
        </a>
      </footer>
    </div>
  )
}
```

- [ ] **Corregir el import de tokens.css en App.jsx** — el import desde `App.jsx` en `src/` debe ser:

```jsx
import './styles/tokens.css'  // no '../src/styles/tokens.css'
```

*(El path con `../src/` fue un error — corregir a `./styles/tokens.css`)*

- [ ] **Crear `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Verificar que el dev server arranca sin errores**

```bash
npm run dev
```

Expected: `Local: http://localhost:5173/`
Abrir en browser. Debe verse la landing con hero, buy block, trust strip, galería y beneficios. Sin errores en consola.

- [ ] **Commit**

```bash
git add src/App.jsx src/main.jsx
git commit -m "feat(EXP-001): App.jsx — landing completa ensamblada"
```

---

## Task 8: Vercel Serverless `/api/stock`

**Files:**
- Create: `api/stock.js`

Esta función corre server-side en Vercel. El token de TN nunca llega al browser.

- [ ] **Crear `api/stock.js`**

```js
export default async function handler(req, res) {
  const { TN_STORE_ID, TN_TOKEN, TN_PRODUCT_ID } = process.env

  if (!TN_STORE_ID || !TN_TOKEN || !TN_PRODUCT_ID) {
    return res.status(500).json({ error: 'env vars missing' })
  }

  const url = `https://api.tiendanube.com/v1/${TN_STORE_ID}/products/${TN_PRODUCT_ID}`
  const resp = await fetch(url, {
    headers: {
      Authentication: `bearer ${TN_TOKEN}`,
      'User-Agent': 'Dante (mica@zasdigital.com)',
    },
  })

  if (!resp.ok) {
    return res.status(502).json({ error: 'TN API error', status: resp.status })
  }

  const product = await resp.json()
  const stock = {}
  for (const v of product.variants ?? []) {
    stock[v.id] = v.stock ?? 0
  }

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  res.json(stock)
}
```

- [ ] **Crear `vercel.json`**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Commit**

```bash
git add api/stock.js vercel.json
git commit -m "feat(EXP-001): /api/stock serverless + vercel.json"
```

---

## Task 9: Variables de entorno para Vercel

Las env vars se configuran en el dashboard de Vercel (nunca en archivos commiteados).

- [ ] **Crear `.env.local` para desarrollo local** (gitignored)

```bash
cat > .env.local << 'EOF'
TN_STORE_ID=2238751
TN_TOKEN=0e99a0a2ded82e2113a03d8399dbf908e1b19c29
TN_PRODUCT_ID=134409509
EOF
```

- [ ] **Verificar que `.env.local` está en `.gitignore`**

```bash
# Desde la raíz del repo dante-desarrollo-tn:
cat .gitignore | grep -E '\.env'
```

Si no está, agregar al `.gitignore` del repo:
```
front/magnolias_deco/EXP-001-landing-alfombra/.env.local
```

- [ ] **Probar `/api/stock` localmente con Vercel CLI**

```bash
# Instalar Vercel CLI si no está:
npm i -g vercel

# Correr dev con soporte serverless:
vercel dev
```

Expected: servidor en `http://localhost:3000`. Al visitar `http://localhost:3000/api/stock` debe devolver JSON con los stocks de las 4 variantes:
```json
{
  "525296880": 263,
  "571696664": 304,
  "525296884": 40,
  "577598652": 14
}
```

- [ ] **Verificar que el stock aparece en la landing local**

Abrir `http://localhost:3000` → seleccionar medida → el contador "Quedan X disponibles" debe actualizarse.

- [ ] **Correr todos los tests**

```bash
npm test
```

Expected: todos los tests en verde (≥ 10 tests).

- [ ] **Commit**

```bash
# Solo agregar el gitignore update, NO el .env.local
git add ../../.gitignore  # o el .gitignore que corresponda
git commit -m "chore(EXP-001): gitignore .env.local de la landing"
```

---

## Task 10: Deploy a Vercel

- [ ] **Login a Vercel (si no está logueado)**

```bash
vercel login
```

- [ ] **Deploy preview**

```bash
vercel deploy
```

Expected: URL de preview tipo `magnolias-landing-alfombra-xxx.vercel.app`

Verificar en esa URL:
1. La landing carga rápido (< 2s)
2. El stock se muestra correctamente
3. El botón "Comprar ahora" lleva a `magnoliasdeco.com.ar/comprar/{variant_id}`
4. El checkout de TN se abre con el producto en el carrito

- [ ] **Configurar env vars en Vercel dashboard**

Ir a `vercel.com/dashboard` → proyecto → Settings → Environment Variables → agregar:

| Key | Value | Environment |
|-----|-------|-------------|
| `TN_STORE_ID` | `2238751` | Production, Preview |
| `TN_TOKEN` | `0e99a0a2ded82e2113a03d8399dbf908e1b19c29` | Production, Preview |
| `TN_PRODUCT_ID` | `134409509` | Production, Preview |

- [ ] **Deploy a producción**

```bash
vercel deploy --prod
```

Expected: URL de producción `magnolias-landing-alfombra.vercel.app`

- [ ] **Configurar subdominio (opcional, coordinar con Mica)**

En el dashboard de Vercel → Domains → agregar `landing.magnoliasdeco.com.ar` → copiar el CNAME o A record → configurar en el DNS de la tienda.

---

## Task 11: Registro del experimento

**Files:**
- Create: `experimentos/magnolias_deco/EXP-001-landing-alfombra/brief.md`
- Create: `experimentos/magnolias_deco/EXP-001-landing-alfombra/implementacion.md`
- Create: `experimentos/magnolias_deco/EXP-001-landing-alfombra/resultado.md`

- [ ] **Crear estructura del experimento**

```bash
# Desde la raíz de dante-desarrollo-tn:
mkdir -p experimentos/magnolias_deco/EXP-001-landing-alfombra
```

- [ ] **Crear `brief.md`**

```markdown
# EXP-001 · Landing Alfombra Algodón Crudo — Magnolias Deco

**Fecha inicio:** 2026-06-25
**Estado:** En implementación

## Hipótesis

Una landing React de conversión sin distracciones (sin navegación de tienda, con selector de medida prominente y CTA directo al checkout) convierte mejor que la PDP estándar de TN para tráfico caliente de Meta Ads.

## Producto

- Nombre: Alfombra Algodón Crudo
- ID TN: 134409509
- URL PDP actual: https://www.magnoliasdeco.com.ar/productos/alfombra-algodon-crudo/
- URL landing: https://landing.magnoliasdeco.com.ar (o preview Vercel)

## Audiencia

Público caliente de Meta Ads — ya vio el producto o interactuó con contenido de Magnolias.

## Métrica objetivo

**Tasa de conversión:** (compras / sesiones únicas en la landing) vs. conversión de la PDP actual.

## Duración mínima

7 días o 500 sesiones únicas, lo que ocurra primero.

## Rollback

Redirigir el anuncio a la PDP original. La tienda TN no se toca.
```

- [ ] **Crear `implementacion.md`**

```markdown
# EXP-001 · Implementación

**Stack:** React 18 + Vite + Vercel  
**Repo path:** `front/magnolias_deco/EXP-001-landing-alfombra/`  
**Deploy:** Vercel (URL en brief.md)  
**Checkout:** cart permalink `magnoliasdeco.com.ar/comprar/{variant_id}`  
**Stock:** `/api/stock` serverless — token server-side, cache 60s  

## Variantes con stock

| Medida | ID | Precio |
|--------|----|--------|
| 45×60 | 525296880 | $12.990 |
| 110×60 | 571696664 | $18.990 |
| 200×60 | 525296884 | $33.990 |
| 160×120 | 577598652 | $48.990 |
```

- [ ] **Crear `resultado.md`**

```markdown
# EXP-001 · Resultado

**Estado:** Pendiente — completar después de 7 días de tráfico

## Métricas

- Sesiones landing:
- Conversión landing:
- Sesiones PDP original:
- Conversión PDP original:
- Δ conversión:

## Conclusión

_A completar_

## Aprendizaje destilado

_A agregar en `aprendizajes.md` si hay resultado positivo_
```

- [ ] **Commit final**

```bash
git add experimentos/magnolias_deco/EXP-001-landing-alfombra/
git commit -m "feat(EXP-001): experimento completo — brief, impl, resultado pendiente"
```

---

## Spec Self-Review

- [x] **Spec coverage:** Hero ✓ · BuyBlock con selector+precio+CTA ✓ · TrustStrip ✓ · Gallery ✓ · Benefits ✓ · Stock serverless ✓ · Vercel deploy ✓ · Experimento registrado ✓
- [x] **Placeholders:** ninguno — todo el código está escrito
- [x] **Type consistency:** `cartUrl(variantId)` definido en Task 3, usado en BuyBlock Task 5 — consistente. `stockMap` es `{ [variantId: number]: number }` — consistente entre App y BuyBlock.
- [x] **Import en App.jsx:** corregido en el paso de Task 7 (`./styles/tokens.css` no `../src/...`)
