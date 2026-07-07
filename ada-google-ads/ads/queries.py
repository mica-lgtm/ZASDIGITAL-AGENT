"""Strings GAQL usados por ads/reportes.py. Un query por reporte, con
placeholders `{desde}`/`{hasta}` (YYYY-MM-DD, inclusive) donde aplica.
Ninguno de estos queries muta nada -- son todos SELECT vía GoogleAdsService.search."""

QUERY_CAMPANAS = """
    SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.campaign_budget,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.conversions,
        metrics.conversions_value,
        metrics.search_impression_share,
        metrics.search_budget_lost_impression_share,
        metrics.search_rank_lost_impression_share
    FROM campaign
    WHERE segments.date BETWEEN '{desde}' AND '{hasta}'
"""

QUERY_PRESUPUESTOS = """
    SELECT
        campaign_budget.id,
        campaign_budget.name,
        campaign_budget.amount_micros,
        campaign_budget.explicitly_shared
    FROM campaign_budget
"""

QUERY_PACING_HOY = """
    SELECT
        campaign.id,
        campaign.name,
        campaign.campaign_budget,
        campaign_budget.amount_micros,
        metrics.cost_micros
    FROM campaign
    WHERE segments.date = '{fecha}'
"""

QUERY_GRUPOS_DE_ANUNCIOS = """
    SELECT
        ad_group.id,
        ad_group.name,
        ad_group.status,
        campaign.id,
        campaign.name,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.conversions_value
    FROM ad_group
    WHERE segments.date BETWEEN '{desde}' AND '{hasta}'
"""

QUERY_ANUNCIOS = """
    SELECT
        ad_group_ad.ad.id,
        ad_group_ad.status,
        ad_group_ad.policy_summary.approval_status,
        ad_group_ad.policy_summary.review_status,
        ad_group.id,
        ad_group.name,
        campaign.id,
        campaign.name,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.conversions_value
    FROM ad_group_ad
    WHERE segments.date BETWEEN '{desde}' AND '{hasta}'
"""

QUERY_ACTIVOS_RSA = """
    SELECT
        ad_group_ad_asset_view.field_type,
        ad_group_ad_asset_view.performance_label,
        ad_group.id,
        campaign.id,
        asset.id,
        asset.text_asset.text
    FROM ad_group_ad_asset_view
    WHERE segments.date BETWEEN '{desde}' AND '{hasta}'
"""

QUERY_KEYWORDS = """
    SELECT
        ad_group_criterion.criterion_id,
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type,
        ad_group_criterion.status,
        ad_group_criterion.quality_info.quality_score,
        ad_group_criterion.quality_info.creative_quality_score,
        ad_group_criterion.quality_info.post_click_quality_score,
        ad_group_criterion.quality_info.search_predicted_ctr,
        ad_group.id,
        campaign.id,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.conversions_value
    FROM keyword_view
    WHERE segments.date BETWEEN '{desde}' AND '{hasta}'
"""

QUERY_NEGATIVAS = """
    SELECT
        campaign.id,
        campaign_criterion.criterion_id,
        campaign_criterion.keyword.text,
        campaign_criterion.keyword.match_type,
        campaign_criterion.negative
    FROM campaign_criterion
    WHERE campaign_criterion.type = 'KEYWORD'
        AND campaign_criterion.negative = true
"""

QUERY_SEARCH_TERMS = """
    SELECT
        search_term_view.search_term,
        search_term_view.status,
        campaign.id,
        ad_group.id,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.conversions_value
    FROM search_term_view
    WHERE segments.date BETWEEN '{desde}' AND '{hasta}'
"""

QUERY_CONVERSION_ACTIONS = """
    SELECT
        conversion_action.id,
        conversion_action.name,
        conversion_action.status,
        conversion_action.type
    FROM conversion_action
"""

QUERY_SHOPPING_PERFORMANCE = """
    SELECT
        segments.product_item_id,
        segments.product_title,
        metrics.cost_micros,
        metrics.clicks,
        metrics.impressions,
        metrics.conversions,
        metrics.conversions_value
    FROM shopping_performance_view
    WHERE segments.date BETWEEN '{desde}' AND '{hasta}'
"""

QUERY_ASSET_GROUPS = """
    SELECT
        asset_group.id,
        asset_group.name,
        asset_group.status,
        campaign.id,
        campaign.name
    FROM asset_group
"""

QUERY_CAMBIOS_RECIENTES = """
    SELECT
        change_event.change_date_time,
        change_event.change_resource_type,
        change_event.client_type,
        change_event.user_email,
        change_event.resource_change_operation
    FROM change_event
    WHERE change_event.change_date_time BETWEEN '{desde}' AND '{hasta}'
    ORDER BY change_event.change_date_time DESC
"""

QUERY_RECOMENDACIONES = """
    SELECT
        recommendation.resource_name,
        recommendation.type,
        recommendation.campaign,
        recommendation.impact.base_metrics.cost_micros,
        recommendation.impact.potential_metrics.cost_micros
    FROM recommendation
"""
