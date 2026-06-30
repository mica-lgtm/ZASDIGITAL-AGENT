# CRO App — Template Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App standalone en `apps/cro/` con FastAPI backend + React frontend para crear templates HTML de páginas de producto de TN con preview en vivo usando datos reales.

**Architecture:** FastAPI (puerto 8000) wrappea el toolkit `tn/` existente y es el único que llama a TN API (evita CORS). React (puerto 5175) llama solo al backend local. Templates guardados como JSONs en `templates/`. Renderizado con Jinja2.

**Tech Stack:** Python 3.11+, FastAPI, uvicorn, Jinja2, httpx (tests), pytest · React 19, Vite 6, Tailwind 3

---

## Estructura de archivos

```
dante-desarrollo-tn/
  apps/cro/
    backend/
      main.py                  ← FastAPI app, CORS, monta routers
      routers/
        tiendas.py             ← GET tiendas, productos, categorías
        templates.py           ← CRUD templates
        preview.py             ← POST preview: renderiza template con datos reales
      services/
        tn_service.py          ← wrappea tn.tiendas, tn.productos, client.get_all
        template_store.py      ← lee/escribe JSONs en templates/
    frontend/
      package.json
      vite.config.js
      tailwind.config.js
      postcss.config.js
      index.html
      src/
        main.jsx
        App.jsx
        index.css
        utils/api.js           ← fetch wrapper apuntando a :8000
        components/
          Header.jsx            ← dropdown selector de tienda
        views/
          TemplateList.jsx      ← lista templates + botones nuevo/editar/borrar
          TemplateEditor.jsx    ← editor HTML + variable picker + preview en vivo
  templates/                   ← JSONs creados por la app (vacío al inicio)
  tests/
    cro/
      __init__.py
      test_template_store.py
      test_tn_service.py
      test_preview.py
```

**Modificados:**
- `requirements.txt` — agrega fastapi, uvicorn[standard], jinja2, httpx
- `pytest.ini` — agrega `tests/cro` a testpaths

---

## Task 1: Deps + scaffold FastAPI

**Files:**
- Modify: `requirements.txt`
- Create: `apps/cro/backend/main.py`
- Create: `apps/cro/backend/routers/__init__.py`
- Create: `apps/cro/backend/services/__init__.py`
- Create: `tests/cro/__init__.py`

- [ ] **Agregar deps al requirements.txt del proyecto**

Reemplazar contenido de `requirements.txt`:
```
requests>=2.31
python-dotenv>=1.0
pytest>=8.0
requests-mock>=1.12
fastapi>=0.111
uvicorn[standard]>=0.29
jinja2>=3.1
httpx>=0.27
```

- [ ] **Instalar las deps nuevas**

```bash
cd /Users/mica/Desktop/ZAS-AGENT/dante-desarrollo-tn
pip install -r requirements.txt
```

Esperado: instala fastapi, uvicorn, jinja2, httpx sin errores.

- [ ] **Crear estructura de directorios**

```bash
mkdir -p apps/cro/backend/routers
mkdir -p apps/cro/backend/services
mkdir -p templates
mkdir -p tests/cro
touch apps/cro/backend/routers/__init__.py
touch apps/cro/backend/services/__init__.py
touch tests/cro/__init__.py
```

- [ ] **Crear `apps/cro/backend/main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Dante CRO API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5175"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Agregar tests/cro al pytest.ini**

Reemplazar `pytest.ini`:
```ini
[pytest]
testpaths = tests
python_files = test_*.py
```

(testpaths = tests ya cubre tests/cro al ser subdirectorio)

- [ ] **Escribir test de salud**

Crear `tests/cro/test_main.py`:
```python
from fastapi.testclient import TestClient
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../.."))
from apps.cro.backend.main import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
```

- [ ] **Correr test y verificar que pasa**

```bash
cd /Users/mica/Desktop/ZAS-AGENT/dante-desarrollo-tn
python -m pytest tests/cro/test_main.py -v
```

Esperado: `test_health PASSED`

- [ ] **Commit**

```bash
git add apps/cro/backend/ tests/cro/ requirements.txt pytest.ini templates/
git commit -m "feat(cro): scaffold FastAPI backend + health check"
```

---

## Task 2: template_store service

**Files:**
- Create: `apps/cro/backend/services/template_store.py`
- Create: `tests/cro/test_template_store.py`

- [ ] **Crear `apps/cro/backend/services/template_store.py`**

```python
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

TEMPLATES_DIR = Path(__file__).parents[4] / "templates"


def _path(template_id: str) -> Path:
    return TEMPLATES_DIR / f"{template_id}.json"


def list_templates() -> list[dict]:
    TEMPLATES_DIR.mkdir(exist_ok=True)
    return [json.loads(p.read_text()) for p in sorted(TEMPLATES_DIR.glob("*.json"))]


def get_template(template_id: str) -> dict | None:
    p = _path(template_id)
    return json.loads(p.read_text()) if p.exists() else None


def create_template(nombre: str, html: str) -> dict:
    TEMPLATES_DIR.mkdir(exist_ok=True)
    now = datetime.now(timezone.utc).isoformat()
    t = {
        "id": str(uuid.uuid4()),
        "nombre": nombre,
        "html": html,
        "created_at": now,
        "updated_at": now,
    }
    _path(t["id"]).write_text(json.dumps(t, ensure_ascii=False, indent=2))
    return t


def update_template(template_id: str, nombre: str, html: str) -> dict | None:
    t = get_template(template_id)
    if not t:
        return None
    t["nombre"] = nombre
    t["html"] = html
    t["updated_at"] = datetime.now(timezone.utc).isoformat()
    _path(template_id).write_text(json.dumps(t, ensure_ascii=False, indent=2))
    return t


def delete_template(template_id: str) -> bool:
    p = _path(template_id)
    if not p.exists():
        return False
    p.unlink()
    return True
```

- [ ] **Escribir tests de template_store**

Crear `tests/cro/test_template_store.py`:
```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../.."))

import pytest
from apps.cro.backend.services import template_store as ts


@pytest.fixture(autouse=True)
def use_tmp_dir(tmp_path, monkeypatch):
    monkeypatch.setattr(ts, "TEMPLATES_DIR", tmp_path)


def test_list_vacio():
    assert ts.list_templates() == []


def test_create_y_list():
    t = ts.create_template("Mi template", "<p>{{nombre}}</p>")
    assert t["nombre"] == "Mi template"
    assert t["html"] == "<p>{{nombre}}</p>"
    assert "id" in t
    lista = ts.list_templates()
    assert len(lista) == 1
    assert lista[0]["id"] == t["id"]


def test_get_existente():
    t = ts.create_template("A", "<div></div>")
    found = ts.get_template(t["id"])
    assert found["id"] == t["id"]


def test_get_inexistente():
    assert ts.get_template("no-existe") is None


def test_update():
    t = ts.create_template("Viejo", "<p>old</p>")
    updated = ts.update_template(t["id"], "Nuevo", "<p>new</p>")
    assert updated["nombre"] == "Nuevo"
    assert updated["html"] == "<p>new</p>"
    assert updated["updated_at"] > t["created_at"]


def test_update_inexistente():
    assert ts.update_template("no-existe", "X", "Y") is None


def test_delete():
    t = ts.create_template("Para borrar", "<p></p>")
    assert ts.delete_template(t["id"]) is True
    assert ts.get_template(t["id"]) is None


def test_delete_inexistente():
    assert ts.delete_template("no-existe") is False
```

- [ ] **Correr tests y verificar que pasan**

```bash
python -m pytest tests/cro/test_template_store.py -v
```

Esperado: 8 tests PASSED

- [ ] **Commit**

```bash
git add apps/cro/backend/services/template_store.py tests/cro/test_template_store.py
git commit -m "feat(cro): template_store — CRUD de templates en disco"
```

---

## Task 3: tn_service

**Files:**
- Create: `apps/cro/backend/services/tn_service.py`
- Create: `tests/cro/test_tn_service.py`

- [ ] **Crear `apps/cro/backend/services/tn_service.py`**

```python
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parents[4]))

from tn.tiendas import cargar_tiendas, tienda as make_client


def list_tiendas() -> list[str]:
    return list(cargar_tiendas().keys())


def _extract_variables(product: dict) -> dict:
    def multilang(field):
        v = product.get(field, {}) or {}
        return v.get("es") or v.get("pt") or next(iter(v.values()), "") if v else ""

    images = product.get("images") or []
    imagen = images[0]["src"] if images else ""

    variantes = []
    for variant in product.get("variants") or []:
        for val in variant.get("values") or []:
            text = val.get("es") or val.get("pt") or ""
            if text and text not in variantes:
                variantes.append(text)

    categorias = [
        (cat.get("name") or {}).get("es") or ""
        for cat in product.get("categories") or []
    ]

    return {
        "nombre": multilang("name"),
        "descripcion": multilang("description"),
        "precio": product.get("price") or "",
        "precio_promo": product.get("promotional_price") or "",
        "imagen": imagen,
        "variantes": variantes,
        "categorias": [c for c in categorias if c],
    }


def list_productos(nombre_tienda: str, q: str = "") -> list[dict]:
    client = make_client(nombre_tienda)
    params = {"q": q} if q else {}
    prods = client.get_all("products", params or None)
    return [
        {
            "id": p["id"],
            "nombre": (_extract_variables(p))["nombre"],
            "precio": p.get("price") or "",
            "imagen": (_extract_variables(p))["imagen"],
        }
        for p in prods
    ]


def get_producto(nombre_tienda: str, producto_id: int) -> dict:
    client = make_client(nombre_tienda)
    product = client.get(f"products/{producto_id}")
    return {**product, "variables": _extract_variables(product)}


def list_categorias(nombre_tienda: str) -> list[dict]:
    client = make_client(nombre_tienda)
    cats = client.get_all("categories")
    return [
        {"id": c["id"], "nombre": (c.get("name") or {}).get("es") or ""}
        for c in cats
    ]
```

- [ ] **Escribir tests de tn_service**

Crear `tests/cro/test_tn_service.py`:
```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../.."))

import pytest
from unittest.mock import patch, MagicMock
from apps.cro.backend.services import tn_service as svc


SAMPLE_PRODUCT = {
    "id": 1,
    "name": {"es": "Buzo Plush"},
    "description": {"es": "<p>Descripción</p>"},
    "price": "42990.00",
    "promotional_price": "36542.00",
    "images": [{"src": "https://img.example.com/1.jpg"}],
    "variants": [{"values": [{"es": "S"}, {"es": "M"}]}],
    "categories": [{"name": {"es": "Buzos"}}],
}


@pytest.fixture
def mock_client():
    with patch("apps.cro.backend.services.tn_service.make_client") as m:
        client = MagicMock()
        m.return_value = client
        yield client


def test_list_tiendas():
    env = {
        "DANTE_SIMONA_SHOP_STORE_ID": "1",
        "DANTE_SIMONA_SHOP_TOKEN": "tok",
        "DANTE_SIMONA_SHOP_URL": "https://simona.com",
    }
    with patch("apps.cro.backend.services.tn_service.cargar_tiendas",
               return_value={"simona_shop": {}}):
        result = svc.list_tiendas()
    assert "simona_shop" in result


def test_list_productos(mock_client):
    mock_client.get_all.return_value = [SAMPLE_PRODUCT]
    result = svc.list_productos("simona_shop")
    assert len(result) == 1
    assert result[0]["nombre"] == "Buzo Plush"
    assert result[0]["precio"] == "42990.00"


def test_get_producto(mock_client):
    mock_client.get.return_value = SAMPLE_PRODUCT
    result = svc.get_producto("simona_shop", 1)
    vars_ = result["variables"]
    assert vars_["nombre"] == "Buzo Plush"
    assert vars_["precio"] == "42990.00"
    assert vars_["precio_promo"] == "36542.00"
    assert "S" in vars_["variantes"]
    assert "M" in vars_["variantes"]
    assert vars_["imagen"] == "https://img.example.com/1.jpg"
    assert "Buzos" in vars_["categorias"]


def test_list_categorias(mock_client):
    mock_client.get_all.return_value = [{"id": 10, "name": {"es": "Buzos"}}]
    result = svc.list_categorias("simona_shop")
    assert result == [{"id": 10, "nombre": "Buzos"}]
```

- [ ] **Correr tests**

```bash
python -m pytest tests/cro/test_tn_service.py -v
```

Esperado: 4 tests PASSED

- [ ] **Commit**

```bash
git add apps/cro/backend/services/tn_service.py tests/cro/test_tn_service.py
git commit -m "feat(cro): tn_service — wrappea toolkit tn/ con extracción de variables"
```

---

## Task 4: preview service + router

**Files:**
- Create: `apps/cro/backend/services/preview_service.py`
- Create: `apps/cro/backend/routers/preview.py`
- Create: `tests/cro/test_preview.py`

- [ ] **Crear `apps/cro/backend/services/preview_service.py`**

```python
from jinja2 import Environment, Undefined


def render(html: str, variables: dict) -> str:
    env = Environment(undefined=Undefined)
    return env.from_string(html).render(**variables)
```

- [ ] **Escribir tests de preview_service**

Crear `tests/cro/test_preview.py`:
```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../.."))

from apps.cro.backend.services.preview_service import render


def test_render_variable_simple():
    html = "<h1>{{nombre}}</h1>"
    result = render(html, {"nombre": "Buzo Plush"})
    assert result == "<h1>Buzo Plush</h1>"


def test_render_multiples_variables():
    html = "<p>{{nombre}} — ${{precio}}</p>"
    result = render(html, {"nombre": "Buzo", "precio": "42990"})
    assert result == "<p>Buzo — $42990</p>"


def test_render_variable_faltante_queda_vacia():
    html = "<p>{{nombre}} {{inexistente}}</p>"
    result = render(html, {"nombre": "Buzo"})
    assert "Buzo" in result


def test_render_lista_variantes():
    html = "{% for v in variantes %}{{v}},{% endfor %}"
    result = render(html, {"variantes": ["S", "M", "L"]})
    assert result == "S,M,L,"
```

- [ ] **Correr tests de preview**

```bash
python -m pytest tests/cro/test_preview.py -v
```

Esperado: 4 tests PASSED

- [ ] **Crear `apps/cro/backend/routers/preview.py`**

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from apps.cro.backend.services import tn_service, template_store
from apps.cro.backend.services.preview_service import render

router = APIRouter(prefix="/api/preview", tags=["preview"])


class PreviewRequest(BaseModel):
    tienda: str
    producto_id: int
    template_id: str


@router.post("")
def preview(req: PreviewRequest):
    template = template_store.get_template(req.template_id)
    if not template:
        raise HTTPException(404, "Template no encontrado")
    try:
        product = tn_service.get_producto(req.tienda, req.producto_id)
    except Exception as e:
        raise HTTPException(502, f"Error TN API: {e}")
    html = render(template["html"], product["variables"])
    return {"html": html, "variables": product["variables"]}
```

- [ ] **Montar router en main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.cro.backend.routers import preview

app = FastAPI(title="Dante CRO API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5175"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(preview.router)


@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Correr todos los tests cro**

```bash
python -m pytest tests/cro/ -v
```

Esperado: todos PASSED

- [ ] **Commit**

```bash
git add apps/cro/backend/services/preview_service.py apps/cro/backend/routers/preview.py apps/cro/backend/main.py tests/cro/test_preview.py
git commit -m "feat(cro): preview service — Jinja2 render + router POST /api/preview"
```

---

## Task 5: routers de tiendas y templates

**Files:**
- Create: `apps/cro/backend/routers/tiendas.py`
- Create: `apps/cro/backend/routers/templates.py`
- Modify: `apps/cro/backend/main.py`

- [ ] **Crear `apps/cro/backend/routers/tiendas.py`**

```python
from fastapi import APIRouter, HTTPException
from apps.cro.backend.services import tn_service

router = APIRouter(prefix="/api/tiendas", tags=["tiendas"])


@router.get("")
def list_tiendas():
    return {"tiendas": tn_service.list_tiendas()}


@router.get("/{tienda}/productos")
def list_productos(tienda: str, q: str = ""):
    try:
        return tn_service.list_productos(tienda, q)
    except KeyError:
        raise HTTPException(404, f"Tienda '{tienda}' no configurada")
    except Exception as e:
        raise HTTPException(502, f"Error TN API: {e}")


@router.get("/{tienda}/producto/{producto_id}")
def get_producto(tienda: str, producto_id: int):
    try:
        return tn_service.get_producto(tienda, producto_id)
    except KeyError:
        raise HTTPException(404, f"Tienda '{tienda}' no configurada")
    except Exception as e:
        raise HTTPException(502, f"Error TN API: {e}")


@router.get("/{tienda}/categorias")
def list_categorias(tienda: str):
    try:
        return tn_service.list_categorias(tienda)
    except KeyError:
        raise HTTPException(404, f"Tienda '{tienda}' no configurada")
    except Exception as e:
        raise HTTPException(502, f"Error TN API: {e}")
```

- [ ] **Crear `apps/cro/backend/routers/templates.py`**

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from apps.cro.backend.services import template_store

router = APIRouter(prefix="/api/templates", tags=["templates"])


class TemplateBody(BaseModel):
    nombre: str
    html: str


@router.get("")
def list_templates():
    return template_store.list_templates()


@router.post("")
def create_template(body: TemplateBody):
    return template_store.create_template(body.nombre, body.html)


@router.put("/{template_id}")
def update_template(template_id: str, body: TemplateBody):
    t = template_store.update_template(template_id, body.nombre, body.html)
    if not t:
        raise HTTPException(404, "Template no encontrado")
    return t


@router.delete("/{template_id}")
def delete_template(template_id: str):
    if not template_store.delete_template(template_id):
        raise HTTPException(404, "Template no encontrado")
    return {"ok": True}
```

- [ ] **Montar ambos routers en main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.cro.backend.routers import preview, tiendas, templates as templates_router

app = FastAPI(title="Dante CRO API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5175"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tiendas.router)
app.include_router(templates_router.router)
app.include_router(preview.router)


@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Smoke test manual del backend**

```bash
cd /Users/mica/Desktop/ZAS-AGENT/dante-desarrollo-tn
uvicorn apps.cro.backend.main:app --port 8000 --reload
```

En otra terminal:
```bash
curl http://localhost:8000/health
# {"status":"ok"}

curl http://localhost:8000/api/tiendas
# {"tiendas":["simona_shop","magnolias_deco","juanitas","vitalis_navitas"]}

curl http://localhost:8000/api/templates
# []
```

- [ ] **Correr tests**

```bash
python -m pytest tests/cro/ -v
```

Esperado: todos PASSED

- [ ] **Commit**

```bash
git add apps/cro/backend/routers/tiendas.py apps/cro/backend/routers/templates.py apps/cro/backend/main.py
git commit -m "feat(cro): routers tiendas + templates — API completa"
```

---

## Task 6: Frontend scaffold

**Files:**
- Create: `apps/cro/frontend/package.json`
- Create: `apps/cro/frontend/vite.config.js`
- Create: `apps/cro/frontend/tailwind.config.js`
- Create: `apps/cro/frontend/postcss.config.js`
- Create: `apps/cro/frontend/index.html`
- Create: `apps/cro/frontend/src/main.jsx`
- Create: `apps/cro/frontend/src/App.jsx`
- Create: `apps/cro/frontend/src/index.css`
- Create: `apps/cro/frontend/src/utils/api.js`

- [ ] **Crear `apps/cro/frontend/package.json`**

```json
{
  "name": "dante-cro",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@tailwindcss/postcss": "^4.0.0"
  }
}
```

- [ ] **Crear `apps/cro/frontend/vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5175 },
})
```

- [ ] **Crear `apps/cro/frontend/tailwind.config.js`**

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#1a1a1a',
        cream: '#f5f4f0',
        orange: '#e85d26',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Crear `apps/cro/frontend/postcss.config.js`**

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

- [ ] **Crear `apps/cro/frontend/index.html`**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dante CRO</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Crear `apps/cro/frontend/src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Crear `apps/cro/frontend/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Crear `apps/cro/frontend/src/utils/api.js`**

```js
const BASE = 'http://localhost:8000'

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)
  const res = await fetch(BASE + path, opts)
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`)
  return res.json()
}

export const api = {
  getTiendas: () => request('GET', '/api/tiendas'),
  getProductos: (tienda, q = '') =>
    request('GET', `/api/tiendas/${tienda}/productos${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getCategorias: (tienda) => request('GET', `/api/tiendas/${tienda}/categorias`),
  getProducto: (tienda, id) => request('GET', `/api/tiendas/${tienda}/producto/${id}`),
  getTemplates: () => request('GET', '/api/templates'),
  createTemplate: (nombre, html) => request('POST', '/api/templates', { nombre, html }),
  updateTemplate: (id, nombre, html) => request('PUT', `/api/templates/${id}`, { nombre, html }),
  deleteTemplate: (id) => request('DELETE', `/api/templates/${id}`),
  preview: (tienda, producto_id, template_id) =>
    request('POST', '/api/preview', { tienda, producto_id, template_id }),
}
```

- [ ] **Crear `apps/cro/frontend/src/App.jsx` (shell temporario)**

```jsx
import { useState, useEffect } from 'react'
import { api } from './utils/api.js'

export default function App() {
  const [tiendas, setTiendas] = useState([])

  useEffect(() => {
    api.getTiendas().then(r => setTiendas(r.tiendas)).catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl font-bold text-dark mb-2">Dante CRO</div>
        <div className="text-sm text-gray-500">
          {tiendas.length ? `${tiendas.length} tiendas conectadas` : 'Conectando...'}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Instalar deps y arrancar frontend**

```bash
cd /Users/mica/Desktop/ZAS-AGENT/dante-desarrollo-tn/apps/cro/frontend
npm install
npm run dev
```

Esperado: `VITE ready at http://localhost:5175/`
Abrir http://localhost:5175/ — debe mostrar "Dante CRO" y "4 tiendas conectadas" (con backend corriendo).

- [ ] **Commit**

```bash
cd /Users/mica/Desktop/ZAS-AGENT/dante-desarrollo-tn
git add apps/cro/frontend/
git commit -m "feat(cro): frontend scaffold React+Vite+Tailwind — conecta a API"
```

---

## Task 7: Header + store selector

**Files:**
- Create: `apps/cro/frontend/src/components/Header.jsx`
- Modify: `apps/cro/frontend/src/App.jsx`

- [ ] **Crear `apps/cro/frontend/src/components/Header.jsx`**

```jsx
export default function Header({ tiendas, tiendaActiva, onTiendaChange }) {
  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-6">
      <div className="text-lg font-bold text-dark tracking-tight">Dante CRO</div>
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Tienda</span>
        <select
          value={tiendaActiva}
          onChange={e => onTiendaChange(e.target.value)}
          className="border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-orange"
        >
          {tiendas.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>
    </header>
  )
}
```

- [ ] **Actualizar `apps/cro/frontend/src/App.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { api } from './utils/api.js'
import Header from './components/Header.jsx'

export default function App() {
  const [tiendas, setTiendas] = useState([])
  const [tiendaActiva, setTiendaActiva] = useState('')
  const [view, setView] = useState('templates') // 'templates' | 'editor'
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    api.getTiendas()
      .then(r => {
        setTiendas(r.tiendas)
        if (r.tiendas.length) setTiendaActiva(r.tiendas[0])
      })
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      <Header
        tiendas={tiendas}
        tiendaActiva={tiendaActiva}
        onTiendaChange={setTiendaActiva}
      />
      <main className="max-w-7xl mx-auto px-8 py-8">
        {view === 'templates' && (
          <div className="text-gray-400 text-sm">Templates — próximo paso</div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Verificar en browser**

Con backend y frontend corriendo: http://localhost:5175/ debe mostrar header con dropdown de tiendas.

- [ ] **Commit**

```bash
git add apps/cro/frontend/src/components/Header.jsx apps/cro/frontend/src/App.jsx
git commit -m "feat(cro): Header con selector de tienda activa"
```

---

## Task 8: TemplateList view

**Files:**
- Create: `apps/cro/frontend/src/views/TemplateList.jsx`
- Modify: `apps/cro/frontend/src/App.jsx`

- [ ] **Crear `apps/cro/frontend/src/views/TemplateList.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { api } from '../utils/api.js'

export default function TemplateList({ onNuevo, onEditar }) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api.getTemplates()
      .then(setTemplates)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleDelete(id, nombre) {
    if (!confirm(`Borrar "${nombre}"?`)) return
    await api.deleteTemplate(id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-dark">Templates de producto</h1>
        <button
          onClick={onNuevo}
          className="bg-dark text-white px-4 py-2 rounded text-sm font-semibold hover:opacity-80 transition"
        >
          + Nuevo template
        </button>
      </div>

      {loading && <div className="text-gray-400 text-sm">Cargando...</div>}

      {!loading && templates.length === 0 && (
        <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
          No hay templates todavía. Creá el primero.
        </div>
      )}

      <div className="space-y-3">
        {templates.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-100 px-6 py-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="font-semibold text-dark text-sm">{t.nombre}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Actualizado {new Date(t.updated_at).toLocaleDateString('es-AR')}
              </div>
            </div>
            <button
              onClick={() => onEditar(t.id)}
              className="text-sm text-orange font-semibold hover:opacity-70 transition"
            >
              Editar
            </button>
            <button
              onClick={() => handleDelete(t.id, t.nombre)}
              className="text-sm text-gray-400 hover:text-red-500 transition"
            >
              Borrar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Actualizar `apps/cro/frontend/src/App.jsx` para mostrar TemplateList**

```jsx
import { useState, useEffect } from 'react'
import { api } from './utils/api.js'
import Header from './components/Header.jsx'
import TemplateList from './views/TemplateList.jsx'

export default function App() {
  const [tiendas, setTiendas] = useState([])
  const [tiendaActiva, setTiendaActiva] = useState('')
  const [view, setView] = useState('templates')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    api.getTiendas()
      .then(r => {
        setTiendas(r.tiendas)
        if (r.tiendas.length) setTiendaActiva(r.tiendas[0])
      })
      .catch(console.error)
  }, [])

  function goEditor(id = null) {
    setEditingId(id)
    setView('editor')
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header
        tiendas={tiendas}
        tiendaActiva={tiendaActiva}
        onTiendaChange={setTiendaActiva}
      />
      <main className="max-w-5xl mx-auto px-8 py-8">
        {view === 'templates' && (
          <TemplateList
            onNuevo={() => goEditor(null)}
            onEditar={(id) => goEditor(id)}
          />
        )}
        {view === 'editor' && (
          <div className="text-gray-400 text-sm">Editor — próximo paso</div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Verificar en browser**

Lista de templates con botón "+ Nuevo". Con templates vacíos muestra el estado vacío. Crear un template manual via curl para probar la lista:

```bash
curl -X POST http://localhost:8000/api/templates \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Test","html":"<p>{{nombre}}</p>"}'
```

Refrescar — debe aparecer en la lista con botones Editar y Borrar.

- [ ] **Commit**

```bash
git add apps/cro/frontend/src/views/TemplateList.jsx apps/cro/frontend/src/App.jsx
git commit -m "feat(cro): TemplateList — lista, borrar, navegación a editor"
```

---

## Task 9: TemplateEditor view

**Files:**
- Create: `apps/cro/frontend/src/views/TemplateEditor.jsx`
- Modify: `apps/cro/frontend/src/App.jsx`

- [ ] **Crear `apps/cro/frontend/src/views/TemplateEditor.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { api } from '../utils/api.js'

const VARIABLES = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'precio', label: 'Precio' },
  { key: 'precio_promo', label: 'Precio promo' },
  { key: 'descripcion', label: 'Descripción actual' },
  { key: 'imagen', label: 'Imagen' },
  { key: 'variantes', label: 'Variantes (lista)' },
  { key: 'categorias', label: 'Categorías (lista)' },
]

export default function TemplateEditor({ templateId, tienda, onVolver }) {
  const [nombre, setNombre] = useState('')
  const [html, setHtml] = useState('')
  const [productos, setProductos] = useState([])
  const [productoId, setProductoId] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [variables, setVariables] = useState({})
  const [saving, setSaving] = useState(false)
  const [previewing, setPreviewing] = useState(false)

  useEffect(() => {
    if (templateId) {
      api.getTemplates().then(ts => {
        const t = ts.find(x => x.id === templateId)
        if (t) { setNombre(t.nombre); setHtml(t.html) }
      })
    }
  }, [templateId])

  useEffect(() => {
    if (!tienda) return
    api.getProductos(tienda, busqueda)
      .then(ps => {
        setProductos(ps)
        if (ps.length && !productoId) setProductoId(String(ps[0].id))
      })
      .catch(console.error)
  }, [tienda, busqueda])

  async function handlePreview() {
    if (!productoId || !html) return
    if (!templateId) {
      // guardar temporalmente para hacer preview
      const t = await api.createTemplate(nombre || 'Preview temp', html)
      setPreviewing(true)
      try {
        const res = await api.preview(tienda, Number(productoId), t.id)
        setPreviewHtml(res.html)
        setVariables(res.variables)
      } finally {
        await api.deleteTemplate(t.id)
        setPreviewing(false)
      }
      return
    }
    setPreviewing(true)
    try {
      const res = await api.preview(tienda, Number(productoId), templateId)
      setPreviewHtml(res.html)
      setVariables(res.variables)
    } finally {
      setPreviewing(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (templateId) {
        await api.updateTemplate(templateId, nombre, html)
      } else {
        await api.createTemplate(nombre, html)
      }
      onVolver()
    } finally {
      setSaving(false)
    }
  }

  function insertVariable(key) {
    const tag = `{{${key}}}`
    setHtml(prev => prev + tag)
  }

  return (
    <div>
      {/* Breadcrumb + acciones */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onVolver}
          className="text-sm text-gray-400 hover:text-dark transition flex items-center gap-1"
        >
          ← Volver
        </button>
        <span className="text-gray-200">/</span>
        <span className="text-sm text-dark font-semibold">
          {templateId ? 'Editar template' : 'Nuevo template'}
        </span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={handlePreview}
            disabled={!html || !productoId || previewing}
            className="px-4 py-2 text-sm border border-gray-200 rounded font-semibold hover:border-dark transition disabled:opacity-40"
          >
            {previewing ? 'Generando...' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={!nombre || !html || saving}
            className="px-4 py-2 text-sm bg-dark text-white rounded font-semibold hover:opacity-80 transition disabled:opacity-40"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Nombre del template */}
      <input
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        placeholder="Nombre del template (ej: Ficha completa v1)"
        className="w-full border border-gray-200 rounded px-4 py-2.5 text-sm mb-6 focus:outline-none focus:border-dark"
      />

      <div className="grid grid-cols-2 gap-8">
        {/* Panel izquierdo: editor */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">HTML</span>
            <span className="text-xs text-gray-300 ml-auto">Variables disponibles:</span>
          </div>
          {/* Variable picker */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {VARIABLES.map(v => (
              <button
                key={v.key}
                onClick={() => insertVariable(v.key)}
                className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:border-dark transition font-mono"
              >
                {`{{${v.key}}}`}
              </button>
            ))}
          </div>
          <textarea
            value={html}
            onChange={e => setHtml(e.target.value)}
            rows={24}
            placeholder={'<div>\n  <h2>{{nombre}}</h2>\n  <p>Precio: ${{precio}}</p>\n</div>'}
            className="w-full border border-gray-200 rounded px-4 py-3 text-xs font-mono focus:outline-none focus:border-dark resize-none"
          />
        </div>

        {/* Panel derecho: preview */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Preview</span>
          </div>
          {/* Selector de producto */}
          <div className="flex gap-2 mb-3">
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar producto..."
              className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-dark"
            />
            <select
              value={productoId}
              onChange={e => setProductoId(e.target.value)}
              className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-dark"
            >
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre || `Producto ${p.id}`}
                </option>
              ))}
            </select>
          </div>

          {previewHtml ? (
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div
                className="bg-white"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
              Escribí HTML y presioná Preview
            </div>
          )}

          {Object.keys(variables).length > 0 && (
            <div className="mt-4 bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Variables del producto
              </div>
              <div className="space-y-1">
                {Object.entries(variables).map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-xs">
                    <span className="font-mono text-orange w-28 shrink-0">{`{{${k}}}`}</span>
                    <span className="text-gray-500 truncate">
                      {Array.isArray(v) ? v.join(', ') : String(v).slice(0, 80)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Actualizar `apps/cro/frontend/src/App.jsx` — conectar TemplateEditor**

```jsx
import { useState, useEffect } from 'react'
import { api } from './utils/api.js'
import Header from './components/Header.jsx'
import TemplateList from './views/TemplateList.jsx'
import TemplateEditor from './views/TemplateEditor.jsx'

export default function App() {
  const [tiendas, setTiendas] = useState([])
  const [tiendaActiva, setTiendaActiva] = useState('')
  const [view, setView] = useState('templates')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    api.getTiendas()
      .then(r => {
        setTiendas(r.tiendas)
        if (r.tiendas.length) setTiendaActiva(r.tiendas[0])
      })
      .catch(console.error)
  }, [])

  function goEditor(id = null) {
    setEditingId(id)
    setView('editor')
  }

  function goList() {
    setEditingId(null)
    setView('templates')
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header
        tiendas={tiendas}
        tiendaActiva={tiendaActiva}
        onTiendaChange={setTiendaActiva}
      />
      <main className="max-w-7xl mx-auto px-8 py-8">
        {view === 'templates' && (
          <TemplateList
            onNuevo={() => goEditor(null)}
            onEditar={(id) => goEditor(id)}
          />
        )}
        {view === 'editor' && (
          <TemplateEditor
            templateId={editingId}
            tienda={tiendaActiva}
            onVolver={goList}
          />
        )}
      </main>
    </div>
  )
}
```

- [ ] **Verificar en browser — flujo completo**

1. Abrir http://localhost:5175/
2. Lista de templates → click "+ Nuevo template"
3. Se abre editor con botón "← Volver"
4. Escribir nombre: "Test MVP"
5. Escribir HTML: `<h2 style="color:#90263a">{{nombre}}</h2><p>Precio: ${{precio}}</p>`
6. Click picker `{{nombre}}` — se inserta en el textarea
7. Seleccionar producto del dropdown
8. Click "Preview" — debe aparecer el HTML renderizado con datos reales
9. Click "Guardar" — vuelve a la lista con el template creado
10. Click "Editar" — vuelve al editor con el template cargado
11. Click "← Volver" — regresa a la lista

- [ ] **Commit final**

```bash
git add apps/cro/frontend/src/views/TemplateEditor.jsx apps/cro/frontend/src/App.jsx
git commit -m "feat(cro): TemplateEditor — editor HTML + variable picker + preview en vivo"
```

---

## Self-Review

**Spec coverage:**
- ✅ FastAPI backend en apps/cro/backend/ (Task 1, 4, 5)
- ✅ Rutas /api/tiendas, /productos, /categorias, /producto/{id} (Task 4)
- ✅ CRUD /api/templates (Task 5)
- ✅ POST /api/preview con Jinja2 (Task 4, 5)
- ✅ template_store — JSONs en templates/ (Task 2)
- ✅ tn_service — wrappea tn/ toolkit (Task 3)
- ✅ Variables: nombre, precio, precio_promo, variantes, imagen, categorias, descripcion (Task 3)
- ✅ React frontend en apps/cro/frontend/ (Task 6)
- ✅ Selector de tienda global (Task 7)
- ✅ Lista de templates (Task 8)
- ✅ Editor HTML + variable picker (Task 9)
- ✅ Preview en vivo con producto real (Task 9)
- ✅ Botón "← Volver" en el editor (Task 9)
- ✅ Tests: template_store, tn_service, preview_service, health (Tasks 1-4)

**Placeholder scan:** Ninguno.

**Type consistency:** `tienda` (str), `template_id` (str/uuid), `producto_id` (int) — consistente en toda la cadena.
