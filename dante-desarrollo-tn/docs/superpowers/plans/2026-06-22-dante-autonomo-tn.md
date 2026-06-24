# Dante Autónomo (Tienda Nube vía API) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el toolkit Python + la identidad autónoma de Dante para operar Tienda Nube vía Admin API (front, checkout, métricas, aprendizaje), todo confinado a `dante-desarrollo-tn/`.

**Architecture:** Enfoque A — paquete Python `tn/` (cliente API testeable con HTTP mockeado) + assets de front inyectables + ledger de experimentos + identidad reescrita. La tienda viva (API) es la fuente de verdad; el código del front se inyecta vía Scripts API (URL externa), nunca tocando el tema.

**Tech Stack:** Python 3, `requests`, `python-dotenv`, `pytest`, `requests-mock`. JS vanilla para los assets inyectados.

**Working dir:** Todas las rutas son relativas a `/Users/mica/Desktop/ZAS-AGENT/dante-desarrollo-tn/`.

---

## File Structure

- `requirements.txt`, `.gitignore`, `.env.example`, `pytest.ini` — scaffolding
- `tn/__init__.py` — marca el paquete
- `tn/client.py` — `TiendaNubeClient` (auth, rate-limit, paginación)
- `tn/tiendas.py` — `cargar_tiendas()`, `tienda(nombre)`
- `tn/productos.py` — leer/editar catálogo
- `tn/scripts.py` — Scripts API (front injection)
- `tn/checkout.py` — `cart_permalink()`, `draft_order()`
- `tn/metricas.py` — `ordenes()`, `resumen_ventana()`
- `tn/snapshot.py` — `snapshot_tienda()`
- `tests/` — un test por módulo
- `front/_base/tracking.js`, `front/_base/ab-assign.js` — helpers inyectables
- `experimentos/_PLANTILLA.md` — plantilla de experimento
- `playbooks/*.md` — 4 procedimientos
- `aprendizajes.md` — destilado acumulado
- `CLAUDE.md` — identidad autónoma (reescritura)
- `README.md` — uso y setup

---

## Task 1: Scaffolding del proyecto

**Files:**
- Create: `requirements.txt`, `.gitignore`, `.env.example`, `pytest.ini`, `tn/__init__.py`, `tests/__init__.py`

- [ ] **Step 1: Crear `requirements.txt`**

```
requests>=2.31
python-dotenv>=1.0
pytest>=8.0
requests-mock>=1.12
```

- [ ] **Step 2: Crear `.gitignore`**

```
.env
__pycache__/
*.pyc
.snapshots/
.pytest_cache/
```

- [ ] **Step 3: Crear `.env.example`**

```
# Por cada marca: STORE_ID, TOKEN y URL pública de la tienda.
# Copiar a .env (gitignored) y completar con datos reales.
DANTE_PILOTO_STORE_ID=000000
DANTE_PILOTO_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DANTE_PILOTO_URL=https://www.mitiendanube.com/...
```

- [ ] **Step 4: Crear `pytest.ini`**

```ini
[pytest]
testpaths = tests
python_files = test_*.py
```

- [ ] **Step 5: Crear paquetes vacíos**

`tn/__init__.py`:
```python
"""Toolkit de Dante para operar Tienda Nube vía Admin API."""
```

`tests/__init__.py`:
```python
```

- [ ] **Step 6: Instalar dependencias**

Run: `cd /Users/mica/Desktop/ZAS-AGENT/dante-desarrollo-tn && python3 -m pip install -r requirements.txt`
Expected: instala requests, python-dotenv, pytest, requests-mock sin error.

- [ ] **Step 7: Commit**

```bash
git add dante-desarrollo-tn/requirements.txt dante-desarrollo-tn/.gitignore dante-desarrollo-tn/.env.example dante-desarrollo-tn/pytest.ini dante-desarrollo-tn/tn/__init__.py dante-desarrollo-tn/tests/__init__.py
git commit -m "chore(dante): scaffolding del toolkit Python"
```

---

## Task 2: Cliente API base (`tn/client.py`)

**Files:**
- Create: `tn/client.py`
- Test: `tests/test_client.py`

- [ ] **Step 1: Escribir el test que falla**

`tests/test_client.py`:
```python
import time
import pytest
from tn.client import TiendaNubeClient


def make_client():
    return TiendaNubeClient(store_id="123", token="tok")


def test_headers_incluyen_auth_y_user_agent():
    c = make_client()
    h = c._headers()
    assert h["Authentication"] == "bearer tok"
    assert "Dante" in h["User-Agent"]


def test_get_devuelve_json(requests_mock):
    c = make_client()
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/store",
        json={"id": 123, "name": "Piloto"},
    )
    assert c.get("store")["name"] == "Piloto"


def test_get_all_sigue_paginacion_por_link(requests_mock):
    c = make_client()
    base = "https://api.tiendanube.com/v1/123/products"
    requests_mock.get(
        base,
        json=[{"id": 1}],
        headers={"Link": f'<{base}?page=2>; rel="next"'},
    )
    requests_mock.get(f"{base}?page=2", json=[{"id": 2}])
    todos = c.get_all("products")
    assert [p["id"] for p in todos] == [1, 2]


def test_reintenta_en_429(requests_mock, monkeypatch):
    monkeypatch.setattr(time, "sleep", lambda s: None)
    c = make_client()
    url = "https://api.tiendanube.com/v1/123/store"
    requests_mock.get(
        url,
        [
            {"status_code": 429, "headers": {"Retry-After": "1"}, "json": {}},
            {"status_code": 200, "json": {"ok": True}},
        ],
    )
    assert c.get("store") == {"ok": True}
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd dante-desarrollo-tn && python3 -m pytest tests/test_client.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'tn.client'`.

- [ ] **Step 3: Implementar `tn/client.py`**

```python
import time
import requests

USER_AGENT = "Dante (mica@zasdigital.com)"


class TiendaNubeClient:
    BASE = "https://api.tiendanube.com/v1"

    def __init__(self, store_id, token, user_agent=USER_AGENT, max_retries=3):
        self.store_id = str(store_id)
        self.token = token
        self.user_agent = user_agent
        self.max_retries = max_retries

    def _headers(self):
        return {
            "Authentication": f"bearer {self.token}",
            "User-Agent": self.user_agent,
            "Content-Type": "application/json",
        }

    def _url(self, path):
        return f"{self.BASE}/{self.store_id}/{path.lstrip('/')}"

    def _request(self, method, url, **kwargs):
        for intento in range(self.max_retries + 1):
            resp = requests.request(method, url, headers=self._headers(), **kwargs)
            if resp.status_code == 429 and intento < self.max_retries:
                time.sleep(float(resp.headers.get("Retry-After", 1)))
                continue
            resp.raise_for_status()
            return resp
        resp.raise_for_status()
        return resp

    def get(self, path, params=None):
        return self._request("GET", self._url(path), params=params).json()

    def get_all(self, path, params=None):
        items = []
        url = self._url(path)
        while url:
            resp = self._request("GET", url, params=params)
            params = None  # la URL de next ya trae los params
            items.extend(resp.json())
            url = resp.links.get("next", {}).get("url")
        return items

    def post(self, path, json):
        return self._request("POST", self._url(path), json=json).json()

    def put(self, path, json):
        return self._request("PUT", self._url(path), json=json).json()

    def delete(self, path):
        resp = self._request("DELETE", self._url(path))
        return resp.status_code in (200, 204)
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd dante-desarrollo-tn && python3 -m pytest tests/test_client.py -v`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add dante-desarrollo-tn/tn/client.py dante-desarrollo-tn/tests/test_client.py
git commit -m "feat(dante): cliente API TN con rate-limit y paginación"
```

---

## Task 3: Registro multi-tienda (`tn/tiendas.py`)

**Files:**
- Create: `tn/tiendas.py`
- Test: `tests/test_tiendas.py`

- [ ] **Step 1: Escribir el test que falla**

`tests/test_tiendas.py`:
```python
import pytest
from tn.tiendas import cargar_tiendas, tienda

ENV = {
    "DANTE_PILOTO_STORE_ID": "123",
    "DANTE_PILOTO_TOKEN": "tok",
    "DANTE_PILOTO_URL": "https://piloto.example",
    "OTRA_VAR": "ignorar",
}


def test_cargar_tiendas_parsea_por_marca():
    t = cargar_tiendas(ENV)
    assert t["piloto"]["store_id"] == "123"
    assert t["piloto"]["token"] == "tok"
    assert t["piloto"]["url"] == "https://piloto.example"


def test_tienda_devuelve_cliente_configurado():
    c = tienda("piloto", ENV)
    assert c.store_id == "123"
    assert c.token == "tok"


def test_tienda_inexistente_falla():
    with pytest.raises(KeyError):
        tienda("noexiste", ENV)
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd dante-desarrollo-tn && python3 -m pytest tests/test_tiendas.py -v`
Expected: FAIL — `ModuleNotFoundError`.

- [ ] **Step 3: Implementar `tn/tiendas.py`**

```python
import os
from dotenv import load_dotenv
from tn.client import TiendaNubeClient

load_dotenv()  # carga .env si existe

PREFIJO = "DANTE_"


def cargar_tiendas(env=None):
    env = os.environ if env is None else env
    tiendas = {}
    for clave, valor in env.items():
        if not clave.startswith(PREFIJO) or not clave.endswith("_STORE_ID"):
            continue
        marca = clave[len(PREFIJO):-len("_STORE_ID")].lower()
        tiendas[marca] = {
            "store_id": valor,
            "token": env.get(f"{PREFIJO}{marca.upper()}_TOKEN"),
            "url": env.get(f"{PREFIJO}{marca.upper()}_URL"),
        }
    return tiendas


def tienda(nombre, env=None):
    datos = cargar_tiendas(env)[nombre.lower()]
    return TiendaNubeClient(store_id=datos["store_id"], token=datos["token"])
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd dante-desarrollo-tn && python3 -m pytest tests/test_tiendas.py -v`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add dante-desarrollo-tn/tn/tiendas.py dante-desarrollo-tn/tests/test_tiendas.py
git commit -m "feat(dante): registro multi-tienda desde .env"
```

---

## Task 4: Productos (`tn/productos.py`)

**Files:**
- Create: `tn/productos.py`
- Test: `tests/test_productos.py`

- [ ] **Step 1: Escribir el test que falla**

`tests/test_productos.py`:
```python
from tn.client import TiendaNubeClient
from tn import productos


def c():
    return TiendaNubeClient(store_id="123", token="tok")


def test_listar_productos(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/products", json=[{"id": 1}, {"id": 2}]
    )
    assert len(productos.listar(c())) == 2


def test_obtener_producto(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/products/9", json={"id": 9}
    )
    assert productos.obtener(c(), 9)["id"] == 9


def test_actualizar_producto(requests_mock):
    requests_mock.put(
        "https://api.tiendanube.com/v1/123/products/9", json={"id": 9, "name": "Nuevo"}
    )
    assert productos.actualizar(c(), 9, {"name": "Nuevo"})["name"] == "Nuevo"
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd dante-desarrollo-tn && python3 -m pytest tests/test_productos.py -v`
Expected: FAIL — `ModuleNotFoundError`.

- [ ] **Step 3: Implementar `tn/productos.py`**

```python
def listar(client, **params):
    return client.get_all("products", params or None)


def obtener(client, producto_id):
    return client.get(f"products/{producto_id}")


def actualizar(client, producto_id, data):
    return client.put(f"products/{producto_id}", data)
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd dante-desarrollo-tn && python3 -m pytest tests/test_productos.py -v`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add dante-desarrollo-tn/tn/productos.py dante-desarrollo-tn/tests/test_productos.py
git commit -m "feat(dante): lectura/edición de productos"
```

---

## Task 5: Scripts API — front injection (`tn/scripts.py`)

**Files:**
- Create: `tn/scripts.py`
- Test: `tests/test_scripts.py`

- [ ] **Step 1: Escribir el test que falla**

`tests/test_scripts.py`:
```python
from tn.client import TiendaNubeClient
from tn import scripts


def c():
    return TiendaNubeClient(store_id="123", token="tok")


def test_registrar_script(requests_mock):
    requests_mock.post(
        "https://api.tiendanube.com/v1/123/scripts",
        json={"id": 55, "src": "https://cdn/x.js", "event": "onload", "where": "store"},
    )
    r = scripts.registrar(c(), "https://cdn/x.js", where="store")
    assert r["id"] == 55
    assert requests_mock.last_request.json()["src"] == "https://cdn/x.js"
    assert requests_mock.last_request.json()["where"] == "store"


def test_listar_scripts(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/scripts", json=[{"id": 55}]
    )
    assert scripts.listar(c())[0]["id"] == 55


def test_borrar_script(requests_mock):
    requests_mock.delete(
        "https://api.tiendanube.com/v1/123/scripts/55", status_code=200
    )
    assert scripts.borrar(c(), 55) is True
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd dante-desarrollo-tn && python3 -m pytest tests/test_scripts.py -v`
Expected: FAIL — `ModuleNotFoundError`.

- [ ] **Step 3: Implementar `tn/scripts.py`**

```python
def registrar(client, src, event="onload", where="store"):
    """Da de alta un JS externo en el storefront/checkout.

    src: URL pública del .js (host estático).
    where: 'store' | 'checkout' | 'product' | ...
    """
    return client.post("scripts", {"src": src, "event": event, "where": where})


def listar(client):
    return client.get("scripts")


def borrar(client, script_id):
    return client.delete(f"scripts/{script_id}")
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd dante-desarrollo-tn && python3 -m pytest tests/test_scripts.py -v`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add dante-desarrollo-tn/tn/scripts.py dante-desarrollo-tn/tests/test_scripts.py
git commit -m "feat(dante): Scripts API para inyectar front"
```

---

## Task 6: Checkout — landing → carrito (`tn/checkout.py`)

**Files:**
- Create: `tn/checkout.py`
- Test: `tests/test_checkout.py`

- [ ] **Step 1: Escribir el test que falla**

`tests/test_checkout.py`:
```python
from tn.client import TiendaNubeClient
from tn import checkout


def c():
    return TiendaNubeClient(store_id="123", token="tok")


def test_cart_permalink_un_item():
    url = checkout.cart_permalink("https://piloto.example", [(900, 1)])
    assert url == "https://piloto.example/comprar/900"


def test_cart_permalink_varios_items_usa_query():
    url = checkout.cart_permalink("https://piloto.example/", [(900, 2), (901, 1)])
    assert url.startswith("https://piloto.example/comprar/900?")
    assert "add_to_cart=901:1" in url


def test_draft_order_devuelve_checkout_url(requests_mock):
    requests_mock.post(
        "https://api.tiendanube.com/v1/123/draft_orders",
        json={"id": 7, "checkout_url": "https://piloto.example/checkout/7"},
    )
    r = checkout.draft_order(c(), [(900, 1)])
    assert r["checkout_url"].endswith("/checkout/7")
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd dante-desarrollo-tn && python3 -m pytest tests/test_checkout.py -v`
Expected: FAIL — `ModuleNotFoundError`.

- [ ] **Step 3: Implementar `tn/checkout.py`**

```python
def cart_permalink(store_url, items):
    """Arma una URL que pre-carga el carrito y cae en el checkout nativo.

    items: lista de (variant_id, cantidad). El primero define el permalink base;
    el resto se agrega vía query `add_to_cart=variant:qty`.
    """
    base = store_url.rstrip("/")
    primer_id, _ = items[0]
    url = f"{base}/comprar/{primer_id}"
    extras = [f"add_to_cart={vid}:{qty}" for vid, qty in items[1:]]
    if extras:
        url += "?" + "&".join(extras)
    return url


def draft_order(client, items, customer=None):
    """Crea una orden borrador y devuelve la respuesta (incluye checkout_url)."""
    payload = {
        "products": [{"variant_id": vid, "quantity": qty} for vid, qty in items]
    }
    if customer:
        payload["customer"] = customer
    return client.post("draft_orders", payload)
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd dante-desarrollo-tn && python3 -m pytest tests/test_checkout.py -v`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add dante-desarrollo-tn/tn/checkout.py dante-desarrollo-tn/tests/test_checkout.py
git commit -m "feat(dante): landing→checkout (permalink + draft order)"
```

---

## Task 7: Métricas (`tn/metricas.py`)

**Files:**
- Create: `tn/metricas.py`
- Test: `tests/test_metricas.py`

- [ ] **Step 1: Escribir el test que falla**

`tests/test_metricas.py`:
```python
from tn.client import TiendaNubeClient
from tn import metricas


def c():
    return TiendaNubeClient(store_id="123", token="tok")


def test_ordenes_pasa_filtros(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/orders",
        json=[{"id": 1, "total": "100.00"}],
    )
    o = metricas.ordenes(c(), desde="2026-06-01")
    assert o[0]["id"] == 1
    assert "created_at_min=2026-06-01" in requests_mock.last_request.url


def test_resumen_ventana_calcula_aov(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/orders",
        json=[{"id": 1, "total": "100.00"}, {"id": 2, "total": "300.00"}],
    )
    r = metricas.resumen_ventana(c(), desde="2026-06-01", hasta="2026-06-30")
    assert r["pedidos"] == 2
    assert r["ingresos"] == 400.0
    assert r["aov"] == 200.0


def test_resumen_ventana_sin_pedidos(requests_mock):
    requests_mock.get("https://api.tiendanube.com/v1/123/orders", json=[])
    r = metricas.resumen_ventana(c(), desde="2026-06-01", hasta="2026-06-30")
    assert r["pedidos"] == 0
    assert r["aov"] == 0
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd dante-desarrollo-tn && python3 -m pytest tests/test_metricas.py -v`
Expected: FAIL — `ModuleNotFoundError`.

- [ ] **Step 3: Implementar `tn/metricas.py`**

```python
def ordenes(client, desde, hasta=None, status=None):
    params = {"created_at_min": desde}
    if hasta:
        params["created_at_max"] = hasta
    if status:
        params["status"] = status
    return client.get_all("orders", params)


def resumen_ventana(client, desde, hasta=None, status=None):
    pedidos = ordenes(client, desde, hasta, status)
    ingresos = sum(float(o.get("total", 0)) for o in pedidos)
    n = len(pedidos)
    return {
        "pedidos": n,
        "ingresos": round(ingresos, 2),
        "aov": round(ingresos / n, 2) if n else 0,
    }
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd dante-desarrollo-tn && python3 -m pytest tests/test_metricas.py -v`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add dante-desarrollo-tn/tn/metricas.py dante-desarrollo-tn/tests/test_metricas.py
git commit -m "feat(dante): métricas de ventana (ventas, AOV)"
```

---

## Task 8: Snapshot — fuente de verdad (`tn/snapshot.py`)

**Files:**
- Create: `tn/snapshot.py`
- Test: `tests/test_snapshot.py`

- [ ] **Step 1: Escribir el test que falla**

`tests/test_snapshot.py`:
```python
from tn.client import TiendaNubeClient
from tn import snapshot


def c():
    return TiendaNubeClient(store_id="123", token="tok")


def test_snapshot_junta_info_y_productos(requests_mock):
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/store", json={"id": 123, "name": "Piloto"}
    )
    requests_mock.get(
        "https://api.tiendanube.com/v1/123/products",
        json=[{"id": 1, "name": "P1"}],
    )
    snap = snapshot.snapshot_tienda(c())
    assert snap["info"]["name"] == "Piloto"
    assert snap["productos"][0]["name"] == "P1"
    assert snap["total_productos"] == 1
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd dante-desarrollo-tn && python3 -m pytest tests/test_snapshot.py -v`
Expected: FAIL — `ModuleNotFoundError`.

- [ ] **Step 3: Implementar `tn/snapshot.py`**

```python
from tn import productos


def snapshot_tienda(client):
    """Estado real de la tienda vía API. Fuente de verdad para no inventar datos."""
    info = client.get("store")
    prods = productos.listar(client)
    return {
        "info": info,
        "productos": prods,
        "total_productos": len(prods),
    }
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd dante-desarrollo-tn && python3 -m pytest tests/test_snapshot.py -v`
Expected: PASS (1 test).

- [ ] **Step 5: Correr la suite completa**

Run: `cd dante-desarrollo-tn && python3 -m pytest -v`
Expected: PASS (todos los tests de Tasks 2-8).

- [ ] **Step 6: Commit**

```bash
git add dante-desarrollo-tn/tn/snapshot.py dante-desarrollo-tn/tests/test_snapshot.py
git commit -m "feat(dante): snapshot de tienda como fuente de verdad"
```

---

## Task 9: Assets de front inyectables (`front/_base/`)

**Files:**
- Create: `front/_base/tracking.js`, `front/_base/ab-assign.js`, `front/README.md`

- [ ] **Step 1: Crear `front/_base/ab-assign.js`**

```javascript
/* Asignación A/B estable por visitante (persistida en localStorage). */
(function (global) {
  function variante(expId, pesoA) {
    var clave = "dante_ab_" + expId;
    var guardada = localStorage.getItem(clave);
    if (guardada) return guardada;
    var v = Math.random() < (pesoA == null ? 0.5 : pesoA) ? "A" : "B";
    localStorage.setItem(clave, v);
    return v;
  }
  global.DanteAB = { variante: variante };
})(window);
```

- [ ] **Step 2: Crear `front/_base/tracking.js`**

```javascript
/* Telemetría client-side opcional. Emite eventos del experimento.
   Por defecto usa GA4 (gtag) si está presente; si no, no rompe. */
(function (global) {
  function evento(nombre, params) {
    try {
      if (typeof global.gtag === "function") {
        global.gtag("event", nombre, params || {});
      }
      if (global.console) console.debug("[Dante]", nombre, params || {});
    } catch (e) {}
  }
  global.DanteTrack = { evento: evento };
})(window);
```

- [ ] **Step 3: Crear `front/README.md`**

```markdown
# Front inyectable

Assets que Dante registra en el storefront vía Scripts API (`tn/scripts.py`).

## Flujo
1. Escribir `variant.js` (+ `variant.css`) en `front/<tienda>/<experimento>/`.
2. Publicar el archivo en un host estático (GitHub raw / jsDelivr / Vercel) → URL pública.
3. Registrar la URL: `scripts.registrar(client, src=URL, where="store")`.
4. Guardar el `script_id` devuelto en `experimentos/.../implementacion.md`.

## Helpers compartidos (`_base/`)
- `ab-assign.js` → `DanteAB.variante(expId, pesoA)` devuelve "A"/"B" estable por visitante.
- `tracking.js` → `DanteTrack.evento(nombre, params)` emite telemetría (GA4 si existe).

## Rollback
`scripts.borrar(client, script_id)` quita el script del storefront.
```

- [ ] **Step 4: Commit**

```bash
git add dante-desarrollo-tn/front
git commit -m "feat(dante): helpers de front (A/B + tracking) y guía de inyección"
```

---

## Task 10: Plantilla de experimento (`experimentos/_PLANTILLA.md`)

**Files:**
- Create: `experimentos/_PLANTILLA.md`

- [ ] **Step 1: Crear `experimentos/_PLANTILLA.md`**

```markdown
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
```

- [ ] **Step 2: Crear `.gitkeep` en la estructura de tienda**

Run: `cd dante-desarrollo-tn && mkdir -p experimentos && touch experimentos/.gitkeep`

- [ ] **Step 3: Commit**

```bash
git add dante-desarrollo-tn/experimentos
git commit -m "feat(dante): plantilla de experimento (brief/impl/resultado)"
```

---

## Task 11: Playbooks (`playbooks/`)

**Files:**
- Create: `playbooks/inyectar-cambio-front.md`, `playbooks/landing-a-checkout.md`, `playbooks/medir-experimento.md`, `playbooks/auditoria-conversion.md`

- [ ] **Step 1: Crear `playbooks/inyectar-cambio-front.md`**

```markdown
# Playbook · Inyectar un cambio de front

1. Crear `experimentos/<tienda>/EXP-NNN-<slug>/` copiando `experimentos/_PLANTILLA.md`.
2. Escribir `front/<tienda>/EXP-NNN-<slug>/variant.js` (+ `variant.css` si hace falta).
   Usar `DanteAB.variante()` si es A/B y `DanteTrack.evento()` para telemetría.
3. Publicar el archivo en el host estático → obtener URL pública.
4. Registrar: `python3 -c "from tn.tiendas import tienda; from tn import scripts; print(scripts.registrar(tienda('<tienda>'), '<url>', where='store'))"`.
5. Guardar el `script_id` en `implementacion.md`.
6. **Probar antes de dar por hecho:** abrir la tienda y verificar el cambio en vivo.
7. Si algo rompe: `scripts.borrar(tienda('<tienda>'), <script_id>)`.
```

- [ ] **Step 2: Crear `playbooks/landing-a-checkout.md`**

```markdown
# Playbook · Landing conectada al checkout

1. Identificar los `variant_id` de los productos (vía `tn/productos.py`).
2. Para 1 producto: `checkout.cart_permalink(url_tienda, [(variant_id, 1)])`.
3. Para varios / con cliente: `checkout.draft_order(client, items)` → usar `checkout_url`.
4. En la landing, el botón de compra apunta a esa URL → cae en el checkout nativo de TN.
5. Atribución: agregar UTM o un cupón propio del experimento para medir luego.
```

- [ ] **Step 3: Crear `playbooks/medir-experimento.md`**

```markdown
# Playbook · Medir un experimento

1. Definir la ventana (desde/hasta) en formato `YYYY-MM-DD`.
2. Ventana de control (antes) y de tratamiento (después), o segmentar por cupón/UTM.
3. `metricas.resumen_ventana(client, desde, hasta)` → pedidos / ingresos / AOV.
4. Cargar antes/después en `resultado.md`, dictar veredicto (GANA/PIERDE/NEUTRO).
5. Destilar el aprendizaje a `aprendizajes.md`.
```

- [ ] **Step 4: Crear `playbooks/auditoria-conversion.md`**

```markdown
# Playbook · Auditoría de conversión inicial

1. `snapshot.snapshot_tienda(client)` → estado real (info, productos, precios).
2. Revisar carritos abandonados: `client.get_all("checkouts")`.
3. `metricas.resumen_ventana()` del último mes → baseline de pedidos/AOV.
4. Listar 3-5 hipótesis de mejora priorizadas por impacto esperado vs. esfuerzo.
5. Cada hipótesis se convierte en un experimento (Task 10 plantilla).
```

- [ ] **Step 5: Commit**

```bash
git add dante-desarrollo-tn/playbooks
git commit -m "feat(dante): playbooks (front, checkout, medición, auditoría)"
```

---

## Task 12: Destilado de aprendizajes (`aprendizajes.md`)

**Files:**
- Create: `aprendizajes.md`

- [ ] **Step 1: Crear `aprendizajes.md`**

```markdown
# Aprendizajes de Dante

> Destilado acumulado de todos los experimentos. Cada tienda nueva arranca con esto.
> Formato: una línea por aprendizaje, con la evidencia (EXP que lo respalda).

## Qué funciona
- (vacío — se completa con el primer experimento ganador)

## Qué no funciona
- (vacío)

## Por validar
- (hipótesis interesantes aún sin testear)
```

- [ ] **Step 2: Commit**

```bash
git add dante-desarrollo-tn/aprendizajes.md
git commit -m "feat(dante): ledger de aprendizajes acumulados"
```

---

## Task 13: Identidad autónoma (`CLAUDE.md`)

**Files:**
- Modify (reescritura completa): `CLAUDE.md`

- [ ] **Step 1: Reescribir `CLAUDE.md`**

```markdown
# Dante · Desarrollador Autónomo de Conversión y Front en Tienda Nube

> Soy Dante. Desarrollador Senior de Conversión y Front para Tienda Nube.
> Trabajo de forma autónoma, directo con Mica. No dependo de Mora ni de ninguna estructura de agencia.
> Mi fuente de verdad es la tienda viva, vía la Admin API de Tienda Nube.

## Ámbito (regla dura)

Opero EXCLUSIVAMENTE dentro de esta carpeta (`dante-desarrollo-tn/`).
No leo ni escribo en ninguna otra carpeta del sistema.

## Qué hago

Subo la tasa de conversión de tiendas en Tienda Nube con cambios técnicos medibles, vía API:

1. **Audito** la tienda real (API): productos, precios, órdenes, carritos abandonados.
2. **Hipotetizo** mejoras priorizadas por impacto vs. esfuerzo.
3. **Implemento** vía API: inyecto front (Scripts API), edito catálogo, armo landings conectadas al checkout.
4. **Mido** el impacto con datos reales (ventas, AOV, telemetría opcional).
5. **Aprendo**: destilo cada experimento en `aprendizajes.md`.
6. **Itero**.

## Cómo toco la tienda (toolkit `tn/`)

- `tn/client.py` — cliente Admin API (auth, rate-limit, paginación).
- `tn/tiendas.py` — multi-tienda desde `.env` (`tienda('<marca>')`).
- `tn/productos.py` — leer/editar catálogo.
- `tn/scripts.py` — inyectar/quitar JS del front (Scripts API).
- `tn/checkout.py` — landing → checkout (cart permalink / draft order).
- `tn/metricas.py` — ventas, AOV por ventana.
- `tn/snapshot.py` — estado real de la tienda (no inventar nada).

## Cómo cambio el front (sin tocar el tema)

La Scripts API registra una URL de JS externo. Pipeline: escribo `variant.js` en `front/<tienda>/<exp>/` → lo publico en host estático → lo registro con `scripts.registrar(...)`. El JS manipula DOM/CSS, inserta CTAs, urgencia, prueba social, etc. Rollback = `scripts.borrar(script_id)`.

## Reglas duras

- **Probar antes de publicar.** Sin excepciones.
- **Nunca inventar datos de tienda** (URL, precios, stock, productos): los consulto por API.
- **Todo cambio es un experimento** con hipótesis, métrica objetivo y plan de rollback (ver `experimentos/_PLANTILLA.md`).
- **Comunico en impacto de negocio:** cuánto sube conversión/AOV, cuánto baja abandono.
- **Trabajo solo en mi carpeta.**

## Ciclo de aprendizaje

Cada experimento vive en `experimentos/<tienda>/EXP-NNN-<slug>/` con `brief` → `implementacion` → `resultado`. Lo que funciona se destila en `aprendizajes.md`, que me hace mejor con cada tienda.

## Setup

Credenciales en `.env` (ver `.env.example`): por marca, `DANTE_<MARCA>_STORE_ID`, `_TOKEN`, `_URL`. La tienda piloto se define al cerrar el setup. Detalle de uso en `README.md`.
```

- [ ] **Step 2: Verificar que no quedan referencias a Mora como dependencia**

Run: `cd dante-desarrollo-tn && grep -in "mora\|reporto a" CLAUDE.md || echo "sin dependencias de Mora"`
Expected: imprime "sin dependencias de Mora".

- [ ] **Step 3: Commit**

```bash
git add dante-desarrollo-tn/CLAUDE.md
git commit -m "feat(dante): identidad autónoma (sin Mora/ZAS, fuente de verdad = API)"
```

---

## Task 14: README de uso y setup (`README.md`)

**Files:**
- Create: `README.md`

- [ ] **Step 1: Crear `README.md`**

````markdown
# Dante · Toolkit Tienda Nube

Toolkit autónomo para subir conversión en Tienda Nube vía Admin API.

## Setup

1. Instalar deps: `python3 -m pip install -r requirements.txt`
2. Copiar `.env.example` → `.env` y completar por marca:
   ```
   DANTE_PILOTO_STORE_ID=...
   DANTE_PILOTO_TOKEN=...
   DANTE_PILOTO_URL=https://...
   ```
   Token: app en el Partners Portal de TN o token de la tienda.
3. Verificar conexión:
   ```bash
   python3 -c "from tn.tiendas import tienda; from tn import snapshot; print(snapshot.snapshot_tienda(tienda('piloto'))['info']['name'])"
   ```

## Uso rápido

```python
from tn.tiendas import tienda
from tn import productos, scripts, checkout, metricas, snapshot

c = tienda("piloto")
snapshot.snapshot_tienda(c)                 # estado real
scripts.registrar(c, "https://cdn/x.js")    # inyectar front
checkout.cart_permalink(url, [(900, 1)])    # landing → checkout
metricas.resumen_ventana(c, "2026-06-01", "2026-06-30")
```

## Estructura

- `tn/` — toolkit API · `front/` — assets inyectables · `experimentos/` — ledger
- `playbooks/` — procedimientos · `aprendizajes.md` — destilado · `CLAUDE.md` — identidad

## Tests

`python3 -m pytest -v`
````

- [ ] **Step 2: Commit**

```bash
git add dante-desarrollo-tn/README.md
git commit -m "docs(dante): README de uso y setup"
```

---

## Task 15: Verificación final

**Files:** (ninguno nuevo)

- [ ] **Step 1: Suite completa verde**

Run: `cd dante-desarrollo-tn && python3 -m pytest -v`
Expected: PASS — todos los tests (Tasks 2-8).

- [ ] **Step 2: Smoke import del paquete**

Run: `cd dante-desarrollo-tn && python3 -c "from tn import client, tiendas, productos, scripts, checkout, metricas, snapshot; print('imports OK')"`
Expected: imprime "imports OK".

- [ ] **Step 3: Confinamiento — sin rutas fuera de la carpeta**

Run: `cd dante-desarrollo-tn && grep -rn "\.\./" tn/ playbooks/ CLAUDE.md README.md || echo "sin rutas externas"`
Expected: imprime "sin rutas externas".

- [ ] **Step 4: Confirmar estado git limpio**

Run: `cd /Users/mica/Desktop/ZAS-AGENT && git status --short`
Expected: sin cambios pendientes en `dante-desarrollo-tn/` (todo commiteado).

---

## Setup pendiente del lado de Mica (post-implementación)

1. Crear/obtener el token de la API de TN y completar `.env`.
2. Elegir la **tienda piloto**.
3. Elegir el **host estático** para los `variant.js` (GitHub raw / jsDelivr / Vercel).
4. Correr la auditoría inicial (`playbooks/auditoria-conversion.md`) → primer experimento.
