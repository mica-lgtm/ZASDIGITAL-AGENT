import diagnostico


def test_keywords_candidatas_a_pausar_filtra_por_quality_score_y_conversiones():
    keywords = [
        {"criterion_id": 1, "quality_score": 2, "spend": 100.0, "conversiones": 0},
        {"criterion_id": 2, "quality_score": 8, "spend": 100.0, "conversiones": 0},
        {"criterion_id": 3, "quality_score": 2, "spend": 0.0, "conversiones": 0},
        {"criterion_id": 4, "quality_score": 2, "spend": 100.0, "conversiones": 3},
        {"criterion_id": 5, "quality_score": None, "spend": 100.0, "conversiones": 0},
    ]
    resultado = diagnostico.keywords_candidatas_a_pausar(keywords)
    assert [k["criterion_id"] for k in resultado] == [1]


def test_search_terms_candidatos_a_negativa_excluye_ya_negadas():
    search_terms = [
        {"termino": "ropa interior gratis", "spend": 6000, "conversiones": 0},
        {"termino": "ropa interior online", "spend": 6000, "conversiones": 1},
        {"termino": "ropa interior barata", "spend": 100, "conversiones": 0},
        {"termino": "usado", "spend": 6000, "conversiones": 0},
    ]
    negativas = [{"texto": "usado"}]
    resultado = diagnostico.search_terms_candidatos_a_negativa(search_terms, negativas)
    assert [s["termino"] for s in resultado] == ["ropa interior gratis"]


def test_anuncios_desaprobados():
    anuncios = [
        {"ad_id": 1, "approval_status": "APPROVED"},
        {"ad_id": 2, "approval_status": "DISAPPROVED"},
    ]
    assert [a["ad_id"] for a in diagnostico.anuncios_desaprobados(anuncios)] == [2]


def test_campanas_con_presupuesto_limitante():
    campanas = [
        {"campaign_id": 1, "is_perdido_presupuesto": 0.4, "roas": 3.0},
        {"campaign_id": 2, "is_perdido_presupuesto": 0.1, "roas": 3.0},
        {"campaign_id": 3, "is_perdido_presupuesto": 0.5, "roas": 0.5},
        {"campaign_id": 4, "is_perdido_presupuesto": None, "roas": 3.0},
    ]
    assert [c["campaign_id"] for c in diagnostico.campanas_con_presupuesto_limitante(campanas)] == [1]


def test_campanas_con_pacing_acelerado():
    pacing = [
        {"campaign_id": 1, "pct_consumido": 90.0},
        {"campaign_id": 2, "pct_consumido": 40.0},
    ]
    resultado = diagnostico.campanas_con_pacing_acelerado(pacing, hora_fraccion_dia=0.5)
    assert [p["campaign_id"] for p in resultado] == [1]


def test_anomalias_de_cpc_detecta_suba():
    hoy = [{"campaign_id": 1, "nombre": "X", "spend": 300.0, "clics": 10}]
    baseline = [{"campaign_id": 1, "nombre": "X", "spend": 100.0, "clics": 10}]
    resultado = diagnostico.anomalias_de_cpc(hoy, baseline)
    assert resultado[0]["cpc_hoy"] == 30.0
    assert resultado[0]["cpc_base"] == 10.0


def test_anomalias_de_cpc_ignora_sin_clics():
    hoy = [{"campaign_id": 1, "nombre": "X", "spend": 300.0, "clics": 0}]
    baseline = [{"campaign_id": 1, "nombre": "X", "spend": 100.0, "clics": 10}]
    assert diagnostico.anomalias_de_cpc(hoy, baseline) == []


def test_campanas_concentran_el_gasto_detecta_concentracion():
    campanas = [
        {"campaign_id": 1, "nombre": "A", "spend": 950.0},
        {"campaign_id": 2, "nombre": "B", "spend": 50.0},
    ]
    resultado = diagnostico.campanas_concentran_el_gasto(campanas)
    assert resultado["campaign_id"] == 1
    assert resultado["pct_del_gasto"] == 95.0


def test_campanas_concentran_el_gasto_none_si_repartido():
    campanas = [
        {"campaign_id": 1, "nombre": "A", "spend": 500.0},
        {"campaign_id": 2, "nombre": "B", "spend": 500.0},
    ]
    assert diagnostico.campanas_concentran_el_gasto(campanas) is None


def test_dias_desde():
    assert diagnostico.dias_desde("2026-07-01", "2026-07-07") == 6
