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
