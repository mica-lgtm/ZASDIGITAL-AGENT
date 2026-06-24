# Dante · Toolkit Tienda Nube

Toolkit autónomo para subir conversión en Tienda Nube vía Admin API.

## Setup

1. Instalar deps: `python3 -m pip install -r requirements.txt`
2. Copiar `.env.example` → `.env` y completar por marca:
   `DANTE_PILOTO_STORE_ID`, `DANTE_PILOTO_TOKEN`, `DANTE_PILOTO_URL`.
   Token: app en el Partners Portal de TN o token de la tienda.
3. Verificar conexión:
   `python3 -c "from tn.tiendas import tienda; from tn import snapshot; print(snapshot.snapshot_tienda(tienda('piloto'))['info']['name'])"`

## Uso rápido

    from tn.tiendas import tienda
    from tn import productos, scripts, checkout, metricas, snapshot

    c = tienda("piloto")
    snapshot.snapshot_tienda(c)                 # estado real
    scripts.registrar(c, "https://cdn/x.js")    # inyectar front
    checkout.cart_permalink(url, [(900, 1)])    # landing → checkout
    metricas.resumen_ventana(c, "2026-06-01", "2026-06-30")

## Estructura

- `tn/` — toolkit API · `front/` — assets inyectables · `experimentos/` — ledger
- `playbooks/` — procedimientos · `aprendizajes.md` — destilado · `CLAUDE.md` — identidad

## Tests

`python3 -m pytest -v`
