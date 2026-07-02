import asyncio

from mcp_server.server import mcp

HERRAMIENTAS_ESPERADAS = {
    "listar_tiendas",
    "snapshot_tienda",
    "snapshot_completo",
    "obtener_metricas",
    "comparar_ventanas",
    "top_productos",
    "analizar_abandono",
    "listar_productos",
    "obtener_producto",
    "actualizar_producto",
    "listar_scripts",
    "inyectar_script",
    "borrar_script",
    "auditar_seo",
    "actualizar_seo_producto",
    "crear_cupon",
}


def test_registra_las_16_herramientas():
    tools = asyncio.run(mcp.list_tools())
    nombres = {t.name for t in tools}
    assert nombres == HERRAMIENTAS_ESPERADAS


def test_toda_herramienta_tiene_descripcion():
    tools = asyncio.run(mcp.list_tools())
    for t in tools:
        assert t.description, f"{t.name} sin descripción"
