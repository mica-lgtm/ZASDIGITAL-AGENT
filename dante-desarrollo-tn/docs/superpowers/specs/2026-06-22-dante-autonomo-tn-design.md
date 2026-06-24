# Dante Autónomo — Desarrollador de Conversión y Front en Tienda Nube (vía API)

> Spec de diseño · 2026-06-22
> Estado: aprobado por Mica · listo para plan de implementación

## 1. Objetivo

Reestructurar el agente **Dante** para que opere de forma **autónoma**, sin depender de Mora ni del rol-play de la agencia ZAS. Dante pasa a ser un Desarrollador Senior de Conversión y Front para Tienda Nube que:

1. Hace cambios reales en la tienda **vía la Admin API oficial de Tienda Nube** (con token).
2. Edita todo el front (estética, CTAs, urgencia, banners, UX) sin tocar el código del tema, usando la **Scripts API**.
3. Construye **landings conectadas al checkout nativo** de TN (cart permalinks / draft orders).
4. **Mide** el impacto de cada cambio y **aprende** de forma acumulativa.

### Restricciones duras

- **Dante opera SOLO dentro de `/Users/mica/Desktop/ZAS-AGENT/dante-desarrollo-tn`.** No lee ni escribe en ninguna otra carpeta (ni `../base-conocimiento-cuentas`, ni los agentes hermanos).
- **Fuente de verdad = la tienda viva vía API.** Dante nunca inventa datos de tienda (URL, precios, productos, stock): los consulta.
- **Stack = Python** (consistente con los demás agentes de automatización del Centro de Mando, p. ej. emi).
- **Multi-tienda** por diseño, pero el ciclo de aprender/medir arranca en **una tienda piloto**.

## 2. Arquitectura — Enfoque elegido

**Enfoque A: Toolkit + Persona + Ledger de experimentos**, todo autocontenido en la carpeta de Dante.

Descartados (documentados para referencia):
- **B (microservicio FastAPI + dashboard):** requiere hosting always-on; overkill para esta etapa.
- **C (servidor MCP de Tienda Nube):** elegante y reutilizable por otros agentes, pero más ingeniería upfront. Reservado como **fase 2**, evolucionando desde A.

## 3. Estructura de carpeta

```
dante-desarrollo-tn/
├── CLAUDE.md                 # identidad autónoma reescrita (sin Mora/ZAS)
├── README.md                 # uso del toolkit + setup
├── .env.example              # plantilla de credenciales por tienda
├── .gitignore                # ignora .env, __pycache__, snapshots
├── requirements.txt          # requests, python-dotenv
├── tn/                       # EL TOOLKIT (paquete Python)
│   ├── __init__.py
│   ├── client.py             # cliente API: auth, rate-limit, retries, User-Agent
│   ├── tiendas.py            # registro multi-tienda (store_id + token por marca)
│   ├── productos.py          # leer/editar productos, precios, variantes
│   ├── scripts.py            # Scripts API: registrar/listar/borrar JS inyectado
│   ├── checkout.py           # cart permalinks / draft orders → URL de checkout
│   ├── metricas.py           # órdenes, conversión, ventana de experimento
│   └── snapshot.py           # estado real de la tienda vía API (fuente de verdad)
├── front/                    # assets que se inyectan al storefront
│   ├── _base/                # helpers JS compartidos (tracking, asignación A/B)
│   └── <tienda>/<exp>/        # variant.js + variant.css por experimento
├── experimentos/             # EL LEDGER DE APRENDIZAJE
│   ├── _PLANTILLA.md
│   └── <tienda>/EXP-001-<slug>/
│       ├── brief.md           # hipótesis + métrica objetivo + diseño del test
│       ├── implementacion.md  # qué se inyectó/cambió (ids de scripts, archivos)
│       └── resultado.md       # antes/después, veredicto, aprendizaje
├── playbooks/                # procedimientos repetibles
│   ├── inyectar-cambio-front.md
│   ├── landing-a-checkout.md
│   ├── medir-experimento.md
│   └── auditoria-conversion.md
└── aprendizajes.md           # destilado acumulado: qué funciona / qué no
```

## 4. El toolkit `tn/`

### 4.1 `client.py` — cliente API base
- Base URL: `https://api.tiendanube.com/v1/{store_id}/`.
- Header obligatorio `Authentication: bearer {access_token}` y `User-Agent: Dante (mica@zasdigital.com)`.
- Manejo del **rate-limit (leaky bucket)**: lee headers `X-Rate-Limit-Remaining` / `X-Rate-Limit-Reset`; ante `429` espera `Retry-After` y reintenta con backoff.
- Métodos genéricos `get/post/put/delete` con paginación (header `Link`) y manejo de errores claro.

### 4.2 `tiendas.py` — registro multi-tienda
- Cada marca = `{nombre, store_id, token, url}` leído del `.env`.
- Función `tienda(nombre)` devuelve un `client` configurado. Cambiar de tienda = cambiar un parámetro.

### 4.3 `productos.py`
- Leer catálogo, precios, variantes, stock, imágenes.
- Editar (precio, descripción, atributos) para soporte de experimentos de pricing/copy.

### 4.4 `scripts.py` — Scripts API (el corazón del front)
- `registrar(url, where, event)`: da de alta un JS externo (`where`: `store` | `checkout` | `product` | ...; `event: onload`).
- `listar()` / `borrar(script_id)`: para rollback y limpieza.
- Nota técnica: la Scripts API referencia una **URL de JS externo**, no código inline (ver §5).

### 4.5 `checkout.py` — landing → checkout
- `cart_permalink(items)`: arma URL `/{url-tienda}/comprar/{variant_id}` (carrito pre-cargado → checkout nativo).
- `draft_order(items, cliente?)`: crea una orden borrador vía API y devuelve la URL de checkout.

### 4.6 `metricas.py`
- Lee `/orders` (filtros `created_at_min/max`, `status`), `/checkouts` (abandonados), cupones.
- Calcula, para una **ventana de experimento**: ventas, conversión proxy, AOV, cupones redimidos.
- Compara ventana antes vs. después / variante A vs. B.

### 4.7 `snapshot.py`
- Baja el estado real de una tienda (info, productos, precios) a un archivo local efímero (gitignored) para que Dante razone sobre datos reales sin inventar.

## 5. Cambios en el front vía API — pipeline

La Scripts API registra una **URL de JS externo**. Pipeline profesional:

1. Dante escribe `variant.js` (+ `variant.css` opcional) en `front/<tienda>/<exp>/`.
2. Se publica ese archivo en un **host estático** (GitHub raw / jsDelivr / Vercel) → queda una URL pública versionada.
3. Dante registra esa URL con `scripts.registrar(...)` (`where: store` o `checkout`).
4. El JS hace el trabajo: manipula DOM, aplica estética (inyecta CSS), inserta CTAs, banners, urgencia, badges, prueba social, etc. — **front totalmente editable sin tocar el tema**.

**Rollback:** todo script registrado guarda su `script_id` en `implementacion.md`; revertir = `scripts.borrar(script_id)`.

**Landing → checkout:** la landing (página TN o externa hosteada en el mismo host estático) arma el carrito con `cart_permalink` o `draft_order` y manda al usuario al checkout nativo de TN con el carrito pre-cargado, sin fricción.

## 6. Ciclo de aprendizaje (medición)

Cada cambio es un **experimento** con estructura fija:
- `brief.md` — hipótesis, métrica objetivo, diseño del test (A/B por cupón/UTM o por ventana temporal), criterio de éxito.
- `implementacion.md` — qué se inyectó, `script_id`s, archivos `front/`, fecha de publicación.
- `resultado.md` — datos antes/después (vía `metricas.py`), veredicto (gana/pierde/neutro), aprendizaje destilado.

### Niveles de medición (honestidad técnica)
La API de TN expone datos a **nivel de orden/venta**, no analytics de pageviews/CTR.
- **Nivel ventas (día 1):** `metricas.py` con órdenes + atribución por cupón / UTM / ventana temporal. Funciona sin infraestructura extra.
- **Nivel clics (opcional):** el `variant.js` inyectado emite su propia telemetría (eventos a un colector simple o a GA4 si la tienda lo tiene). Se activa solo cuando un experimento necesita medir interacción fina.

El destilado de todos los experimentos se acumula en `aprendizajes.md`. Eso es lo que hace que **Dante aprenda**: cada tienda nueva arranca con el conocimiento ganado en las anteriores.

## 7. Identidad (`CLAUDE.md` reescrito)

Dante deja de reportar a Mora y de operar dentro del rol-play de agencia. Nueva definición:

- **Rol:** Desarrollador Senior de Conversión y Front en Tienda Nube. Autónomo. Trabaja directo con Mica.
- **Fuente de verdad:** la tienda viva (API). Nunca inventa datos de tienda.
- **Ámbito:** opera SOLO en su carpeta.
- **Ciclo de trabajo:** Auditar → Hipotetizar → Implementar (vía API) → Medir → Aprender → Iterar.
- **Reglas duras:** probar antes de publicar · todo cambio es un experimento con métrica y plan de rollback · comunicar en términos de impacto de negocio (conversión, AOV, velocidad) · si falta un dato de tienda, consultarlo por API, no inventarlo.

## 8. Setup / credenciales

- `.env.example` con la plantilla: por cada marca, `DANTE_<MARCA>_STORE_ID` y `DANTE_<MARCA>_TOKEN`.
- `.env` real (gitignored) lo carga Mica.
- Token: app en el Partners Portal de TN o token de la propia tienda.
- La **tienda piloto** se define al cerrar el setup.

## 9. Criterios de éxito

- Dante puede, vía API y solo desde su carpeta: leer el estado real de una tienda, registrar/quitar un script de front, armar un checkout pre-cargado, y reportar métricas de una ventana.
- Existe al menos un experimento completo (brief → implementación → resultado) sobre la tienda piloto.
- `CLAUDE.md` refleja la identidad autónoma; no quedan referencias a Mora/ZAS como dependencia operativa.

## 10. Fuera de alcance (por ahora)

- Servidor MCP de TN (fase 2).
- Microservicio always-on / dashboard.
- Edición directa del código del tema (TN no lo expone por API; se trabaja vía Scripts API).
- Analytics de pageviews server-side (se cubre con telemetría client-side opcional + datos de orden).
