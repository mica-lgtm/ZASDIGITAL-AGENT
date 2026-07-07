"""Heurísticas mecánicas y documentadas (ver `conocimiento/diagnosticos-y-senales.md`)
que traducen reportes normalizados de `ads/reportes.py` en candidatos a
propuesta o alertas. Esto es el primer nivel de detección automática para
las rutinas programadas -- NO reemplaza el criterio de Ada en modo
interactivo para decisiones de copy, creativo o estrategia de campaña
nueva (eso vive en la sesión donde Ada lee `cuentas/<marca>.md` y
`conocimiento/` con Mica)."""

UMBRAL_QUALITY_SCORE_BAJO = 3
UMBRAL_SPEND_SEARCH_TERM_SIN_CONVERSION = 5000
UMBRAL_IS_PERDIDO_PRESUPUESTO = 0.3
FACTOR_ANOMALIA_CPC = 1.5
FACTOR_PACING_ACELERADO = 1.5
UMBRAL_CONCENTRACION_GASTO = 0.9


def keywords_candidatas_a_pausar(keywords):
    return [
        k for k in keywords
        if k["quality_score"] is not None and k["quality_score"] <= UMBRAL_QUALITY_SCORE_BAJO
        and k["spend"] > 0 and k["conversiones"] == 0
    ]


def search_terms_candidatos_a_negativa(search_terms, negativas_existentes=None):
    negativas_existentes = negativas_existentes or []
    textos_negados = {n["texto"].lower() for n in negativas_existentes}
    return [
        s for s in search_terms
        if s["spend"] >= UMBRAL_SPEND_SEARCH_TERM_SIN_CONVERSION and s["conversiones"] == 0
        and s["termino"].lower() not in textos_negados
    ]


def anuncios_desaprobados(anuncios):
    return [a for a in anuncios if a["approval_status"] == "DISAPPROVED"]


def campanas_con_presupuesto_limitante(campanas):
    return [
        c for c in campanas
        if c.get("is_perdido_presupuesto") is not None
        and c["is_perdido_presupuesto"] >= UMBRAL_IS_PERDIDO_PRESUPUESTO
        and c.get("roas") is not None and c["roas"] >= 1.0
    ]


def campanas_con_pacing_acelerado(pacing, hora_fraccion_dia, factor=FACTOR_PACING_ACELERADO):
    """hora_fraccion_dia: 0.0-1.0, qué fracción del día ya transcurrió (hora
    Argentina). Si el % de presupuesto consumido supera bastante esa
    fracción, hay riesgo de agotar el presupuesto antes de que termine el
    día."""
    return [
        p for p in pacing
        if p.get("pct_consumido") is not None and p["pct_consumido"] / 100 > hora_fraccion_dia * factor
    ]


def anomalias_de_cpc(campanas_hoy, campanas_baseline, factor=FACTOR_ANOMALIA_CPC):
    baseline_por_id = {c["campaign_id"]: c for c in campanas_baseline}
    anomalas = []
    for c in campanas_hoy:
        base = baseline_por_id.get(c["campaign_id"])
        if not base or not base["clics"] or not c["clics"]:
            continue
        cpc_hoy = c["spend"] / c["clics"]
        cpc_base = base["spend"] / base["clics"]
        if cpc_base > 0 and cpc_hoy > cpc_base * factor:
            anomalas.append({
                "campaign_id": c["campaign_id"], "nombre": c["nombre"],
                "cpc_hoy": round(cpc_hoy, 2), "cpc_base": round(cpc_base, 2),
            })
    return anomalas


def campanas_concentran_el_gasto(campanas, umbral=UMBRAL_CONCENTRACION_GASTO):
    """Si una sola campaña activa concentra más del umbral del gasto total,
    es una señal estratégica (falta de diversificación) para la rutina
    semanal, no un ajuste táctico."""
    activas = [c for c in campanas if c["spend"] > 0]
    if len(activas) < 2:
        return None
    total = sum(c["spend"] for c in activas)
    if not total:
        return None
    mayor = max(activas, key=lambda c: c["spend"])
    if mayor["spend"] / total >= umbral:
        return {"campaign_id": mayor["campaign_id"], "nombre": mayor["nombre"], "pct_del_gasto": round(mayor["spend"] / total * 100, 1)}
    return None


def dias_desde(fecha_iso, hoy_iso):
    from datetime import date

    f = date.fromisoformat(fecha_iso)
    h = date.fromisoformat(hoy_iso)
    return (h - f).days
