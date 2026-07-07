import pytest

import orquestador_semanal
import propuestas
import reportes_md
import roster_ada
from tests.fixtures import gaql_rows as filas
from tests.test_motor import _ClienteMultiFalso


@pytest.fixture(autouse=True)
def _aislar(tmp_path, monkeypatch):
    monkeypatch.setattr(propuestas, "_PROPUESTAS_DIR", str(tmp_path / "propuestas"))
    monkeypatch.setattr(propuestas, "_INDICE", str(tmp_path / "propuestas" / "indice-propuestas.md"))
    monkeypatch.setattr(reportes_md, "_BASE", str(tmp_path))
    monkeypatch.setattr(orquestador_semanal, "_registrar_pendientes", lambda *a, **k: None)
    yield


def _marcas_fake(*args, **kwargs):
    return [{"marca": "simona", "marca_original": "Simona", "canales_activos": ["google_ads"]}]


def test_run_reporta_rollup_y_actionables(monkeypatch, capsys):
    monkeypatch.setattr(roster_ada, "cliente_sheets", lambda env=None: object())
    monkeypatch.setattr(roster_ada, "abrir_planilla", lambda gc, sid: object())
    monkeypatch.setattr(roster_ada, "marcas_google_ads_activas", _marcas_fake)

    cliente = _ClienteMultiFalso(
        campaign=[
            filas.fila_campana(campaign_id=1, nombre="A", cost_micros=950_000_000, conversions=5, conversions_value=750.0),
            filas.fila_campana(campaign_id=2, nombre="B", cost_micros=50_000_000, conversions=1, conversions_value=10.0),
        ],
    )
    monkeypatch.setattr(orquestador_semanal, "cliente_desde_env", lambda env: cliente)
    monkeypatch.setattr(orquestador_semanal, "customer_id_de_marca", lambda marca, env=None: "1112223333")

    env = {"ADA_SHEETS_SPREADSHEET_ID": "sheet123"}
    args = orquestador_semanal.parse_args(["--fecha", "2026-07-05", "--sin-whatsapp"])
    reporte = orquestador_semanal.run(args, env=env)

    assert reporte["fecha"] == "2026-07-05"
    assert reporte["rollups_por_marca"]["simona"]["spend"] == 1000.0
    assert any("concentra" in a["texto"] for a in reporte["actionables"])

    salida = capsys.readouterr().out
    assert "Revisión semanal" in salida


def test_fecha_domingo_reciente_es_siempre_domingo():
    from datetime import date

    fecha = orquestador_semanal.fecha_domingo_reciente()
    assert date.fromisoformat(fecha).weekday() == 6


def test_ventana_semana_es_siete_dias():
    assert orquestador_semanal.ventana_semana("2026-07-05") == "2026-06-29"
