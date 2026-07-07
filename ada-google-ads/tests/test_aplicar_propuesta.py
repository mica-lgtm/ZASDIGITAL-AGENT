import pytest

import aplicar_propuesta
import propuestas
from tests.fixtures import gaql_rows as filas
from tests.test_ads_mutate import _AutoNS, _ServicioFalso


class _ClienteLecturaFalso:
    def __init__(self, filas_presupuestos):
        self._filas = filas_presupuestos

    def buscar(self, customer_id, query):
        return self._filas


class _ClienteMutateFalso:
    def __init__(self, resource_names_por_indice=None):
        self._servicio = _ServicioFalso()
        self._resource_names = resource_names_por_indice or {}
        self.llamadas_mutate = []

    def get_service(self, nombre):
        return self._servicio

    def get_type(self, nombre):
        return _AutoNS()

    def mutate(self, customer_id, operaciones):
        self.llamadas_mutate.append((customer_id, operaciones))
        respuesta = _AutoNS()
        lista = []
        for indice in range(len(operaciones)):
            campo, resource_name = self._resource_names.get(
                indice, ("campaign_result", f"customers/{customer_id}/campaigns/{9000 + indice}")
            )
            resp = _AutoNS()
            resultado = _AutoNS()
            resultado.resource_name = resource_name
            setattr(resp, campo, resultado)
            lista.append(resp)
        respuesta.mutate_operation_responses = lista
        return respuesta


@pytest.fixture(autouse=True)
def _aislar_propuestas(tmp_path, monkeypatch):
    monkeypatch.setattr(propuestas, "_PROPUESTAS_DIR", str(tmp_path / "propuestas"))
    monkeypatch.setattr(propuestas, "_INDICE", str(tmp_path / "propuestas" / "indice-propuestas.md"))
    yield


def _crear_propuesta_pausar_keyword(tmp_path):
    return propuestas.crear_propuesta(
        marca="piloto", tipo="pausar_keyword", customer_id="1112223333", rutina_origen="manana",
        fecha="2026-07-07", titulo="x", cuerpo_md="x",
        operaciones=[{"tipo": "ad_group_criterion_status", "ad_group_id": 1, "criterion_id": 2, "nuevo_estado": "PAUSED"}],
    )


def test_ejecutar_falla_si_estado_no_es_propuesta(tmp_path):
    id_propuesta, _ = _crear_propuesta_pausar_keyword(tmp_path)
    propuestas.actualizar_estado(id_propuesta, "EJECUTADA")

    with pytest.raises(RuntimeError, match="no en PROPUESTA"):
        aplicar_propuesta.ejecutar(id_propuesta, cliente_lectura=_ClienteLecturaFalso([]), cliente_mutate=_ClienteMutateFalso(), base_dir=str(tmp_path))


def test_ejecutar_pausar_keyword_marca_estado_ejecutada_y_registra_decision(tmp_path):
    (tmp_path / "memoria").mkdir()
    id_propuesta, _ = _crear_propuesta_pausar_keyword(tmp_path)

    propuesta, resource_names = aplicar_propuesta.ejecutar(
        id_propuesta, cliente_lectura=_ClienteLecturaFalso([]), cliente_mutate=_ClienteMutateFalso(), base_dir=str(tmp_path),
    )

    actualizada = propuestas.leer_propuesta(id_propuesta)
    assert actualizada["estado"] == "EJECUTADA"
    assert resource_names == ["customers/1112223333/campaigns/9000"]

    with open(tmp_path / "memoria" / "decisiones.md") as f:
        contenido = f.read()
    assert id_propuesta in contenido
    assert "aprobado por Mica" in contenido


def test_ejecutar_nueva_campana_marca_estado_subida_pausada(tmp_path):
    (tmp_path / "memoria").mkdir()
    id_propuesta, _ = propuestas.crear_propuesta(
        marca="piloto", tipo="nueva_campana", customer_id="1112223333", rutina_origen="semanal",
        fecha="2026-07-05", titulo="x", cuerpo_md="x",
        operaciones=[
            {"tipo": "campaign_budget", "nombre": "X_BUDGET", "monto_diario_ars": 1000},
            {"tipo": "campaign", "nombre": "X_CAMPANA", "canal": "SEARCH", "budget_ref": 0},
        ],
    )

    cliente_mutate = _ClienteMutateFalso({1: ("campaign_result", "customers/1112223333/campaigns/555")})
    _, resource_names = aplicar_propuesta.ejecutar(
        id_propuesta, cliente_lectura=_ClienteLecturaFalso([]), cliente_mutate=cliente_mutate, base_dir=str(tmp_path),
    )

    actualizada = propuestas.leer_propuesta(id_propuesta)
    assert actualizada["estado"] == "SUBIDA PAUSADA"
    assert actualizada["recurso_objetivo"] == "customers/1112223333/campaigns/555"
    assert "customers/1112223333/campaigns/555" in resource_names


def test_ejecutar_resuelve_ajuste_pct_contra_presupuesto_actual(tmp_path):
    (tmp_path / "memoria").mkdir()
    id_propuesta, _ = propuestas.crear_propuesta(
        marca="piloto", tipo="ajuste_presupuesto", customer_id="1112223333", rutina_origen="manana",
        fecha="2026-07-07", titulo="x", cuerpo_md="x",
        operaciones=[{"tipo": "campaign_budget_amount", "budget_resource": "customers/1112223333/campaignBudgets/9", "ajuste_pct": 20}],
    )

    fila_presupuesto = filas.fila_presupuesto(resource_name="customers/1112223333/campaignBudgets/9", amount_micros=16_500_000_000)
    cliente_lectura = _ClienteLecturaFalso([fila_presupuesto])
    cliente_mutate = _ClienteMutateFalso()

    aplicar_propuesta.ejecutar(id_propuesta, cliente_lectura=cliente_lectura, cliente_mutate=cliente_mutate, base_dir=str(tmp_path))

    _, ops_enviadas = cliente_mutate.llamadas_mutate[0]
    monto = ops_enviadas[0].campaign_budget_operation.update.amount_micros
    assert monto == int(16_500_000_000 * 1.2)


def test_activar_falla_si_no_es_nueva_campana(tmp_path):
    (tmp_path / "memoria").mkdir()
    id_propuesta, _ = _crear_propuesta_pausar_keyword(tmp_path)
    with pytest.raises(RuntimeError, match="no es de tipo nueva_campana"):
        aplicar_propuesta.activar(id_propuesta, cliente_mutate=_ClienteMutateFalso(), base_dir=str(tmp_path))


def test_activar_falla_si_estado_no_es_subida_pausada(tmp_path):
    (tmp_path / "memoria").mkdir()
    id_propuesta, _ = propuestas.crear_propuesta(
        marca="piloto", tipo="nueva_campana", customer_id="1112223333", rutina_origen="semanal",
        fecha="2026-07-05", titulo="x", cuerpo_md="x", operaciones=[{"tipo": "campaign_budget", "nombre": "x", "monto_diario_ars": 1}],
    )
    with pytest.raises(RuntimeError, match="no en SUBIDA PAUSADA"):
        aplicar_propuesta.activar(id_propuesta, cliente_mutate=_ClienteMutateFalso(), base_dir=str(tmp_path))


def test_activar_exitoso_marca_estado_activada(tmp_path):
    (tmp_path / "memoria").mkdir()
    id_propuesta, _ = propuestas.crear_propuesta(
        marca="piloto", tipo="nueva_campana", customer_id="1112223333", rutina_origen="semanal",
        fecha="2026-07-05", titulo="x", cuerpo_md="x", operaciones=[{"tipo": "campaign_budget", "nombre": "x", "monto_diario_ars": 1}],
    )
    propuestas.actualizar_estado(id_propuesta, "SUBIDA PAUSADA", campos_extra={"recurso_objetivo": "customers/1112223333/campaigns/555"})

    aplicar_propuesta.activar(id_propuesta, cliente_mutate=_ClienteMutateFalso(), base_dir=str(tmp_path))

    actualizada = propuestas.leer_propuesta(id_propuesta)
    assert actualizada["estado"] == "ACTIVADA"
