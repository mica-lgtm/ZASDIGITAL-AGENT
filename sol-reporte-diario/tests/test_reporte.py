import reporte


def _roster(canales_activos, marca="piloto"):
    return [{"marca": marca, "marca_original": marca.title(), "canales_activos": canales_activos}]


def test_generar_reporte_agrega_y_calcula_rollups(monkeypatch):
    def fake_meta(marca, fecha):
        return {"canal": "meta_ads", "marca": marca, "fecha": fecha, "spend": 100.0,
                "impresiones": 1000, "clics": 10, "ctr": 1.0, "conversiones": 5,
                "ingresos": 500.0, "cpa": 20.0, "roas": 5.0}

    def fake_tn(marca, fecha):
        return {"canal": "tienda_nube", "marca": marca, "fecha": fecha, "spend": None,
                "impresiones": None, "clics": None, "ctr": None, "conversiones": 3,
                "ingresos": 300.0, "cpa": None, "roas": None}

    monkeypatch.setitem(reporte.CANALES, "meta_ads", fake_meta)
    monkeypatch.setitem(reporte.CANALES, "tienda_nube", fake_tn)

    resultado = reporte.generar_reporte("2026-06-01", _roster(["meta_ads", "tienda_nube"]))

    assert len(resultado["filas"]) == 2
    assert resultado["errores"] == []
    r = resultado["rollups_por_marca"]["piloto"]
    assert r["spend"] == 100.0
    assert r["ingresos"] == 800.0
    assert r["conversiones"] == 8
    assert r["roas"] == 8.0
    assert resultado["rollup_total"]["spend"] == 100.0


def test_generar_reporte_falla_parcial_no_tumba_el_resto(monkeypatch):
    def fake_ok(marca, fecha):
        return {"canal": "meta_ads", "marca": marca, "fecha": fecha, "spend": 50.0,
                "impresiones": 0, "clics": 0, "ctr": 0, "conversiones": 1,
                "ingresos": 50.0, "cpa": 50.0, "roas": 1.0}

    def fake_falla(marca, fecha):
        raise RuntimeError("token vencido")

    monkeypatch.setitem(reporte.CANALES, "meta_ads", fake_ok)
    monkeypatch.setitem(reporte.CANALES, "pinterest_ads", fake_falla)

    resultado = reporte.generar_reporte("2026-06-01", _roster(["meta_ads", "pinterest_ads"]))

    assert len(resultado["filas"]) == 1
    assert len(resultado["errores"]) == 1
    assert resultado["errores"][0]["canal"] == "pinterest_ads"
    assert "token vencido" in resultado["errores"][0]["error"]


def test_generar_reporte_respeta_filtro_de_canales(monkeypatch):
    llamadas = []

    def fake(marca, fecha):
        llamadas.append(marca)
        return {"canal": "meta_ads", "marca": marca, "fecha": fecha, "spend": 1.0,
                "impresiones": 0, "clics": 0, "ctr": 0, "conversiones": 0,
                "ingresos": 0.0, "cpa": None, "roas": None}

    monkeypatch.setitem(reporte.CANALES, "meta_ads", fake)

    resultado = reporte.generar_reporte(
        "2026-06-01", _roster(["meta_ads", "tienda_nube"]), canales=["meta_ads"]
    )

    assert len(resultado["filas"]) == 1
    assert llamadas == ["piloto"]


def test_generar_reporte_canal_no_registrado_queda_como_error():
    resultado = reporte.generar_reporte("2026-06-01", _roster(["canal_inexistente"]))
    assert resultado["filas"] == []
    assert resultado["errores"] == [
        {"marca": "piloto", "canal": "canal_inexistente", "error": "canal desconocido"}
    ]
