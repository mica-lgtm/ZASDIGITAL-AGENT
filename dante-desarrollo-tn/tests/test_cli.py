from unittest.mock import patch

from click.testing import CliRunner

from cli.dante import cli


FAKE_CLIENT = object()


def _patch_tienda():
    return patch("cli.dante.tienda", return_value=FAKE_CLIENT)


def test_help_lista_comandos():
    r = CliRunner().invoke(cli, ["--help"])
    assert r.exit_code == 0
    for comando in ("audit", "deploy", "rollback", "bulk-seo", "report"):
        assert comando in r.output


def test_report_muestra_metricas():
    with _patch_tienda(), \
         patch("cli.dante.metricas_mod.resumen_ventana",
               return_value={"pedidos": 3, "ingresos": 900.0, "aov": 300.0}), \
         patch("cli.dante.metricas_mod.rendimiento_por_producto", return_value=[]), \
         patch("cli.dante.abandono_mod.resumen_abandono",
               return_value={"checkouts_abandonados": 1, "ordenes_completadas": 3,
                             "tasa_abandono_pct": 25.0}):
        r = CliRunner().invoke(cli, ["report", "piloto", "30"])
    assert r.exit_code == 0
    assert "AOV: $300.0" in r.output
    assert "25.0%" in r.output


def test_deploy_registra_script():
    with _patch_tienda(), \
         patch("cli.dante.scripts_mod.registrar", return_value={"id": 555}) as reg:
        r = CliRunner().invoke(
            cli, ["deploy", "piloto", "EXP-001-x", "https://cdn.x/v.js", "--where", "product"]
        )
    assert r.exit_code == 0
    assert "script_id: 555" in r.output
    reg.assert_called_once_with(FAKE_CLIENT, "https://cdn.x/v.js", where="product")


def test_rollback_borra_script():
    with _patch_tienda(), \
         patch("cli.dante.scripts_mod.borrar", return_value=True) as borrar:
        r = CliRunner().invoke(cli, ["rollback", "piloto", "555"])
    assert r.exit_code == 0
    assert "eliminado" in r.output
    borrar.assert_called_once_with(FAKE_CLIENT, 555)


def test_rollback_falla_con_exit_code():
    with _patch_tienda(), patch("cli.dante.scripts_mod.borrar", return_value=False):
        r = CliRunner().invoke(cli, ["rollback", "piloto", "555"])
    assert r.exit_code == 1


def test_bulk_seo_dry_run_no_escribe():
    issues = [{
        "id": 1, "nombre": "Alfombra", "sin_seo_title": True, "sin_seo_desc": False,
        "sin_descripcion": False, "descripcion_corta": True, "handle_vacio": False,
    }]
    with _patch_tienda(), \
         patch("cli.dante.seo_mod.auditar_seo_catalogo", return_value=issues), \
         patch("cli.dante.seo_mod.bulk_actualizar_seo") as bulk:
        r = CliRunner().invoke(cli, ["bulk-seo", "piloto", "--dry-run"])
    assert r.exit_code == 0
    assert "dry-run" in r.output
    bulk.assert_not_called()


def test_audit_incluye_nombre_tienda():
    with _patch_tienda(), \
         patch("cli.dante.snapshot_mod.snapshot_completo", return_value={
             "info": {"name": "Piloto"},
             "total_productos": 2,
             "calidad_catalogo": {"pct_completos": 50.0, "sin_descripcion": 1,
                                  "sin_imagen": 1, "sin_precio_promo": 2},
             "metricas_recientes": {"pedidos": 3, "ingresos": 900.0, "aov": 300.0},
             "scripts_activos": [],
         }), \
         patch("cli.dante.seo_mod.auditar_seo_catalogo", return_value=[]), \
         patch("cli.dante.abandono_mod.resumen_abandono",
               return_value={"checkouts_abandonados": 0, "ordenes_completadas": 3,
                             "tasa_abandono_pct": 0}), \
         patch("cli.dante.abandono_mod.valor_abandonado", return_value=0.0), \
         patch("cli.dante.metricas_mod.rendimiento_por_producto", return_value=[]):
        r = CliRunner().invoke(cli, ["audit", "piloto"])
    assert r.exit_code == 0
    assert "Piloto" in r.output
