import os

import reportes_md


def test_escribir_reporte_manana_crea_archivo(tmp_path, monkeypatch):
    monkeypatch.setattr(reportes_md, "_BASE", str(tmp_path))
    ruta = reportes_md.escribir_reporte_manana("2026-07-07", "# Reporte de prueba")
    assert os.path.isfile(ruta)
    with open(ruta) as f:
        assert f.read() == "# Reporte de prueba"


def test_escribir_reporte_tarde_y_semanal_en_carpetas_distintas(tmp_path, monkeypatch):
    monkeypatch.setattr(reportes_md, "_BASE", str(tmp_path))
    ruta_tarde = reportes_md.escribir_reporte_tarde("2026-07-07", "tarde")
    ruta_semanal = reportes_md.escribir_reporte_semanal("2026-07-05", "semanal")
    assert "diario/tarde" in ruta_tarde.replace(os.sep, "/")
    assert "semanal" in ruta_semanal.replace(os.sep, "/")
    assert ruta_tarde != ruta_semanal


def test_reescribir_con_misma_fecha_sobreescribe(tmp_path, monkeypatch):
    monkeypatch.setattr(reportes_md, "_BASE", str(tmp_path))
    reportes_md.escribir_reporte_manana("2026-07-07", "version 1")
    ruta = reportes_md.escribir_reporte_manana("2026-07-07", "version 2")
    with open(ruta) as f:
        assert f.read() == "version 2"
