"""Reportes de solo lectura sobre una cuenta de Google Ads. Cada `reporte_*`
hace: (1) arma el GAQL con las fechas pedidas, (2) lo corre vía
`GoogleAdsQueryClient.buscar`, (3) normaliza cada fila cruda con su
`_normalizar_*` (función pura, testeable con filas fake sin gRPC).

Nada acá muta nada -- son builders de datos para que las rutinas y el
razonamiento de Ada diagnostiquen. Ver `ads/mutate.py` para la escritura."""

from . import queries


def _micros(valor):
    return round((valor or 0) / 1_000_000, 2)


def _cpa(spend, conversiones):
    return round(spend / conversiones, 2) if conversiones else None


def _roas(spend, ingresos):
    return round(ingresos / spend, 2) if spend else None


# --- Campañas ------------------------------------------------------------

def _normalizar_campana(row):
    m = row.metrics
    spend = _micros(m.cost_micros)
    conversiones = float(m.conversions)
    ingresos = float(m.conversions_value)
    return {
        "campaign_id": row.campaign.id,
        "nombre": row.campaign.name,
        "estado": str(row.campaign.status),
        "tipo_canal": str(row.campaign.advertising_channel_type),
        "budget_resource": row.campaign.campaign_budget,
        "spend": spend,
        "impresiones": int(m.impressions),
        "clics": int(m.clicks),
        "ctr": round(float(m.ctr) * 100, 4),
        "conversiones": conversiones,
        "ingresos": ingresos,
        "cpa": _cpa(spend, conversiones),
        "roas": _roas(spend, ingresos),
        "impression_share": getattr(m, "search_impression_share", None),
        "is_perdido_presupuesto": getattr(m, "search_budget_lost_impression_share", None),
        "is_perdido_ranking": getattr(m, "search_rank_lost_impression_share", None),
    }


def reporte_campanas(client, customer_id, desde, hasta):
    query = queries.QUERY_CAMPANAS.format(desde=desde, hasta=hasta)
    return [_normalizar_campana(row) for row in client.buscar(customer_id, query)]


# --- Presupuestos ----------------------------------------------------------

def _normalizar_presupuesto(row):
    return {
        "budget_resource": row.campaign_budget.resource_name if hasattr(row.campaign_budget, "resource_name") else None,
        "nombre": row.campaign_budget.name,
        "monto_diario": _micros(row.campaign_budget.amount_micros),
        "compartido": bool(row.campaign_budget.explicitly_shared),
    }


def reporte_presupuestos(client, customer_id):
    return [_normalizar_presupuesto(row) for row in client.buscar(customer_id, queries.QUERY_PRESUPUESTOS)]


# --- Pacing intradía ---------------------------------------------------

def _normalizar_pacing(row):
    monto_diario = _micros(row.campaign_budget.amount_micros)
    spend_hoy = _micros(row.metrics.cost_micros)
    return {
        "campaign_id": row.campaign.id,
        "nombre": row.campaign.name,
        "monto_diario": monto_diario,
        "spend_hoy": spend_hoy,
        "pct_consumido": round(spend_hoy / monto_diario * 100, 1) if monto_diario else None,
    }


def reporte_pacing_hoy(client, customer_id, fecha):
    query = queries.QUERY_PACING_HOY.format(fecha=fecha)
    return [_normalizar_pacing(row) for row in client.buscar(customer_id, query)]


# --- Grupos de anuncios --------------------------------------------------

def _normalizar_grupo(row):
    m = row.metrics
    spend = _micros(m.cost_micros)
    conversiones = float(m.conversions)
    ingresos = float(m.conversions_value)
    return {
        "ad_group_id": row.ad_group.id,
        "nombre": row.ad_group.name,
        "estado": str(row.ad_group.status),
        "campaign_id": row.campaign.id,
        "campaign_nombre": row.campaign.name,
        "spend": spend,
        "impresiones": int(m.impressions),
        "clics": int(m.clicks),
        "conversiones": conversiones,
        "ingresos": ingresos,
        "cpa": _cpa(spend, conversiones),
        "roas": _roas(spend, ingresos),
    }


def reporte_grupos_de_anuncios(client, customer_id, desde, hasta):
    query = queries.QUERY_GRUPOS_DE_ANUNCIOS.format(desde=desde, hasta=hasta)
    return [_normalizar_grupo(row) for row in client.buscar(customer_id, query)]


# --- Anuncios --------------------------------------------------------------

def _normalizar_anuncio(row):
    m = row.metrics
    spend = _micros(m.cost_micros)
    conversiones = float(m.conversions)
    ingresos = float(m.conversions_value)
    policy = row.ad_group_ad.policy_summary
    return {
        "ad_id": row.ad_group_ad.ad.id,
        "estado": str(row.ad_group_ad.status),
        "approval_status": str(policy.approval_status),
        "review_status": str(policy.review_status),
        "ad_group_id": row.ad_group.id,
        "ad_group_nombre": row.ad_group.name,
        "campaign_id": row.campaign.id,
        "campaign_nombre": row.campaign.name,
        "spend": spend,
        "impresiones": int(m.impressions),
        "clics": int(m.clicks),
        "conversiones": conversiones,
        "ingresos": ingresos,
        "cpa": _cpa(spend, conversiones),
        "roas": _roas(spend, ingresos),
    }


def reporte_anuncios(client, customer_id, desde, hasta):
    query = queries.QUERY_ANUNCIOS.format(desde=desde, hasta=hasta)
    return [_normalizar_anuncio(row) for row in client.buscar(customer_id, query)]


# --- Assets de RSA (headlines/descriptions) --------------------------------

def _normalizar_activo_rsa(row):
    view = row.ad_group_ad_asset_view
    return {
        "ad_group_id": row.ad_group.id,
        "campaign_id": row.campaign.id,
        "asset_id": row.asset.id,
        "texto": row.asset.text_asset.text,
        "tipo_campo": str(view.field_type),
        "performance_label": str(view.performance_label),
    }


def reporte_activos_rsa(client, customer_id, desde, hasta):
    query = queries.QUERY_ACTIVOS_RSA.format(desde=desde, hasta=hasta)
    return [_normalizar_activo_rsa(row) for row in client.buscar(customer_id, query)]


# --- Keywords + quality score ----------------------------------------------

def _normalizar_keyword(row):
    m = row.metrics
    crit = row.ad_group_criterion
    spend = _micros(m.cost_micros)
    conversiones = float(m.conversions)
    ingresos = float(m.conversions_value)
    return {
        "criterion_id": crit.criterion_id,
        "texto": crit.keyword.text,
        "match_type": str(crit.keyword.match_type),
        "estado": str(crit.status),
        "quality_score": crit.quality_info.quality_score,
        "creative_quality_score": str(crit.quality_info.creative_quality_score),
        "post_click_quality_score": str(crit.quality_info.post_click_quality_score),
        "search_predicted_ctr": str(crit.quality_info.search_predicted_ctr),
        "ad_group_id": row.ad_group.id,
        "campaign_id": row.campaign.id,
        "spend": spend,
        "impresiones": int(m.impressions),
        "clics": int(m.clicks),
        "conversiones": conversiones,
        "ingresos": ingresos,
        "cpa": _cpa(spend, conversiones),
        "roas": _roas(spend, ingresos),
    }


def reporte_keywords(client, customer_id, desde, hasta):
    query = queries.QUERY_KEYWORDS.format(desde=desde, hasta=hasta)
    return [_normalizar_keyword(row) for row in client.buscar(customer_id, query)]


# --- Negativas existentes ---------------------------------------------------

def _normalizar_negativa(row):
    crit = row.campaign_criterion
    return {
        "campaign_id": row.campaign.id,
        "criterion_id": crit.criterion_id,
        "texto": crit.keyword.text,
        "match_type": str(crit.keyword.match_type),
    }


def reporte_negativas(client, customer_id):
    return [_normalizar_negativa(row) for row in client.buscar(customer_id, queries.QUERY_NEGATIVAS)]


# --- Search terms ------------------------------------------------------

def _normalizar_search_term(row):
    m = row.metrics
    spend = _micros(m.cost_micros)
    conversiones = float(m.conversions)
    ingresos = float(m.conversions_value)
    return {
        "termino": row.search_term_view.search_term,
        "estado": str(row.search_term_view.status),
        "campaign_id": row.campaign.id,
        "ad_group_id": row.ad_group.id,
        "spend": spend,
        "impresiones": int(m.impressions),
        "clics": int(m.clicks),
        "conversiones": conversiones,
        "ingresos": ingresos,
        "cpa": _cpa(spend, conversiones),
        "roas": _roas(spend, ingresos),
    }


def reporte_search_terms(client, customer_id, desde, hasta):
    query = queries.QUERY_SEARCH_TERMS.format(desde=desde, hasta=hasta)
    return [_normalizar_search_term(row) for row in client.buscar(customer_id, query)]


# --- Conversion actions ------------------------------------------------

def _normalizar_conversion_action(row):
    ca = row.conversion_action
    return {
        "id": ca.id,
        "nombre": ca.name,
        "estado": str(ca.status),
        "tipo": str(ca.type_),
    }


def reporte_conversion_actions(client, customer_id):
    return [_normalizar_conversion_action(row) for row in client.buscar(customer_id, queries.QUERY_CONVERSION_ACTIONS)]


# --- Shopping / PMax producto -------------------------------------------

def _normalizar_shopping(row):
    m = row.metrics
    spend = _micros(m.cost_micros)
    conversiones = float(m.conversions)
    ingresos = float(m.conversions_value)
    return {
        "product_item_id": row.segments.product_item_id,
        "product_title": row.segments.product_title,
        "spend": spend,
        "impresiones": int(m.impressions),
        "clics": int(m.clicks),
        "conversiones": conversiones,
        "ingresos": ingresos,
        "cpa": _cpa(spend, conversiones),
        "roas": _roas(spend, ingresos),
    }


def reporte_shopping(client, customer_id, desde, hasta):
    query = queries.QUERY_SHOPPING_PERFORMANCE.format(desde=desde, hasta=hasta)
    return [_normalizar_shopping(row) for row in client.buscar(customer_id, query)]


# --- Asset groups (Performance Max) -----------------------------------

def _normalizar_asset_group(row):
    return {
        "asset_group_id": row.asset_group.id,
        "nombre": row.asset_group.name,
        "estado": str(row.asset_group.status),
        "campaign_id": row.campaign.id,
        "campaign_nombre": row.campaign.name,
    }


def reporte_asset_groups(client, customer_id):
    return [_normalizar_asset_group(row) for row in client.buscar(customer_id, queries.QUERY_ASSET_GROUPS)]


# --- Cambios recientes (detectar ediciones manuales fuera de Ada) -------

def _normalizar_cambio(row):
    ce = row.change_event
    return {
        "fecha_hora": ce.change_date_time,
        "tipo_recurso": str(ce.change_resource_type),
        "tipo_cliente": str(ce.client_type),
        "usuario": ce.user_email,
        "operacion": str(ce.resource_change_operation),
    }


def reporte_cambios_recientes(client, customer_id, desde, hasta):
    query = queries.QUERY_CAMBIOS_RECIENTES.format(desde=desde, hasta=hasta)
    return [_normalizar_cambio(row) for row in client.buscar(customer_id, query)]


# --- Recomendaciones de Google (señal extra, no se aplican solas) -------

def _normalizar_recomendacion(row):
    rec = row.recommendation
    return {
        "resource_name": rec.resource_name,
        "tipo": str(rec.type_),
        "campaign": rec.campaign,
        "costo_actual": _micros(rec.impact.base_metrics.cost_micros),
        "costo_potencial": _micros(rec.impact.potential_metrics.cost_micros),
    }


def reporte_recomendaciones(client, customer_id):
    return [_normalizar_recomendacion(row) for row in client.buscar(customer_id, queries.QUERY_RECOMENDACIONES)]
