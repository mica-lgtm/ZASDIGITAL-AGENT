# Dante CRO App — Sub-proyecto 1: Base + Template Engine

## Resumen

App standalone en `dante-desarrollo-tn/apps/cro/` para crear y editar templates HTML de páginas de producto de Tienda Nube. El template se renderiza con datos reales de cada producto vía TN API y se puede aplicar después por categoría (Sub-proyecto 2).

## Arquitectura

```
dante-desarrollo-tn/
  apps/
    cro/
      backend/     FastAPI · Python · puerto 8000
      frontend/    React + Vite + Tailwind · puerto 5175
  templates/       JSONs de templates guardados (sin DB)
```

El backend wrappea el toolkit `tn/` existente y es el único que llama a TN API (evita CORS). El frontend solo habla con el backend local.

## Backend — FastAPI

**Rutas:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tiendas` | Lista tiendas configuradas en `.env` |
| GET | `/api/tiendas/{tienda}/productos` | Lista productos (paginado, búsqueda por nombre) |
| GET | `/api/tiendas/{tienda}/producto/{id}` | Producto individual |
| GET | `/api/tiendas/{tienda}/categorias` | Lista categorías |
| GET | `/api/templates` | Lista templates guardados |
| POST | `/api/templates` | Crear template |
| PUT | `/api/templates/{id}` | Editar template |
| DELETE | `/api/templates/{id}` | Eliminar template |
| POST | `/api/preview` | Renderiza template + datos producto → HTML |

**Renderizado:** Jinja2. Variables disponibles en templates:
- `{{nombre}}` — nombre del producto
- `{{precio}}` — precio base
- `{{precio_promo}}` — precio promocional
- `{{descripcion}}` — descripción actual del producto
- `{{variantes}}` — lista de variantes (talle/color)
- `{{imagen}}` — URL imagen principal
- `{{categorias}}` — categorías del producto

## Frontend — React

**Pantallas:**

```
Home → Templates (lista)
            ↓ [+ Nuevo] / [Editar]
        TemplateEditor
          ├── izquierda: editor HTML + picker de variables
          └── derecha: preview en vivo (producto real seleccionable)
```

- Selector de tienda global (dropdown en header)
- Selector de producto de preview (buscar por nombre)
- Editor: textarea HTML + botones de inserción de variables
- Preview: iframe o dangerouslySetInnerHTML con el HTML renderizado por backend
- Guardar: POST/PUT a `/api/templates`

## Templates — formato JSON

```json
{
  "id": "uuid4",
  "nombre": "Ficha completa v1",
  "html": "<div>...{{nombre}}...{{precio}}...</div>",
  "variables": ["nombre", "precio", "precio_promo", "variantes"],
  "created_at": "2026-06-29T...",
  "updated_at": "2026-06-29T..."
}
```

Guardados en `dante-desarrollo-tn/templates/<id>.json`.

## Stack

- Backend: Python 3.11+, FastAPI, uvicorn, python-dotenv, Jinja2, requests
- Frontend: React 19, Vite 6, Tailwind 3
- Sin base de datos — archivos JSON en `templates/`

## Fuera de scope (Sub-proyectos 2, 3, 4)

- Aplicar templates por categoría (bulk PUT a TN)
- Métricas de conversión (GA4 + TN)
- Multi-tienda simultánea
