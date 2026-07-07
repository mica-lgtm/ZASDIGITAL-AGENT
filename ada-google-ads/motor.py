"""Motor compartido por las tres rutinas: recolecta reportes de
`ads/reportes.py` para una marca, aplica las heurísticas de `diagnostico.py`,
y arma propuestas (`propuestas.py`) + rollups. Lo que cambia entre
mañana/tarde/semanal es qué se recolecta y qué heurísticas se aplican, no el
mecanismo. Nunca importa `ads/mutate.py`."""

from ads import reportes as ads_reportes
import diagnostico
import propuestas


def rollup_de_campanas(campanas):
    spend = sum(c["spend"] for c in campanas)
    conversiones = sum(c["conversiones"] for c in campanas)
    ingresos = sum(c["ingresos"] for c in campanas)
    return {
        "spend": round(spend, 2),
        "conversiones": conversiones,
        "ingresos": round(ingresos, 2),
        "roas": round(ingresos / spend, 2) if spend else None,
    }


def _cuerpo_pausar_keyword(kw, marca, desde, hasta):
    return (
        f"## Diagnóstico\n"
        f"Keyword \"{kw['texto']}\" ({kw['match_type']}) con quality score {kw['quality_score']}/10, "
        f"gastó ${kw['spend']} sin conversiones en el período {desde} a {hasta}.\n\n"
        f"## Cambio propuesto\nPausar esta keyword (ad_group {kw['ad_group_id']}, campaña {kw['campaign_id']}).\n\n"
        f"## Impacto esperado\nDetiene gasto sin retorno; libera presupuesto para keywords con mejor quality score.\n\n"
        f"## Riesgo / reversibilidad\nBajo -- pausar es reversible, no borra la keyword.\n"
    )


def _cuerpo_nueva_negativa(st, marca, desde, hasta):
    return (
        f"## Diagnóstico\n"
        f"Search term \"{st['termino']}\" gastó ${st['spend']} sin conversiones en el período {desde} a {hasta} "
        f"(campaña {st['campaign_id']}, grupo {st['ad_group_id']}).\n\n"
        f"## Cambio propuesto\nAgregar \"{st['termino']}\" como negativa exacta a nivel campaña.\n\n"
        f"## Impacto esperado\nEvita seguir pagando clics de este término sin retorno.\n\n"
        f"## Riesgo / reversibilidad\nBajo -- revisar que el término no capture tráfico bueno relacionado antes de aprobar.\n"
    )


def _cuerpo_ajuste_presupuesto(camp, marca, desde, hasta):
    return (
        f"## Diagnóstico\n"
        f"Campaña \"{camp['nombre']}\" perdió {round(camp['is_perdido_presupuesto'] * 100, 1)}% de impression share "
        f"por presupuesto en el período {desde} a {hasta}, con ROAS {camp['roas']}.\n\n"
        f"## Cambio propuesto\nSubir el presupuesto diario de la campaña un 20% (revisar tope de la ficha de marca antes de aprobar).\n\n"
        f"## Impacto esperado\nMás impresiones/conversiones a un ROAS que ya viene siendo positivo.\n\n"
        f"## Riesgo / reversibilidad\nMedio -- si el ROAS cae al escalar, se puede revertir el presupuesto.\n"
    )


def procesar_marca_manana(cliente, marca, customer_id, desde, hasta, rutina="manana"):
    campanas = ads_reportes.reporte_campanas(cliente, customer_id, desde, hasta)
    keywords = ads_reportes.reporte_keywords(cliente, customer_id, desde, hasta)
    anuncios = ads_reportes.reporte_anuncios(cliente, customer_id, desde, hasta)
    search_terms = ads_reportes.reporte_search_terms(cliente, customer_id, desde, hasta)
    negativas = ads_reportes.reporte_negativas(cliente, customer_id)

    ids_propuestas = []
    alertas = []

    for kw in diagnostico.keywords_candidatas_a_pausar(keywords):
        id_p, _ = propuestas.crear_propuesta(
            marca=marca, tipo="pausar_keyword", customer_id=customer_id, rutina_origen=rutina,
            fecha=hasta, titulo=f"{marca} · Pausar keyword de bajo quality score",
            cuerpo_md=_cuerpo_pausar_keyword(kw, marca, desde, hasta),
            operaciones=[{"tipo": "ad_group_criterion_status", "criterion_id": kw["criterion_id"],
                          "ad_group_id": kw["ad_group_id"], "nuevo_estado": "PAUSED"}],
        )
        ids_propuestas.append(id_p)

    for st in diagnostico.search_terms_candidatos_a_negativa(search_terms, negativas):
        id_p, _ = propuestas.crear_propuesta(
            marca=marca, tipo="nueva_negativa", customer_id=customer_id, rutina_origen=rutina,
            fecha=hasta, titulo=f"{marca} · Agregar negativa: {st['termino']}",
            cuerpo_md=_cuerpo_nueva_negativa(st, marca, desde, hasta),
            operaciones=[{"tipo": "campaign_negative_keyword", "campaign_id": st["campaign_id"],
                          "texto": st["termino"], "match_type": "EXACT"}],
        )
        ids_propuestas.append(id_p)

    for camp in diagnostico.campanas_con_presupuesto_limitante(campanas):
        id_p, _ = propuestas.crear_propuesta(
            marca=marca, tipo="ajuste_presupuesto", customer_id=customer_id, rutina_origen=rutina,
            fecha=hasta, titulo=f"{marca} · Subir presupuesto de {camp['nombre']}",
            cuerpo_md=_cuerpo_ajuste_presupuesto(camp, marca, desde, hasta),
            operaciones=[{"tipo": "campaign_budget_amount", "budget_resource": camp["budget_resource"],
                          "ajuste_pct": 20}],
        )
        ids_propuestas.append(id_p)

    for ad in diagnostico.anuncios_desaprobados(anuncios):
        alertas.append({
            "marca": marca,
            "mensaje": f"Anuncio {ad['ad_id']} desaprobado ({ad['review_status']}) en {ad['campaign_nombre']}",
        })

    return {
        "marca": marca,
        "rollup": rollup_de_campanas(campanas),
        "propuestas": ids_propuestas,
        "alertas": alertas,
        "datos": {"campanas": campanas, "keywords": keywords, "anuncios": anuncios, "search_terms": search_terms},
    }


def procesar_marca_tarde(cliente, marca, customer_id, hoy, desde_baseline, hasta_baseline, rutina="tarde"):
    campanas_hoy = ads_reportes.reporte_campanas(cliente, customer_id, hoy, hoy)
    campanas_baseline = ads_reportes.reporte_campanas(cliente, customer_id, desde_baseline, hasta_baseline)
    pacing = ads_reportes.reporte_pacing_hoy(cliente, customer_id, hoy)
    anuncios_hoy = ads_reportes.reporte_anuncios(cliente, customer_id, hoy, hoy)

    from datetime import datetime, timedelta, timezone

    ARGENTINA = timezone(timedelta(hours=-3))
    hora_actual_argentina = datetime.now(ARGENTINA).hour
    fraccion_dia = min(max(hora_actual_argentina / 24, 0.01), 1.0)

    alertas = []
    ids_propuestas = []

    for c in diagnostico.campanas_con_pacing_acelerado(pacing, fraccion_dia):
        alertas.append({"marca": marca, "mensaje": f"Pacing acelerado en \"{c['nombre']}\": {c['pct_consumido']}% del presupuesto consumido"})

    for anomalia in diagnostico.anomalias_de_cpc(campanas_hoy, campanas_baseline):
        alertas.append({
            "marca": marca,
            "mensaje": f"CPC de \"{anomalia['nombre']}\" subió a ${anomalia['cpc_hoy']} (base ${anomalia['cpc_base']})",
        })

    for ad in diagnostico.anuncios_desaprobados(anuncios_hoy):
        alertas.append({"marca": marca, "mensaje": f"Anuncio {ad['ad_id']} desaprobado hoy en {ad['campaign_nombre']}"})

    return {
        "marca": marca,
        "rollup": rollup_de_campanas(campanas_hoy),
        "propuestas": ids_propuestas,
        "alertas": alertas,
        "datos": {"campanas_hoy": campanas_hoy, "pacing": pacing},
    }


def procesar_marca_semanal(cliente, marca, customer_id, desde, hasta, rutina="semanal"):
    campanas = ads_reportes.reporte_campanas(cliente, customer_id, desde, hasta)

    actionables = []
    concentracion = diagnostico.campanas_concentran_el_gasto(campanas)
    if concentracion:
        actionables.append({
            "marca": marca,
            "texto": f"\"{concentracion['nombre']}\" concentra {concentracion['pct_del_gasto']}% del gasto semanal -- evaluar diversificar en una campaña nueva (idea para definir en modo interactivo con Ada).",
        })

    for camp in diagnostico.campanas_con_presupuesto_limitante(campanas):
        actionables.append({
            "marca": marca,
            "texto": f"\"{camp['nombre']}\" viene perdiendo impression share por presupuesto con ROAS {camp['roas']} -- candidata a escalar.",
        })

    return {
        "marca": marca,
        "rollup": rollup_de_campanas(campanas),
        "actionables": actionables,
        "propuestas_nueva_campana": [],
        "datos": {"campanas": campanas},
    }
