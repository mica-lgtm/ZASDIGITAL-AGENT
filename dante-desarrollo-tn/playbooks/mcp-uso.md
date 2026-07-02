# Playbook · MCP server de Dante

El servidor MCP (`mcp_server/server.py`) expone el toolkit `tn/` como herramientas nativas de Claude Code: métricas, snapshot, productos, scripts, SEO, cupones y abandono, siempre resolviendo la tienda por nombre desde `.env`.

> El paquete local se llama `mcp_server/` (no `mcp/`) para no hacer sombra al paquete `mcp` instalado por pip.

## Requisitos

```bash
pip install "mcp[cli]>=1.0"   # ya está en requirements.txt
```

Credenciales en `.env` (patrón `DANTE_<MARCA>_STORE_ID/_TOKEN/_URL`).

## Registro en Claude Code

En `.claude/settings.json` del proyecto (o `~/.claude.json` global):

```json
{
  "mcpServers": {
    "dante-tn": {
      "command": "python",
      "args": ["-m", "mcp_server.server"],
      "cwd": "/ruta/a/dante-desarrollo-tn"
    }
  }
}
```

O por CLI:

```bash
claude mcp add dante-tn -- python -m mcp_server.server
```

(correr desde la raíz de `dante-desarrollo-tn/` para que `cwd` quede bien).

## Herramientas expuestas (16)

| Categoría | Herramientas |
|---|---|
| Tienda | `listar_tiendas`, `snapshot_tienda`, `snapshot_completo` |
| Métricas | `obtener_metricas`, `comparar_ventanas`, `top_productos`, `analizar_abandono` |
| Productos | `listar_productos`, `obtener_producto`, `actualizar_producto` |
| Scripts | `listar_scripts`, `inyectar_script`, `borrar_script` |
| SEO | `auditar_seo`, `actualizar_seo_producto` |
| Cupones | `crear_cupon` |

## Flujo típico

1. `listar_tiendas()` → confirmar el nombre de la tienda.
2. `snapshot_completo("piloto")` → estado + métricas + calidad de catálogo.
3. `analizar_abandono("piloto", desde="2026-06-01")` → dónde pierde el funnel.
4. Hipótesis → `inyectar_script(...)` (guardar el `script_id` devuelto en `implementacion.md`).
5. `comparar_ventanas(...)` para el veredicto → `borrar_script(...)` si hay rollback.

## Verificación

```bash
python -m pytest tests/test_mcp.py -q   # las 16 tools registradas
```
