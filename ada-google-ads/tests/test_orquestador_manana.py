import pytest

import orquestador_manana
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


def test_run_genera_reporte_y_propuestas(monkeypatch, capsys):
    _preparar_roster(monkeypatch)

    cliente = _ClienteMultiFalso(
        campaign=[filas.fila_campana(cost_micros=100_000_000, conversions=5, conversions_value=750.0)],
        keyword_view=[filas.fila_keyword(quality_score=2, conversions=0)],
        ad_group_ad=[filas.fila_anuncio(approval_status="APPROVED")],
        search_term_view=[],
        campaign_criterion=[],
    )
    monkeypatch.setattr(orquestador_manana, "cliente_desde_env", lambda env: cliente)
    monkeypatch.setattr(orquestador_manana, "customer_id_de_marca", lambda marca, env=None: "1112223333")

    env = {"ADA_SHEETS_SPREADSHEET_ID": "sheet123"}
    args = orquestador_manana.parse_args(["--fecha", "2026-07-07", "--sin-whatsapp"])

    reporte = orquestador_manana.run(args, env=env)

    assert reporte["fecha"] == "2026-07-07"
    assert reporte["rollups_por_marca"]["simona"]["spend"] == 100.0
    assert len(reporte["propuestas"]) == 1
    assert not any(b["marca"] == "simona" for b in reporte["bloqueos"])
    assert reporte["errores"] == []

    salida = capsys.readouterr().out
    assert "Rutina de mañana" in salida


def test_run_marca_sin_ficha_queda_bloqueada(monkeypatch, capsys):
    def _marcas_con_extra(*args, **kwargs):
        return [
            {"marca": "simona", "marca_original": "Simona", "canales_activos": ["google_ads"]},
            {"marca": "marca_inexistente", "marca_original": "Marca Inexistente", "canales_activos": ["google_ads"]},
        ]

    monkeypatch.setattr(roster_ada, "cliente_sheets", lambda env=None: object())
    monkeypatch.setattr(roster_ada, "abrir_planilla", lambda gc, sid: object())
    monkeypatch.setattr(roster_ada, "marcas_google_ads_activas", _marcas_con_extra)

    cliente = _ClienteMultiFalso(campaign=[filas.fila_campana()], keyword_view=[], ad_group_ad=[], search_term_view=[], campaign_criterion=[])
    monkeypatch.setattr(orquestador_manana, "cliente_desde_env", lambda env: cliente)
    monkeypatch.setattr(orquestador_manana, "customer_id_de_marca", lambda marca, env=None: "1112223333")

    env = {"ADA_SHEETS_SPREADSHEET_ID": "sheet123"}
    args = orquestador_manana.parse_args(["--fecha", "2026-07-07", "--sin-whatsapp"])
    reporte = orquestador_manana.run(args, env=env)

    assert any(b["marca"] == "marca_inexistente" for b in reporte["bloqueos"])
    assert "marca_inexistente" not in reporte["rollups_por_marca"]


def test_run_filtra_por_marcas_arg(monkeypatch):
    def _marcas_dos(*args, **kwargs):
        return [
            {"marca": "simona", "marca_original": "Simona", "canales_activos": ["google_ads"]},
            {"marca": "otra", "marca_original": "Otra", "canales_activos": ["google_ads"]},
        ]

    monkeypatch.setattr(roster_ada, "cliente_sheets", lambda env=None: object())
    monkeypatch.setattr(roster_ada, "abrir_planilla", lambda gc, sid: object())
    monkeypatch.setattr(roster_ada, "marcas_google_ads_activas", _marcas_dos)

    cliente = _ClienteMultiFalso(campaign=[filas.fila_campana()], keyword_view=[], ad_group_ad=[], search_term_view=[], campaign_criterion=[])
    monkeypatch.setattr(orquestador_manana, "cliente_desde_env", lambda env: cliente)
    monkeypatch.setattr(orquestador_manana, "customer_id_de_marca", lambda marca, env=None: "1112223333")

    env = {"ADA_SHEETS_SPREADSHEET_ID": "sheet123"}
    args = orquestador_manana.parse_args(["--fecha", "2026-07-07", "--marcas", "simona", "--sin-whatsapp"])
    reporte = orquestador_manana.run(args, env=env)

    assert list(reporte["rollups_por_marca"].keys()) == ["simona"]


def test_run_customer_id_directo_bypassea_sheets(monkeypatch, capsys):
    def _falla_si_se_llama(*args, **kwargs):
        raise AssertionError("no debería consultar Sheets en modo --customer-id-directo")

    monkeypatch.setattr(roster_ada, "cliente_sheets", _falla_si_se_llama)
    monkeypatch.setattr(roster_ada, "abrir_planilla", _falla_si_se_llama)
    monkeypatch.setattr(roster_ada, "marcas_google_ads_activas", _falla_si_se_llama)

    cliente = _ClienteMultiFalso(campaign=[filas.fila_campana()], keyword_view=[], ad_group_ad=[], search_term_view=[], campaign_criterion=[])
    customer_ids_recibidos = []

    def _cliente_desde_env(env):
        return cliente

    monkeypatch.setattr(orquestador_manana, "cliente_desde_env", _cliente_desde_env)

    import motor as motor_mod
    original = motor_mod.procesar_marca_manana

    def _procesar_y_registrar(cliente, marca, customer_id, desde, hasta, rutina="manana"):
        customer_ids_recibidos.append(customer_id)
        return original(cliente, marca, customer_id, desde, hasta, rutina)

    monkeypatch.setattr(orquestador_manana.motor, "procesar_marca_manana", _procesar_y_registrar)

    args = orquestador_manana.parse_args([
        "--fecha", "2026-07-07", "--marcas", "simona", "--customer-id-directo", "668-837-0911", "--sin-whatsapp",
    ])
    reporte = orquestador_manana.run(args, env={})

    assert customer_ids_recibidos == ["6688370911"]
    assert "simona" in reporte["rollups_por_marca"]
    assert not any(b["marca"] == "simona" for b in reporte["bloqueos"])
