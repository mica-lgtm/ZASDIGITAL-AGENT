"""Servidor MCP de Dante: expone el toolkit tn/ como herramientas nativas.

Correr desde la raíz del proyecto: python -m mcp_server.server
Registro en Claude Code: ver playbooks/mcp-uso.md
"""
from datetime import date, timedelta

from mcp.server.fastmcp import FastMCP

from tn import abandono as abandono_mod
from tn import cupones as cupones_mod
from tn import metricas as metricas_mod
from tn import productos as productos_mod
from tn import scripts as scripts_mod
from tn import seo as seo_mod
from tn import snapshot as snapshot_mod
from tn.tiendas import cargar_tiendas, tienda

mcp = FastMCP("Dante TN")


def _client(nombre_tienda):
    return tienda(nombre_tienda)


def _desde_por_dias(dias):
    return (date.today() - timedelta(days=dias)).isoformat()


# --- Tienda ---

@mcp.tool()
def listar_tiendas() -> list[str]:
    """Lista los nombres de las tiendas configuradas en .env."""
    return sorted(cargar_tiendas().keys())


@mcp.tool()
def snapshot_tienda(nombre_tienda: str) -> dict:
    """Estado real de la tienda: info + catálogo completo. Fuente de verdad."""
    return snapshot_mod.snapshot_tienda(_client(nombre_tienda))


@mcp.tool()
def snapshot_completo(nombre_tienda: str, ventana_dias: int = 30) -> dict:
    """Snapshot + scripts activos + métricas recientes + calidad de catálogo."""
    return snapshot_mod.snapshot_completo(_client(nombre_tienda), ventana_dias)


# --- Métricas ---

@mcp.tool()
def obtener_metricas(nombre_tienda: str, desde: str, hasta: str = None) -> dict:
    """Pedidos, ingresos y AOV de una ventana (fechas YYYY-MM-DD)."""
    return metricas_mod.resumen_ventana(_client(nombre_tienda), desde, hasta)


@mcp.tool()
def comparar_ventanas(
    nombre_tienda: str, desde1: str, hasta1: str, desde2: str, hasta2: str
) -> dict:
    """Antes/después de un experimento: deltas % de pedidos, ingresos y AOV."""
    return metricas_mod.comparar_ventanas(
        _client(nombre_tienda), desde1, hasta1, desde2, hasta2
    )


@mcp.tool()
def top_productos(
    nombre_tienda: str, desde: str, hasta: str = None, top_n: int = 10
) -> list[dict]:
    """Top productos por revenue real de la ventana."""
    return metricas_mod.rendimiento_por_producto(
        _client(nombre_tienda), desde, hasta, top_n
    )


@mcp.tool()
def analizar_abandono(nombre_tienda: str, desde: str, hasta: str = None) -> dict:
    """Tasa de abandono, productos más abandonados y ARG$ en riesgo."""
    client = _client(nombre_tienda)
    return {
        **abandono_mod.resumen_abandono(client, desde, hasta),
        "valor_abandonado": abandono_mod.valor_abandonado(client, desde, hasta),
        "productos_mas_abandonados": abandono_mod.productos_mas_abandonados(
            client, desde, hasta
        ),
    }


# --- Productos ---

@mcp.tool()
def listar_productos(nombre_tienda: str) -> list[dict]:
    """Catálogo completo de la tienda."""
    return productos_mod.listar(_client(nombre_tienda))


@mcp.tool()
def obtener_producto(nombre_tienda: str, producto_id: int) -> dict:
    """Detalle de un producto."""
    return productos_mod.obtener(_client(nombre_tienda), producto_id)


@mcp.tool()
def actualizar_producto(nombre_tienda: str, producto_id: int, data: dict) -> dict:
    """Actualiza campos de un producto (name, description, variants, etc.)."""
    return productos_mod.actualizar(_client(nombre_tienda), producto_id, data)


# --- Scripts (front) ---

@mcp.tool()
def listar_scripts(nombre_tienda: str) -> list[dict]:
    """Scripts JS activos inyectados en el storefront."""
    return scripts_mod.listar(_client(nombre_tienda))


@mcp.tool()
def inyectar_script(
    nombre_tienda: str, src: str, where: str = "store", event: str = "onload"
) -> dict:
    """Inyecta un JS externo. where: store|product|cart|checkout. Guardar el script_id devuelto."""
    return scripts_mod.registrar(_client(nombre_tienda), src, event=event, where=where)


@mcp.tool()
def borrar_script(nombre_tienda: str, script_id: int) -> bool:
    """Rollback: elimina un script inyectado."""
    return scripts_mod.borrar(_client(nombre_tienda), script_id)


# --- SEO ---

@mcp.tool()
def auditar_seo(nombre_tienda: str) -> list[dict]:
    """Auditoría SEO/contenido del catálogo: flags por producto."""
    return seo_mod.auditar_seo_catalogo(_client(nombre_tienda))


@mcp.tool()
def actualizar_seo_producto(
    nombre_tienda: str,
    producto_id: int,
    titulo_seo: str = None,
    desc_seo: str = None,
    handle: str = None,
) -> dict:
    """Actualiza los campos SEO de un producto (solo los provistos)."""
    return seo_mod.actualizar_seo(
        _client(nombre_tienda), producto_id, titulo_seo, desc_seo, handle
    )


# --- Cupones ---

@mcp.tool()
def crear_cupon(
    nombre_tienda: str,
    codigo: str,
    tipo: str,
    valor: float,
    max_usos: int = None,
) -> dict:
    """Crea un cupón. tipo: percentage|absolute. Un cupón de 0% sirve como tracker de experimento."""
    return cupones_mod.crear(_client(nombre_tienda), codigo, tipo, valor, max_usos)


if __name__ == "__main__":
    mcp.run()
