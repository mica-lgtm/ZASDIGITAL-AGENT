# Dante CRO App

Editor de templates HTML para páginas de producto de Tienda Nube, con preview en vivo usando datos reales.

## Cómo correrla

Necesitás dos terminales. Copiá cada comando **por separado**, sin los backticks ni el bloque entero.

### Terminal 1 — Backend

Paso 1 — ir a la carpeta del proyecto:
```
cd /Users/zas_digital/Desktop/ZAS-AGENT/dante-desarrollo-tn
```

Paso 2 — traer los últimos cambios del repo (solo si es la primera vez o acabás de clonar):
```
git pull
```

Paso 3 — instalar dependencias (solo la primera vez):
```
pip3 install fastapi "uvicorn[standard]" jinja2 httpx requests python-dotenv
```

Paso 4 — levantar el backend (usá `python3 -m` para evitar problemas de PATH):
```
python3 -m uvicorn apps.cro.backend.main:app --port 8000 --reload
```

Verificar que levantó:
```bash
curl http://localhost:8000/health
# {"status":"ok"}

curl http://localhost:8000/api/tiendas
# {"tiendas":["simona_shop","magnolias_deco","juanitas","vitalis_navitas"]}
```

### Terminal 2 — Frontend

Abrí una terminal nueva y corré:

Paso 1:
```
cd /Users/zas_digital/Desktop/ZAS-AGENT/dante-desarrollo-tn/apps/cro/frontend
```

Paso 2:
```
npm run dev
```

Abrir: **http://localhost:5175**

---

## Cómo usarla

1. Seleccioná la tienda en el dropdown del header
2. Click **+ Nuevo template**
3. Poné un nombre (ej: `Ficha completa v1`)
4. Escribí HTML en el editor izquierdo — usá los botones de variables para insertar `{{nombre}}`, `{{precio}}`, etc.
5. En el panel derecho, buscá y seleccioná un producto de la tienda
6. Click **Preview** — se renderiza el HTML con los datos reales del producto
7. Click **Guardar** — vuelve a la lista

Para editar un template existente: click **Editar** en la lista.

---

## Variables disponibles en los templates

| Variable | Contenido |
|----------|-----------|
| `{{nombre}}` | Nombre del producto |
| `{{precio}}` | Precio actual |
| `{{precio_promo}}` | Precio promocional (si existe) |
| `{{descripcion}}` | Descripción HTML actual |
| `{{imagen}}` | URL de la imagen principal |
| `{{variantes}}` | Lista de variantes (talle, color, etc.) |
| `{{categorias}}` | Lista de categorías |

Ejemplo de template:
```html
<div style="font-family: sans-serif; padding: 24px;">
  <h2 style="color: #1a1a1a;">{{nombre}}</h2>
  <p style="color: #e85d26; font-size: 1.4rem; font-weight: bold;">${{precio}}</p>
  <div>{{descripcion}}</div>
  <img src="{{imagen}}" style="width: 100%; max-width: 400px;" />
</div>
```

---

## Estructura

```
apps/cro/
  backend/
    main.py                  ← FastAPI app (puerto 8000)
    routers/
      tiendas.py             ← GET /api/tiendas, /productos, /producto/{id}
      templates.py           ← CRUD /api/templates
      preview.py             ← POST /api/preview
    services/
      tn_service.py          ← wrappea el toolkit tn/
      template_store.py      ← lee/escribe JSONs en templates/
      preview_service.py     ← renderizado Jinja2
  frontend/                  ← React 19 + Vite + Tailwind (puerto 5175)
templates/                   ← JSONs de templates guardados
```

## Tests

```bash
cd dante-desarrollo-tn
python3 -m pytest tests/cro/ -v
# 17 tests, todos PASSED
```
