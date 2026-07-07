import re

import pytest

import motor
import propuestas
from tests.fixtures import gaql_rows as filas


def _recurso_de(query):
    m = re.search(r"FROM\s+(\w+)", query)
    recurso = m.group(1) if m else None
    if recurso == "campaign" and "campaign_budget.amount_micros" in query:
        return "pacing"
    return recurso


class _ClienteMultiFalso:
    def __init__(self, **por_recurso):
        self._por_recurso = por_recurso

    def buscar(self, customer_id, query):
        recurso = _recurso_de(query)
        return self._por_recurso.get(recurso, [])


@pytest.fixture(autouse=True)
def _aislar_propuestas(tmp_path, monkeypatch):
    monkeypatch.setattr(propuestas, "_PROPUESTAS_DIR", str(tmp_path))
    monkeypatch.setattr(propuestas, "_INDICE", str(tmp_path / "indice-propuestas.md"))
    yield


def test_procesar_marca_manana_genera_propuestas_y_alertas():
    cliente = _ClienteMultiFalso(
        campaign=[filas.fila_campana(cost_micros=100_000_000, conversions=5, conversions_value=750.0)],
        keyword_view=[filas.fila_keyword(quality_score=2, cost_micros=15_000_000, conversions=0)],
        ad_group_ad=[filas.fila_anuncio(approval_status="DISAPPROVED")],
        search_term_view=[filas.fila_search_term(termino="ropa gratis", cost_micros=6_000_000_000, conversions=0)],
        campaign_criterion=[],
    )

    resultado = motor.procesar_marca_manana(cliente, "piloto", "1112223333", "2026-07-01", "2026-07-07")

    assert resultado["marca"] == "piloto"
    assert resultado["rollup"]["spend"] == 100.0
    assert len(resultado["propuestas"]) == 2  # pausar_keyword + nueva_negativa
    assert len(resultado["alertas"]) == 1
    assert "desaprobado" in resultado["alertas"][0]["mensaje"]

    propuesta = propuestas.leer_propuesta(resultado["propuestas"][0])
    assert propuesta["tipo"] == "pausar_keyword"
    assert propuesta["estado"] == "PROPUESTA"


def test_procesar_marca_manana_sin_hallazgos_no_genera_propuestas():
    cliente = _ClienteMultiFalso(
        campaign=[filas.fila_campana()],
        keyword_view=[filas.fila_keyword(quality_score=9, conversions=5)],
        ad_group_ad=[filas.fila_anuncio(approval_status="APPROVED")],
        search_term_view=[filas.fila_search_term(conversions=2)],
        campaign_criterion=[],
    )
    resultado = motor.procesar_marca_manana(cliente, "piloto", "1112223333", "2026-07-01", "2026-07-07")
    assert resultado["propuestas"] == []
    assert resultado["alertas"] == []


def test_procesar_marca_tarde_detecta_pacing_acelerado():
    cliente = _ClienteMultiFalso(
        campaign=[filas.fila_campana()],
        pacing=[filas.fila_pacing(amount_micros=16_500_000_000, cost_micros=15_000_000_000)],
        ad_group_ad=[],
    )
    resultado = motor.procesar_marca_tarde(cliente, "piloto", "1112223333", "2026-07-07", "2026-06-30", "2026-07-06")
    assert any("Pacing acelerado" in a["mensaje"] for a in resultado["alertas"])


def test_procesar_marca_semanal_detecta_concentracion_de_gasto():
    cliente = _ClienteMultiFalso(
        campaign=[
            filas.fila_campana(campaign_id=1, nombre="A", cost_micros=950_000_000),
            filas.fila_campana(campaign_id=2, nombre="B", cost_micros=50_000_000),
        ],
    )
    resultado = motor.procesar_marca_semanal(cliente, "piloto", "1112223333", "2026-07-01", "2026-07-07")
    assert any("concentra" in a["texto"] for a in resultado["actionables"])
