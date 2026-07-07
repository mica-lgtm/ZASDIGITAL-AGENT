# Estructuras por tipo de campaña

Referencia de estructuras ganadoras por tipo de campaña de Google Ads. Se actualiza con lo que realmente funciona por cuenta (ver `benchmarks-google-ads.md`), no con supuestos genéricos de internet.

## Search

- Un objetivo por campaña (prospecting, remarketing, marca, recompra). Si hay varios objetivos, son varias campañas -- mismo principio que usa Mateo en Meta Ads.
- Grupos de anuncios temáticos (por categoría de producto o intención de búsqueda), no un solo grupo genérico con todas las keywords mezcladas.
- Mínimo 2-3 RSA por grupo de anuncios activo, con headlines/descriptions rotando según `performance_label` (ver `ad_group_ad_asset_view` en los reportes).
- Negativas a nivel cuenta (`negativas-baseline.md`) + negativas propias de la marca (ficha en `cuentas/<marca>.md`).

## Shopping / Performance Max

- Segmentar asset groups/product groups por categoría o margen, no un solo grupo con todo el catálogo.
- PMax requiere señales de audiencia de calidad (listas de remarketing, clientes) para arrancar mejor -- si no existen, marcarlo como dato pendiente antes de proponer una PMax nueva.
- La creación de campañas Performance Max vía API es más compleja (requiere `AssetGroupService` y armar listing group filters) -- ver nota de alcance en `ads/mutate.py`. Hasta que esa rama esté lista, una propuesta de PMax se entrega en formato de estructura/copy, y `aplicar_propuesta.py` rechaza ejecutarla automáticamente hasta que exista soporte.

## Display

- Solo como remarketing/branding complementario, nunca como canal principal de conversión salvo que la marca lo pida explícitamente.

## Checklist antes de proponer una campaña nueva

1. ¿Hay un solo objetivo claro?
2. ¿La ficha de la marca tiene tope de presupuesto y conversion actions confirmadas?
3. ¿Hay negativas de base aplicadas?
4. ¿El naming sigue la convención de `CLAUDE.md`?
