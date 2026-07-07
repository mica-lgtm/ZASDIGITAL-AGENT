import os

import roster_ada


def _marcas(*slugs):
    return [{"marca": slug, "marca_original": slug, "canales_activos": ["google_ads"]} for slug in slugs]


def test_marcas_sin_ficha_detecta_marca_activa_sin_archivo(tmp_path):
    cuentas_dir = tmp_path / "cuentas"
    cuentas_dir.mkdir()
    (cuentas_dir / "piloto.md").write_text("# Piloto")

    faltantes = roster_ada.marcas_sin_ficha(_marcas("piloto", "juanitas"), str(cuentas_dir))

    assert faltantes == ["juanitas"]


def test_marcas_sin_ficha_vacio_si_todas_tienen_archivo(tmp_path):
    cuentas_dir = tmp_path / "cuentas"
    cuentas_dir.mkdir()
    (cuentas_dir / "piloto.md").write_text("# Piloto")

    faltantes = roster_ada.marcas_sin_ficha(_marcas("piloto"), str(cuentas_dir))

    assert faltantes == []


def test_fichas_sin_marca_activa_ignora_archivos_reservados(tmp_path):
    cuentas_dir = tmp_path / "cuentas"
    cuentas_dir.mkdir()
    (cuentas_dir / "piloto.md").write_text("# Piloto")
    (cuentas_dir / "juanitas.md").write_text("# Juanitas")
    (cuentas_dir / "template-cuenta.md").write_text("# Template")
    (cuentas_dir / "indice-cuentas.md").write_text("# Indice")
    (cuentas_dir / "cuentas-publicitarias-google-ads.md").write_text("# Mapeo")

    obsoletas = roster_ada.fichas_sin_marca_activa(_marcas("piloto"), str(cuentas_dir))

    assert obsoletas == ["juanitas"]


def test_fichas_sin_marca_activa_devuelve_vacio_si_dir_no_existe(tmp_path):
    assert roster_ada.fichas_sin_marca_activa(_marcas("piloto"), str(tmp_path / "no-existe")) == []
