"""CLI de automatización de Dante. Uso: python -m cli.dante <comando>"""
import json
from datetime import date, datetime, timedelta
from pathlib import Path

import click

from tn import abandono as abandono_mod
from tn import metricas as metricas_mod
from tn import scripts as scripts_mod
from tn import seo as seo_mod
from tn import snapshot as snapshot_mod
from tn.tiendas import tienda

RAIZ = Path(__file__).resolve().parents[1]
EXPERIMENTOS_DIR = RAIZ / "experimentos"


def _desde(dias):
    return (date.today() - timedelta(days=dias)).isoformat()


@click.group()
def cli():
    """Dante: automatizaciones CRO para Tienda Nube."""


@cli.command()
@click.argument("nombre_tienda")
@click.option("--dias", default=30, show_default=True, help="Ventana de métricas.")
@click.option("--output", type=click.Choice(["text", "json"]), default="text")
def audit(nombre_tienda, dias, output):
    """Auditoría completa: snapshot + SEO + abandono + top productos."""
    client = tienda(nombre_tienda)
    desde = _desde(dias)

    snap = snapshot_mod.snapshot_completo(client, ventana_dias=dias)
    seo_issues = seo_mod.auditar_seo_catalogo(client)
    ab = abandono_mod.resumen_abandono(client, desde)
    top = metricas_mod.rendimiento_por_producto(client, desde, top_n=3)

    con_issues = [p for p in seo_issues if any(
        p[flag] for flag in ("sin_seo_title", "sin_seo_desc", "sin_descripcion", "descripcion_corta")
    )]

    datos = {
        "tienda": snap["info"].get("name"),
        "ventana_dias": dias,
        "total_productos": snap["total_productos"],
        "calidad_catalogo": snap["calidad_catalogo"],
        "metricas": snap["metricas_recientes"],
        "abandono": ab,
        "valor_abandonado": abandono_mod.valor_abandonado(client, desde),
        "top_productos": top,
        "productos_con_issues_seo": len(con_issues),
        "issues_seo": con_issues[:10],
        "scripts_activos": snap["scripts_activos"],
    }

    if output == "json":
        click.echo(json.dumps(datos, ensure_ascii=False, indent=2, default=str))
        return

    m = datos["metricas"]
    cal = datos["calidad_catalogo"]
    click.echo(f"=== Auditoría · {datos['tienda']} · últimos {dias} días ===")
    click.echo(f"Productos: {datos['total_productos']} ({cal['pct_completos']}% completos)")
    click.echo(f"  sin descripción: {cal['sin_descripcion']} · sin imagen: {cal['sin_imagen']}")
    click.echo(f"Métricas: {m['pedidos']} pedidos · ${m['ingresos']} · AOV ${m['aov']}")
    click.echo(f"Abandono: {ab['tasa_abandono_pct']}% ({ab['checkouts_abandonados']} carritos, ${datos['valor_abandonado']} en riesgo)")
    click.echo(f"Issues SEO: {datos['productos_con_issues_seo']} productos")
    for p in datos["issues_seo"]:
        flags = [k for k in ("sin_seo_title", "sin_seo_desc", "sin_descripcion", "descripcion_corta") if p[k]]
        click.echo(f"  #{p['id']} {p['nombre']}: {', '.join(flags)}")
    if top:
        click.echo("Top productos por revenue:")
        for p in top:
            click.echo(f"  {p['nombre']}: ${p['revenue']} ({p['unidades']} u.)")
    click.echo(f"Scripts activos: {len(datos['scripts_activos'])}")


@cli.command()
@click.argument("nombre_tienda")
@click.argument("exp_slug")
@click.argument("script_url")
@click.option("--where", type=click.Choice(["store", "checkout", "product", "cart"]), default="store", show_default=True)
def deploy(nombre_tienda, exp_slug, script_url, where):
    """Publica un experimento: inyecta el script y registra el script_id."""
    client = tienda(nombre_tienda)
    resultado = scripts_mod.registrar(client, script_url, where=where)
    script_id = resultado.get("id")
    click.echo(f"script_id: {script_id}")

    impl = EXPERIMENTOS_DIR / nombre_tienda / exp_slug / "implementacion.md"
    if impl.exists():
        with impl.open("a") as f:
            f.write(f"\n- script_id: {script_id} deployed at {datetime.now().isoformat(timespec='seconds')}\n")
        click.echo(f"Registrado en {impl.relative_to(RAIZ)}")
    else:
        click.echo(f"(No existe {impl.relative_to(RAIZ)} — guardá el script_id a mano)")

    click.echo(f"Rollback: python -m cli.dante rollback {nombre_tienda} {script_id}")


@cli.command()
@click.argument("nombre_tienda")
@click.argument("script_id", type=int)
def rollback(nombre_tienda, script_id):
    """Elimina un script inyectado (rollback de experimento)."""
    client = tienda(nombre_tienda)
    if scripts_mod.borrar(client, script_id):
        click.echo(f"Script {script_id} eliminado de {nombre_tienda}.")
    else:
        click.echo(f"No se pudo eliminar el script {script_id}.", err=True)
        raise SystemExit(1)


@cli.command("bulk-seo")
@click.argument("nombre_tienda")
@click.option("--dry-run", is_flag=True, help="Solo mostrar issues, sin escribir.")
def bulk_seo(nombre_tienda, dry_run):
    """Auditoría SEO del catálogo. Los textos los redacta Dante, no el CLI."""
    client = tienda(nombre_tienda)
    issues = seo_mod.auditar_seo_catalogo(client)
    con_issues = [p for p in issues if any(
        p[flag] for flag in ("sin_seo_title", "sin_seo_desc", "sin_descripcion", "descripcion_corta", "handle_vacio")
    )]

    click.echo(f"{len(con_issues)} de {len(issues)} productos con issues:")
    click.echo(f"{'ID':<10} {'Nombre':<40} {'SEO title':<10} {'SEO desc':<10} {'Descripción'}")
    for p in con_issues:
        desc = "FALTA" if p["sin_descripcion"] else ("CORTA" if p["descripcion_corta"] else "ok")
        click.echo(
            f"{p['id']:<10} {p['nombre'][:38]:<40} "
            f"{'FALTA' if p['sin_seo_title'] else 'ok':<10} "
            f"{'FALTA' if p['sin_seo_desc'] else 'ok':<10} {desc}"
        )

    if dry_run:
        click.echo("\n(dry-run: no se escribió nada)")
        return
    click.echo(
        "\nPara aplicar: redactar los textos (voz de marca) y usar "
        "seo.bulk_actualizar_seo() o la herramienta MCP actualizar_seo_producto."
    )


@cli.command()
@click.argument("nombre_tienda")
@click.argument("dias", type=int)
@click.option("--output", type=click.Choice(["text", "json"]), default="text")
def report(nombre_tienda, dias, output):
    """Reporte de performance: métricas + top productos + abandono."""
    client = tienda(nombre_tienda)
    desde = _desde(dias)

    datos = {
        "tienda": nombre_tienda,
        "ventana_dias": dias,
        "metricas": metricas_mod.resumen_ventana(client, desde),
        "top_productos": metricas_mod.rendimiento_por_producto(client, desde, top_n=5),
        "abandono": abandono_mod.resumen_abandono(client, desde),
    }

    if output == "json":
        click.echo(json.dumps(datos, ensure_ascii=False, indent=2, default=str))
        return

    m = datos["metricas"]
    ab = datos["abandono"]
    click.echo(f"=== Reporte · {nombre_tienda} · últimos {dias} días ===")
    click.echo(f"Pedidos: {m['pedidos']} · Ingresos: ${m['ingresos']} · AOV: ${m['aov']}")
    click.echo(f"Abandono: {ab['tasa_abandono_pct']}%")
    for p in datos["top_productos"]:
        click.echo(f"  {p['nombre']}: ${p['revenue']} ({p['unidades']} u.)")


if __name__ == "__main__":
    cli()
