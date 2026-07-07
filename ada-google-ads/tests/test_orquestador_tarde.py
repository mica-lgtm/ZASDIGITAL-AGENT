import pytest

import orquestador_tarde
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
    yield


def _marcas_fake(*args, **kwargs):
    return [{"marca": "simona", "marca_original": "Simona", "canales_activos": ["google_ads"]}]


def _preparar_roster(monkeypatch):
    monkeypatch.setattr(roster_ada, "cliente_sheets", lambda env=None: object())
    monkeypatch.setattr(roster_ada, "abrir_planilla", lambda gc, sid: object())
    monkeypatch.setattr(roster_ada, "marcas_google_ads_activas", _marcas_fake)


def test_run_reporta_pacing_y_pendientes(monkeypatch, capsys):
    _preparar_roster(monkeypatch)

    cliente = _ClienteMultiFalso(
        campaign=[filas.fila_campana()],
        pacing=[filas.fila_pacing(amount_micros=16_500_000_000, cost_micros=15_000_000_000)],
        ad_group_ad=[],
    )
    monkeypatch.setattr(orquestador_tarde, "cliente_desde_env", lambda env: cliente)
    monkeypatch.setattr(orquestador_tarde, "customer_id_de_marca", lambda marca, env=None: "1112223333")

    # Propuesta pendiente creada "ayer" para que aparezca en el aging.
    propuestas.crear_propuesta(
        marca="simona", tipo="pausar_keyword", customer_id="1112223333", rutina_origen="manana",
        fecha="2026-07-06", titulo="x", cuerpo_md="x", operaciones=[{"tipo": "x"}],
    )

    env = {"ADA_SHEETS_SPREADSHEET_ID": "sheet123"}
    args = orquestador_tarde.parse_args(["--fecha", "2026-07-07", "--sin-whatsapp"])
    reporte = orquestador_tarde.run(args, env=env)

    assert reporte["fecha"] == "2026-07-07"
    assert len(reporte["pendientes_aging"]) == 1
    assert reporte["pendientes_aging"][0]["dias"] == 1
    assert any("Pacing acelerado" in a["mensaje"] for a in reporte["alertas"])

    salida = capsys.readouterr().out
    assert "Rutina de tarde" in salida


def test_run_detecta_campanas_esperando_activar(monkeypatch):
    _preparar_roster(monkeypatch)
    cliente = _ClienteMultiFalso(campaign=[filas.fila_campana()], pacing=[], ad_group_ad=[])
    monkeypatch.setattr(orquestador_tarde, "cliente_desde_env", lambda env: cliente)
    monkeypatch.setattr(orquestador_tarde, "customer_id_de_marca", lambda marca, env=None: "1112223333")

    id_propuesta, _ = propuestas.crear_propuesta(
        marca="simona", tipo="nueva_campana", customer_id="1112223333", rutina_origen="semanal",
        fecha="2026-07-05", titulo="x", cuerpo_md="x", operaciones=[{"tipo": "x"}],
    )
    propuestas.actualizar_estado(id_propuesta, "SUBIDA PAUSADA")

    env = {"ADA_SHEETS_SPREADSHEET_ID": "sheet123"}
    args = orquestador_tarde.parse_args(["--fecha", "2026-07-07", "--sin-whatsapp"])
    reporte = orquestador_tarde.run(args, env=env)

    assert [c["id"] for c in reporte["esperando_activar"]] == [id_propuesta]
