import pytest

from ads import mutate


class _AutoNS:
    """Fake mínimo de un mensaje proto-plus: cualquier atributo no seteado se
    auto-crea (como otro _AutoNS, o como lista para los campos que en la API
    real son repeated: `paths`, `headlines`, `descriptions`)."""

    _LISTAS = {"paths", "headlines", "descriptions"}

    def __init__(self):
        object.__setattr__(self, "_valores", {})

    def __getattr__(self, nombre):
        valores = object.__getattribute__(self, "_valores")
        if nombre not in valores:
            valores[nombre] = [] if nombre in _AutoNS._LISTAS else _AutoNS()
        return valores[nombre]

    def __setattr__(self, nombre, valor):
        object.__getattribute__(self, "_valores")[nombre] = valor


class _ServicioFalso:
    def campaign_path(self, customer_id, id_):
        return f"customers/{customer_id}/campaigns/{id_}"

    def campaign_budget_path(self, customer_id, id_):
        return f"customers/{customer_id}/campaignBudgets/{id_}"

    def ad_group_path(self, customer_id, id_):
        return f"customers/{customer_id}/adGroups/{id_}"

    def ad_group_criterion_path(self, customer_id, ad_group_id, criterion_id):
        return f"customers/{customer_id}/adGroupCriteria/{ad_group_id}~{criterion_id}"


class _ClienteMutateFalso:
    def __init__(self):
        self.llamadas_mutate = []
        self._servicio = _ServicioFalso()

    def get_service(self, nombre):
        return self._servicio

    def get_type(self, nombre):
        return _AutoNS()

    def mutate(self, customer_id, operaciones):
        self.llamadas_mutate.append((customer_id, list(operaciones)))
        return {"ok": True}


def test_pausar_keyword_arma_update_mask_y_resource_name():
    cliente = _ClienteMutateFalso()
    operaciones = [{"tipo": "ad_group_criterion_status", "ad_group_id": 1, "criterion_id": 2, "nuevo_estado": "PAUSED"}]

    resultado = mutate.construir_operaciones(cliente, "111", operaciones)

    op = resultado[0].ad_group_criterion_operation
    assert op.update.resource_name == "customers/111/adGroupCriteria/1~2"
    assert op.update.status == "PAUSED"
    assert "status" in op.update_mask.paths


def test_nueva_negativa_arma_creacion_correcta():
    cliente = _ClienteMutateFalso()
    operaciones = [{"tipo": "campaign_negative_keyword", "campaign_id": 5, "texto": "usado", "match_type": "EXACT"}]

    resultado = mutate.construir_operaciones(cliente, "111", operaciones)

    op = resultado[0].campaign_criterion_operation
    assert op.create.campaign == "customers/111/campaigns/5"
    assert op.create.negative is True
    assert op.create.keyword.text == "usado"


def test_ajuste_presupuesto_usa_monto_ya_resuelto():
    cliente = _ClienteMutateFalso()
    operaciones = [{"tipo": "campaign_budget_amount", "budget_resource": "customers/111/campaignBudgets/9", "monto_nuevo_micros": 19_800_000_000}]

    resultado = mutate.construir_operaciones(cliente, "111", operaciones)

    op = resultado[0].campaign_budget_operation
    assert op.update.resource_name == "customers/111/campaignBudgets/9"
    assert op.update.amount_micros == 19_800_000_000
    assert "amount_micros" in op.update_mask.paths


def test_nueva_campana_completa_es_atomica_y_fuerza_paused():
    cliente = _ClienteMutateFalso()
    operaciones = [
        {"tipo": "campaign_budget", "nombre": "JUANITAS_GADS_BUDGET_RECOMPRA_JUL2026", "monto_diario_ars": 16500},
        {"tipo": "campaign", "nombre": "JUANITAS_GADS_SEARCH_RECOMPRA_JUL2026", "canal": "SEARCH", "budget_ref": 0,
         "estado": "ENABLED"},  # aunque la propuesta pida ENABLED, se fuerza PAUSED
        {"tipo": "ad_group", "nombre": "RECOMPRA_GENERAL", "campaign_ref": 1},
        {"tipo": "keyword", "ad_group_ref": 2, "texto": "comprar ropa interior online", "match_type": "PHRASE"},
        {"tipo": "ad_rsa", "ad_group_ref": 2, "headlines": ["Renová tu cajón"], "descriptions": ["Packs x3 y x6"]},
    ]

    resultado = mutate.ejecutar(cliente, "111", operaciones)

    assert len(cliente.llamadas_mutate) == 1  # una sola llamada atómica
    customer_id, ops_enviadas = cliente.llamadas_mutate[0]
    assert customer_id == "111"
    assert len(ops_enviadas) == 5

    campaign_op = ops_enviadas[1].campaign_operation
    assert campaign_op.create.status == "PAUSED"
    assert campaign_op.create.campaign_budget == "customers/111/campaignBudgets/-1"

    ad_group_op = ops_enviadas[2].ad_group_operation
    assert ad_group_op.create.campaign == "customers/111/campaigns/-2"
    assert ad_group_op.create.status == "PAUSED"

    ad_rsa_op = ops_enviadas[4].ad_group_ad_operation
    assert ad_rsa_op.create.status == "PAUSED"
    assert ad_rsa_op.create.ad.responsive_search_ad.headlines[0].text == "Renová tu cajón"


def test_rechaza_canal_no_soportado_para_nueva_campana():
    cliente = _ClienteMutateFalso()
    operaciones = [
        {"tipo": "campaign_budget", "nombre": "X", "monto_diario_ars": 1000},
        {"tipo": "campaign", "nombre": "X", "canal": "PERFORMANCE_MAX", "budget_ref": 0},
    ]
    with pytest.raises(ValueError, match="fase 2"):
        mutate.construir_operaciones(cliente, "111", operaciones)


def test_rechaza_tipo_de_operacion_desconocido():
    cliente = _ClienteMutateFalso()
    with pytest.raises(ValueError):
        mutate.construir_operaciones(cliente, "111", [{"tipo": "algo_inventado"}])


def test_activar_campana_setea_enabled_y_llama_mutate_una_vez():
    cliente = _ClienteMutateFalso()
    mutate.activar_campana(cliente, "111", "customers/111/campaigns/123")

    assert len(cliente.llamadas_mutate) == 1
    _, ops = cliente.llamadas_mutate[0]
    assert len(ops) == 1
    campaign_op = ops[0].campaign_operation
    assert campaign_op.update.resource_name == "customers/111/campaigns/123"
    assert campaign_op.update.status == "ENABLED"
    assert "status" in campaign_op.update_mask.paths
