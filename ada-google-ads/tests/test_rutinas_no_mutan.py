"""Garantía crítica (ver CLAUDE.md, "Puerta de aprobación"): las tres
rutinas programadas -- y los módulos de lectura que usan -- nunca importan
ni llaman `ads/mutate.py`. Dos capas: (1) análisis estático del árbol de
sintaxis (nadie escribe `import ads.mutate` ni `from ads import mutate`),
(2) runtime: se monkeypatchea cada función de `ads/mutate.py` para que
explote si se llama, y se corre cada rutina de punta a punta contra clientes
100% fake -- si algo intentara mutar, el test fallaría con el error
inyectado, no con un error de red."""

import ast
import os

import pytest

MODULOS_QUE_NUNCA_DEBEN_IMPORTAR_MUTATE = [
    "orquestador_manana.py",
    "orquestador_tarde.py",
    "orquestador_semanal.py",
    "motor.py",
    "diagnostico.py",
    "roster_ada.py",
    os.path.join("ads", "reportes.py"),
    os.path.join("ads", "client.py"),
]

_BASE = os.path.dirname(os.path.dirname(__file__))


def _importa_ads_mutate(ruta):
    with open(ruta, encoding="utf-8") as f:
        arbol = ast.parse(f.read(), filename=ruta)

    for nodo in ast.walk(arbol):
        if isinstance(nodo, ast.Import):
            for alias in nodo.names:
                if alias.name in ("ads.mutate", "mutate"):
                    return True
        elif isinstance(nodo, ast.ImportFrom):
            modulo = nodo.module or ""
            if modulo in ("ads", "ads.mutate") and any(a.name == "mutate" for a in nodo.names):
                return True
            if modulo == "ads.mutate":
                return True
    return False


@pytest.mark.parametrize("archivo", MODULOS_QUE_NUNCA_DEBEN_IMPORTAR_MUTATE)
def test_estatico_no_importa_ads_mutate(archivo):
    ruta = os.path.join(_BASE, archivo)
    assert not _importa_ads_mutate(ruta), f"{archivo} no debería importar ads/mutate.py"


def test_aplicar_propuesta_es_el_unico_que_importa_ads_mutate():
    ruta = os.path.join(_BASE, "aplicar_propuesta.py")
    assert _importa_ads_mutate(ruta)


def _reventar_si_se_llama(*args, **kwargs):
    raise AssertionError("ads/mutate.py fue invocado desde una rutina programada -- violación de la puerta de aprobación")


@pytest.fixture(autouse=True)
def _mutate_explota_si_se_llama(monkeypatch):
    import ads.mutate as ads_mutate

    for nombre in ("ejecutar", "activar_campana", "construir_operaciones", "cliente_mutate_desde_env"):
        monkeypatch.setattr(ads_mutate, nombre, _reventar_si_se_llama)
    yield


def test_runtime_rutina_manana_no_muta(monkeypatch, tmp_path):
    import orquestador_manana
    import propuestas
    import reportes_md
    import roster_ada
    from tests.fixtures import gaql_rows as filas
    from tests.test_motor import _ClienteMultiFalso

    monkeypatch.setattr(propuestas, "_PROPUESTAS_DIR", str(tmp_path / "propuestas"))
    monkeypatch.setattr(propuestas, "_INDICE", str(tmp_path / "propuestas" / "indice-propuestas.md"))
    monkeypatch.setattr(reportes_md, "_BASE", str(tmp_path))
    monkeypatch.setattr(roster_ada, "cliente_sheets", lambda env=None: object())
    monkeypatch.setattr(roster_ada, "abrir_planilla", lambda gc, sid: object())
    monkeypatch.setattr(
        roster_ada, "marcas_google_ads_activas",
        lambda *a, **k: [{"marca": "simona", "marca_original": "Simona", "canales_activos": ["google_ads"]}],
    )

    cliente = _ClienteMultiFalso(
        campaign=[filas.fila_campana(conversions=0, conversions_value=0.0)],
        keyword_view=[filas.fila_keyword(quality_score=2, conversions=0)],
        ad_group_ad=[filas.fila_anuncio(approval_status="DISAPPROVED")],
        search_term_view=[filas.fila_search_term(cost_micros=6_000_000_000, conversions=0)],
        campaign_criterion=[],
    )
    monkeypatch.setattr(orquestador_manana, "cliente_desde_env", lambda env: cliente)
    monkeypatch.setattr(orquestador_manana, "customer_id_de_marca", lambda marca, env=None: "1112223333")

    args = orquestador_manana.parse_args(["--fecha", "2026-07-07", "--sin-whatsapp"])
    reporte = orquestador_manana.run(args, env={"ADA_SHEETS_SPREADSHEET_ID": "x"})

    assert len(reporte["propuestas"]) > 0  # generó propuestas de verdad, y aun así no mutó nada


def test_runtime_rutina_tarde_no_muta(monkeypatch, tmp_path):
    import orquestador_tarde
    import propuestas
    import reportes_md
    import roster_ada
    from tests.fixtures import gaql_rows as filas
    from tests.test_motor import _ClienteMultiFalso

    monkeypatch.setattr(propuestas, "_PROPUESTAS_DIR", str(tmp_path / "propuestas"))
    monkeypatch.setattr(propuestas, "_INDICE", str(tmp_path / "propuestas" / "indice-propuestas.md"))
    monkeypatch.setattr(reportes_md, "_BASE", str(tmp_path))
    monkeypatch.setattr(roster_ada, "cliente_sheets", lambda env=None: object())
    monkeypatch.setattr(roster_ada, "abrir_planilla", lambda gc, sid: object())
    monkeypatch.setattr(
        roster_ada, "marcas_google_ads_activas",
        lambda *a, **k: [{"marca": "simona", "marca_original": "Simona", "canales_activos": ["google_ads"]}],
    )

    cliente = _ClienteMultiFalso(
        campaign=[filas.fila_campana()],
        pacing=[filas.fila_pacing(amount_micros=16_500_000_000, cost_micros=15_000_000_000)],
        ad_group_ad=[filas.fila_anuncio(approval_status="DISAPPROVED")],
    )
    monkeypatch.setattr(orquestador_tarde, "cliente_desde_env", lambda env: cliente)
    monkeypatch.setattr(orquestador_tarde, "customer_id_de_marca", lambda marca, env=None: "1112223333")

    args = orquestador_tarde.parse_args(["--fecha", "2026-07-07", "--sin-whatsapp"])
    reporte = orquestador_tarde.run(args, env={"ADA_SHEETS_SPREADSHEET_ID": "x"})

    assert len(reporte["alertas"]) > 0


def test_runtime_rutina_semanal_no_muta(monkeypatch, tmp_path):
    import orquestador_semanal
    import propuestas
    import reportes_md
    import roster_ada
    from tests.fixtures import gaql_rows as filas
    from tests.test_motor import _ClienteMultiFalso

    monkeypatch.setattr(propuestas, "_PROPUESTAS_DIR", str(tmp_path / "propuestas"))
    monkeypatch.setattr(propuestas, "_INDICE", str(tmp_path / "propuestas" / "indice-propuestas.md"))
    monkeypatch.setattr(reportes_md, "_BASE", str(tmp_path))
    monkeypatch.setattr(orquestador_semanal, "_registrar_pendientes", lambda *a, **k: None)
    monkeypatch.setattr(roster_ada, "cliente_sheets", lambda env=None: object())
    monkeypatch.setattr(roster_ada, "abrir_planilla", lambda gc, sid: object())
    monkeypatch.setattr(
        roster_ada, "marcas_google_ads_activas",
        lambda *a, **k: [{"marca": "simona", "marca_original": "Simona", "canales_activos": ["google_ads"]}],
    )

    cliente = _ClienteMultiFalso(
        campaign=[
            filas.fila_campana(campaign_id=1, nombre="A", cost_micros=950_000_000),
            filas.fila_campana(campaign_id=2, nombre="B", cost_micros=50_000_000),
        ],
    )
    monkeypatch.setattr(orquestador_semanal, "cliente_desde_env", lambda env: cliente)
    monkeypatch.setattr(orquestador_semanal, "customer_id_de_marca", lambda marca, env=None: "1112223333")

    args = orquestador_semanal.parse_args(["--fecha", "2026-07-05", "--sin-whatsapp"])
    reporte = orquestador_semanal.run(args, env={"ADA_SHEETS_SPREADSHEET_ID": "x"})

    assert len(reporte["actionables"]) > 0
