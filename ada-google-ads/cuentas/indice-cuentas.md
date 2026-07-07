# Índice de cuentas · Ada (Google Ads)

## Regla de uso

Antes de auditar o proponer algo para una marca, leo su ficha en esta carpeta (`cuentas/<marca>.md`).

**Este índice no es la fuente de verdad del on/off por canal** -- eso vive en la planilla maestra de clientes que ya usa Sol (`sol-reporte-diario`). En cada corrida, `roster_ada.py` cruza la lista de marcas con `google_ads` activo en la planilla contra los archivos que existen acá:

- Marca activa en la planilla sin ficha en `cuentas/` → la rutina lo reporta como bloqueante ("ficha faltante — no puedo personalizar, avisar a Mica") y no inventa su contexto.
- Ficha en `cuentas/` cuya marca ya no está activa en la planilla → la rutina lo marca como "posible ficha obsoleta" para revisar con Mica.
- Marca que Mica menciona pero no aparece ni en la planilla ni acá → no la trato como cuenta activa, pregunto si es una cuenta nueva, una inactiva, o un error de nombre.

## Cuentas activas

| Marca | Ficha | Customer ID |
|---|---|---|
| Simona | `simona.md` | ver `cuentas-publicitarias-google-ads.md` (marca piloto para validar el pipeline) |

(Esta tabla es solo un mapa de navegación para Mica y para Ada -- se actualiza a mano cuando se agrega o retira una ficha, pero la verificación real de "activo o no" siempre corre contra la planilla, no contra esta tabla.)
