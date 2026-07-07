"""Constructores de filas fake que imitan el shape anidado que devuelve
GoogleAdsService.search() (objetos proto-plus con atributos anidados), sin
depender de gRPC ni de la librería `google-ads` para correr los tests."""

from types import SimpleNamespace


def _ns(d):
    if isinstance(d, dict):
        return SimpleNamespace(**{k: _ns(v) for k, v in d.items()})
    return d


def fila_campana(campaign_id=1, nombre="CAMPANA_TEST", estado="ENABLED",
                  tipo_canal="SEARCH", budget_resource="customers/1/campaignBudgets/1",
                  cost_micros=100_000_000, impressions=1000, clicks=20, ctr=0.02,
                  conversions=5, conversions_value=750.0,
                  search_impression_share=0.6, search_budget_lost_impression_share=0.1,
                  search_rank_lost_impression_share=0.05):
    return _ns({
        "campaign": {
            "id": campaign_id, "name": nombre, "status": estado,
            "advertising_channel_type": tipo_canal, "campaign_budget": budget_resource,
        },
        "metrics": {
            "cost_micros": cost_micros, "impressions": impressions, "clicks": clicks,
            "ctr": ctr, "conversions": conversions, "conversions_value": conversions_value,
            "search_impression_share": search_impression_share,
            "search_budget_lost_impression_share": search_budget_lost_impression_share,
            "search_rank_lost_impression_share": search_rank_lost_impression_share,
        },
    })


def fila_presupuesto(resource_name="customers/1/campaignBudgets/1", nombre="BUDGET_TEST",
                      amount_micros=16_500_000_000, explicitly_shared=False):
    return _ns({
        "campaign_budget": {
            "resource_name": resource_name, "name": nombre,
            "amount_micros": amount_micros, "explicitly_shared": explicitly_shared,
        },
    })


def fila_pacing(campaign_id=1, nombre="CAMPANA_TEST", amount_micros=16_500_000_000,
                cost_micros=8_000_000_000):
    return _ns({
        "campaign": {"id": campaign_id, "name": nombre},
        "campaign_budget": {"amount_micros": amount_micros},
        "metrics": {"cost_micros": cost_micros},
    })


def fila_grupo(ad_group_id=1, nombre="GRUPO_TEST", estado="ENABLED", campaign_id=1,
               campaign_nombre="CAMPANA_TEST", cost_micros=50_000_000, impressions=500,
               clicks=10, conversions=2, conversions_value=300.0):
    return _ns({
        "ad_group": {"id": ad_group_id, "name": nombre, "status": estado},
        "campaign": {"id": campaign_id, "name": campaign_nombre},
        "metrics": {
            "cost_micros": cost_micros, "impressions": impressions, "clicks": clicks,
            "conversions": conversions, "conversions_value": conversions_value,
        },
    })


def fila_anuncio(ad_id=1, estado="PAUSED", approval_status="APPROVED", review_status="REVIEWED",
                  ad_group_id=1, ad_group_nombre="GRUPO_TEST", campaign_id=1,
                  campaign_nombre="CAMPANA_TEST", cost_micros=20_000_000, impressions=200,
                  clicks=4, conversions=1, conversions_value=150.0):
    return _ns({
        "ad_group_ad": {
            "ad": {"id": ad_id}, "status": estado,
            "policy_summary": {"approval_status": approval_status, "review_status": review_status},
        },
        "ad_group": {"id": ad_group_id, "name": ad_group_nombre},
        "campaign": {"id": campaign_id, "name": campaign_nombre},
        "metrics": {
            "cost_micros": cost_micros, "impressions": impressions, "clicks": clicks,
            "conversions": conversions, "conversions_value": conversions_value,
        },
    })


def fila_activo_rsa(ad_group_id=1, campaign_id=1, asset_id=1, texto="Envío gratis",
                     field_type="HEADLINE", performance_label="BEST"):
    return _ns({
        "ad_group_ad_asset_view": {"field_type": field_type, "performance_label": performance_label},
        "ad_group": {"id": ad_group_id},
        "campaign": {"id": campaign_id},
        "asset": {"id": asset_id, "text_asset": {"text": texto}},
    })


def fila_keyword(criterion_id=1, texto="comprar ropa interior online", match_type="PHRASE",
                  estado="ENABLED", quality_score=7, creative_quality_score="AVERAGE",
                  post_click_quality_score="ABOVE_AVERAGE", search_predicted_ctr="BELOW_AVERAGE",
                  ad_group_id=1, campaign_id=1, cost_micros=15_000_000, impressions=150,
                  clicks=3, conversions=1, conversions_value=100.0):
    return _ns({
        "ad_group_criterion": {
            "criterion_id": criterion_id,
            "keyword": {"text": texto, "match_type": match_type},
            "status": estado,
            "quality_info": {
                "quality_score": quality_score,
                "creative_quality_score": creative_quality_score,
                "post_click_quality_score": post_click_quality_score,
                "search_predicted_ctr": search_predicted_ctr,
            },
        },
        "ad_group": {"id": ad_group_id},
        "campaign": {"id": campaign_id},
        "metrics": {
            "cost_micros": cost_micros, "impressions": impressions, "clicks": clicks,
            "conversions": conversions, "conversions_value": conversions_value,
        },
    })


def fila_negativa(campaign_id=1, criterion_id=1, texto="gratis", match_type="BROAD"):
    return _ns({
        "campaign": {"id": campaign_id},
        "campaign_criterion": {
            "criterion_id": criterion_id,
            "keyword": {"text": texto, "match_type": match_type},
        },
    })


def fila_search_term(termino="comprar ropa interior barata", estado="NONE", campaign_id=1,
                      ad_group_id=1, cost_micros=5_000_000, impressions=50, clicks=1,
                      conversions=0, conversions_value=0.0):
    return _ns({
        "search_term_view": {"search_term": termino, "status": estado},
        "campaign": {"id": campaign_id},
        "ad_group": {"id": ad_group_id},
        "metrics": {
            "cost_micros": cost_micros, "impressions": impressions, "clicks": clicks,
            "conversions": conversions, "conversions_value": conversions_value,
        },
    })


def fila_conversion_action(id_=1, nombre="Compra", estado="ENABLED", tipo="PURCHASE"):
    return _ns({"conversion_action": {"id": id_, "name": nombre, "status": estado, "type_": tipo}})


def fila_shopping(product_item_id="SKU-1", product_title="Producto de prueba",
                   cost_micros=10_000_000, impressions=100, clicks=2, conversions=1,
                   conversions_value=200.0):
    return _ns({
        "segments": {"product_item_id": product_item_id, "product_title": product_title},
        "metrics": {
            "cost_micros": cost_micros, "impressions": impressions, "clicks": clicks,
            "conversions": conversions, "conversions_value": conversions_value,
        },
    })


def fila_asset_group(asset_group_id=1, nombre="ASSET_GROUP_TEST", estado="ENABLED",
                      campaign_id=1, campaign_nombre="CAMPANA_PMAX"):
    return _ns({
        "asset_group": {"id": asset_group_id, "name": nombre, "status": estado},
        "campaign": {"id": campaign_id, "name": campaign_nombre},
    })


def fila_cambio(change_date_time="2026-07-06 10:00:00", tipo_recurso="AD_GROUP",
                 tipo_cliente="GOOGLE_ADS_WEB_CLIENT", usuario="mica@zasdigital.com",
                 operacion="UPDATE"):
    return _ns({
        "change_event": {
            "change_date_time": change_date_time, "change_resource_type": tipo_recurso,
            "client_type": tipo_cliente, "user_email": usuario,
            "resource_change_operation": operacion,
        },
    })


def fila_recomendacion(resource_name="customers/1/recommendations/1", tipo="KEYWORD",
                        campaign="customers/1/campaigns/1", costo_actual_micros=100_000_000,
                        costo_potencial_micros=120_000_000):
    return _ns({
        "recommendation": {
            "resource_name": resource_name, "type_": tipo, "campaign": campaign,
            "impact": {
                "base_metrics": {"cost_micros": costo_actual_micros},
                "potential_metrics": {"cost_micros": costo_potencial_micros},
            },
        },
    })
