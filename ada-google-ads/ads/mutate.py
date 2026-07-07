"""TODA la escritura contra Google Ads vive acá. Este módulo es importado
ÚNICAMENTE por `aplicar_propuesta.py` -- ninguna rutina programada
(`orquestador_manana.py`, `orquestador_tarde.py`, `orquestador_semanal.py`)
ni `ads/reportes.py` lo importa jamás. Esa garantía está verificada por
`tests/test_rutinas_no_mutan.py` (estática + runtime).

Toda campaña/grupo/anuncio nuevo se sube SIEMPRE en estado PAUSED, forzado
en el código de acá abajo -- no es algo que una propuesta pueda cambiar. Ver
CLAUDE.md, sección "Puerta de aprobación".

Alcance actual: Search. Performance Max queda para una fase 2 (requiere
AssetGroupService y listing group filters, más complejo) -- ver
`conocimiento/estructuras-por-tipo-de-campana.md`."""

CANALES_SOPORTADOS_NUEVA_CAMPANA = {"SEARCH"}

TIPOS_DE_OPERACION_SOPORTADOS = {
    "ad_group_criterion_status",
    "campaign_negative_keyword",
    "campaign_budget_amount",
    "campaign_budget",
    "campaign",
    "ad_group",
    "keyword",
    "ad_rsa",
}


class GoogleAdsMutateClient:
    """Envuelve el cliente oficial de Google Ads para ejecutar mutaciones.
    Mismo patrón de wrapper inyectable que `GoogleAdsQueryClient` en
    `ads/client.py` -- se puede pasar un fake en tests."""

    def __init__(self, google_ads_client):
        self._client = google_ads_client

    def get_service(self, nombre):
        return self._client.get_service(nombre)

    def get_type(self, nombre):
        return self._client.get_type(nombre)

    def mutate(self, customer_id, operaciones):
        """`operaciones`: lista de objetos `MutateOperation`. Se ejecutan en
        UNA sola llamada atómica -- o se crea/actualiza todo, o nada."""
        from google.ads.googleads.errors import GoogleAdsException

        service = self._client.get_service("GoogleAdsService")
        try:
            return service.mutate(customer_id=customer_id, mutate_operations=operaciones)
        except GoogleAdsException as exc:
            raise RuntimeError(f"Google Ads API error al mutar {customer_id}: {exc}") from exc


def cliente_mutate_desde_env(env=None):
    from google.ads.googleads.client import GoogleAdsClient

    from .client import credenciales_mcc

    creds = credenciales_mcc(env)
    google_ads_client = GoogleAdsClient.load_from_dict({**creds, "use_proto_plus": True})
    return GoogleAdsMutateClient(google_ads_client)


def _validar_tipos(operaciones):
    desconocidos = {op["tipo"] for op in operaciones} - TIPOS_DE_OPERACION_SOPORTADOS
    if desconocidos:
        raise ValueError(f"Tipo(s) de operación no soportado(s): {desconocidos}")


def _op_pausar_keyword(cliente, customer_id, op):
    service = cliente.get_service("AdGroupCriterionService")
    mutate_op = cliente.get_type("MutateOperation")
    criterion_op = mutate_op.ad_group_criterion_operation
    resource_name = service.ad_group_criterion_path(customer_id, op["ad_group_id"], op["criterion_id"])
    criterion_op.update.resource_name = resource_name
    criterion_op.update.status = op["nuevo_estado"]
    criterion_op.update_mask.paths.append("status")
    return mutate_op


def _op_nueva_negativa(cliente, customer_id, op):
    service = cliente.get_service("CampaignService")
    mutate_op = cliente.get_type("MutateOperation")
    criterion_op = mutate_op.campaign_criterion_operation
    criterion_op.create.campaign = service.campaign_path(customer_id, op["campaign_id"])
    criterion_op.create.negative = True
    criterion_op.create.keyword.text = op["texto"]
    criterion_op.create.keyword.match_type = op.get("match_type", "EXACT")
    return mutate_op


def _op_ajuste_presupuesto(cliente, op):
    """`op["monto_nuevo_micros"]` ya viene resuelto por `aplicar_propuesta.py`
    (lee el monto actual y aplica el % de la propuesta) -- acá solo se
    ejecuta, no se recalcula nada."""
    mutate_op = cliente.get_type("MutateOperation")
    budget_op = mutate_op.campaign_budget_operation
    budget_op.update.resource_name = op["budget_resource"]
    budget_op.update.amount_micros = op["monto_nuevo_micros"]
    budget_op.update_mask.paths.append("amount_micros")
    return mutate_op


def _resource_temporal(tipo, indice):
    return f"-{indice + 1}"


def _op_crear_presupuesto(cliente, customer_id, op, indice):
    service = cliente.get_service("CampaignBudgetService")
    mutate_op = cliente.get_type("MutateOperation")
    budget_op = mutate_op.campaign_budget_operation
    budget_op.create.resource_name = service.campaign_budget_path(customer_id, _resource_temporal("budget", indice))
    budget_op.create.name = op["nombre"]
    budget_op.create.amount_micros = int(op["monto_diario_ars"] * 1_000_000)
    # Presupuesto dedicado a esta campaña, no compartido -- requerido por
    # estrategias de puja automáticas como MAXIMIZE_CONVERSIONS.
    budget_op.create.explicitly_shared = False
    return mutate_op


_ESTRATEGIAS_DE_PUJA_SOPORTADAS = {"MAXIMIZE_CONVERSIONS", "MANUAL_CPC"}


def _op_crear_campana(cliente, customer_id, op, indice, resource_names):
    service = cliente.get_service("CampaignService")
    mutate_op = cliente.get_type("MutateOperation")
    campaign_op = mutate_op.campaign_operation
    campaign_op.create.resource_name = service.campaign_path(customer_id, _resource_temporal("campaign", indice))
    campaign_op.create.name = op["nombre"]
    campaign_op.create.advertising_channel_type = op.get("canal", "SEARCH")
    campaign_op.create.campaign_budget = resource_names[op["budget_ref"]]
    # No negociable: toda campaña nueva se sube PAUSADA, sin importar qué
    # diga la propuesta.
    campaign_op.create.status = "PAUSED"

    # Google Ads exige una estrategia de puja al crear la campaña -- default
    # MAXIMIZE_CONVERSIONS (mismo default que documenta conocimiento/
    # estructuras-por-tipo-de-campana.md) si la propuesta no especifica otra.
    estrategia = op.get("bidding_strategy", "MAXIMIZE_CONVERSIONS")
    if estrategia not in _ESTRATEGIAS_DE_PUJA_SOPORTADAS:
        raise ValueError(f"Estrategia de puja no soportada: {estrategia}")
    if estrategia == "MAXIMIZE_CONVERSIONS":
        campaign_op.create.maximize_conversions = cliente.get_type("MaximizeConversions")
    elif estrategia == "MANUAL_CPC":
        campaign_op.create.manual_cpc = cliente.get_type("ManualCpc")

    # Requerido por Google Ads (transparencia de publicidad política UE) --
    # ninguna marca de la agencia hace publicidad política.
    campaign_op.create.contains_eu_political_advertising = "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING"

    return mutate_op


def _op_crear_grupo(cliente, customer_id, op, indice, resource_names):
    service = cliente.get_service("AdGroupService")
    mutate_op = cliente.get_type("MutateOperation")
    ag_op = mutate_op.ad_group_operation
    ag_op.create.resource_name = service.ad_group_path(customer_id, _resource_temporal("ad_group", indice))
    ag_op.create.name = op["nombre"]
    ag_op.create.campaign = resource_names[op["campaign_ref"]]
    ag_op.create.status = "PAUSED"
    return mutate_op


def _op_crear_keyword(cliente, customer_id, op, indice, resource_names):
    mutate_op = cliente.get_type("MutateOperation")
    crit_op = mutate_op.ad_group_criterion_operation
    crit_op.create.ad_group = resource_names[op["ad_group_ref"]]
    crit_op.create.keyword.text = op["texto"]
    crit_op.create.keyword.match_type = op.get("match_type", "PHRASE")
    crit_op.create.status = "PAUSED"
    return mutate_op


def _op_crear_rsa(cliente, customer_id, op, indice, resource_names):
    mutate_op = cliente.get_type("MutateOperation")
    ad_op = mutate_op.ad_group_ad_operation
    ad_op.create.ad_group = resource_names[op["ad_group_ref"]]
    ad_op.create.status = "PAUSED"
    for texto in op.get("headlines", []):
        headline = cliente.get_type("AdTextAsset")
        headline.text = texto
        ad_op.create.ad.responsive_search_ad.headlines.append(headline)
    for texto in op.get("descriptions", []):
        descripcion = cliente.get_type("AdTextAsset")
        descripcion.text = texto
        ad_op.create.ad.responsive_search_ad.descriptions.append(descripcion)
    return mutate_op


def construir_operaciones(cliente, customer_id, operaciones):
    """Traduce la lista `operaciones` de una propuesta ya aprobada en una
    lista de `MutateOperation` lista para `GoogleAdsMutateClient.mutate()`.
    Todo en una sola tanda -- si la propuesta crea varios recursos (ej. una
    campaña nueva completa), se referencian entre sí con resource names
    temporales (`campaign_ref`/`budget_ref`/`ad_group_ref` = índice a una
    operación anterior en la misma lista)."""
    _validar_tipos(operaciones)

    resultado = []
    resource_names = {}

    for indice, op in enumerate(operaciones):
        tipo = op["tipo"]
        if tipo == "ad_group_criterion_status":
            mutate_op = _op_pausar_keyword(cliente, customer_id, op)
        elif tipo == "campaign_negative_keyword":
            mutate_op = _op_nueva_negativa(cliente, customer_id, op)
        elif tipo == "campaign_budget_amount":
            mutate_op = _op_ajuste_presupuesto(cliente, op)
        elif tipo == "campaign_budget":
            mutate_op = _op_crear_presupuesto(cliente, customer_id, op, indice)
            resource_names[indice] = mutate_op.campaign_budget_operation.create.resource_name
        elif tipo == "campaign":
            canal = op.get("canal", "SEARCH")
            if canal not in CANALES_SOPORTADOS_NUEVA_CAMPANA:
                raise ValueError(
                    f"Tipo de campaña '{canal}' todavía no soportado por aplicar_propuesta.py "
                    "(fase 2 -- ver conocimiento/estructuras-por-tipo-de-campana.md)"
                )
            mutate_op = _op_crear_campana(cliente, customer_id, op, indice, resource_names)
            resource_names[indice] = mutate_op.campaign_operation.create.resource_name
        elif tipo == "ad_group":
            mutate_op = _op_crear_grupo(cliente, customer_id, op, indice, resource_names)
            resource_names[indice] = mutate_op.ad_group_operation.create.resource_name
        elif tipo == "keyword":
            mutate_op = _op_crear_keyword(cliente, customer_id, op, indice, resource_names)
        elif tipo == "ad_rsa":
            mutate_op = _op_crear_rsa(cliente, customer_id, op, indice, resource_names)
        else:
            raise ValueError(f"Tipo de operación no soportado: {tipo}")
        resultado.append(mutate_op)

    return resultado


def ejecutar(cliente, customer_id, operaciones):
    """Construye y ejecuta, en una sola llamada atómica, todas las
    operaciones de una propuesta aprobada."""
    mutate_operations = construir_operaciones(cliente, customer_id, operaciones)
    return cliente.mutate(customer_id, mutate_operations)


def activar_campana(cliente, customer_id, campaign_resource_name):
    """Pasa una campaña ya creada (SUBIDA PAUSADA) a ENABLED. Único cambio
    permitido por `--activar` en `aplicar_propuesta.py`."""
    mutate_op = cliente.get_type("MutateOperation")
    campaign_op = mutate_op.campaign_operation
    campaign_op.update.resource_name = campaign_resource_name
    campaign_op.update.status = "ENABLED"
    campaign_op.update_mask.paths.append("status")
    return cliente.mutate(customer_id, [mutate_op])
