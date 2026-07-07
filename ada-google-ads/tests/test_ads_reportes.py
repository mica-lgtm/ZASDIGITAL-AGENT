from ads import reportes
from tests.fixtures import gaql_rows as filas


class _ClienteFalso:
    """Fake de GoogleAdsQueryClient: buscar() ignora el query y devuelve las
    filas pre-armadas, para poder testear los normalizadores sin gRPC."""

    def __init__(self, filas_a_devolver):
        self._filas = filas_a_devolver
        self.llamadas = []

    def buscar(self, customer_id, query):
        self.llamadas.append((customer_id, query))
        return self._filas


def test_reporte_campanas_normaliza_spend_ctr_cpa_roas():
    fila = filas.fila_campana(cost_micros=100_500_000, impressions=1000, clicks=20, ctr=0.02,
                               conversions=5, conversions_value=750.0)
    cliente = _ClienteFalso([fila])

    resultado = reportes.reporte_campanas(cliente, "111", "2026-07-01", "2026-07-07")

    assert len(resultado) == 1
    c = resultado[0]
    assert c["spend"] == 100.5
    assert c["ctr"] == 2.0
    assert c["cpa"] == 20.1
    assert c["roas"] == round(750 / 100.5, 2)
    assert "2026-07-01" in cliente.llamadas[0][1]
    assert "2026-07-07" in cliente.llamadas[0][1]


def test_reporte_campanas_sin_conversiones_da_cpa_y_roas_none():
    fila = filas.fila_campana(cost_micros=0, conversions=0, conversions_value=0.0)
    resultado = reportes.reporte_campanas(_ClienteFalso([fila]), "111", "2026-07-01", "2026-07-07")
    assert resultado[0]["cpa"] is None
    assert resultado[0]["roas"] is None


def test_reporte_presupuestos_normaliza_monto_diario():
    fila = filas.fila_presupuesto(amount_micros=16_500_000_000)
    resultado = reportes.reporte_presupuestos(_ClienteFalso([fila]), "111")
    assert resultado[0]["monto_diario"] == 16500.0


def test_reporte_pacing_hoy_calcula_pct_consumido():
    fila = filas.fila_pacing(amount_micros=16_500_000_000, cost_micros=8_000_000_000)
    resultado = reportes.reporte_pacing_hoy(_ClienteFalso([fila]), "111", "2026-07-07")
    assert resultado[0]["monto_diario"] == 16500.0
    assert resultado[0]["spend_hoy"] == 8000.0
    assert resultado[0]["pct_consumido"] == round(8000 / 16500 * 100, 1)


def test_reporte_grupos_de_anuncios():
    fila = filas.fila_grupo(cost_micros=50_000_000, conversions=2, conversions_value=300.0)
    resultado = reportes.reporte_grupos_de_anuncios(_ClienteFalso([fila]), "111", "2026-07-01", "2026-07-07")
    assert resultado[0]["spend"] == 50.0
    assert resultado[0]["cpa"] == 25.0
    assert resultado[0]["roas"] == 6.0


def test_reporte_anuncios_incluye_estado_de_aprobacion():
    fila = filas.fila_anuncio(estado="PAUSED", approval_status="DISAPPROVED")
    resultado = reportes.reporte_anuncios(_ClienteFalso([fila]), "111", "2026-07-01", "2026-07-07")
    assert resultado[0]["estado"] == "PAUSED"
    assert resultado[0]["approval_status"] == "DISAPPROVED"


def test_reporte_activos_rsa_incluye_performance_label():
    fila = filas.fila_activo_rsa(performance_label="LOW", texto="20% off")
    resultado = reportes.reporte_activos_rsa(_ClienteFalso([fila]), "111", "2026-07-01", "2026-07-07")
    assert resultado[0]["performance_label"] == "LOW"
    assert resultado[0]["texto"] == "20% off"


def test_reporte_keywords_incluye_quality_score():
    fila = filas.fila_keyword(quality_score=3, texto="ropa interior gratis")
    resultado = reportes.reporte_keywords(_ClienteFalso([fila]), "111", "2026-07-01", "2026-07-07")
    assert resultado[0]["quality_score"] == 3
    assert resultado[0]["texto"] == "ropa interior gratis"


def test_reporte_negativas():
    fila = filas.fila_negativa(texto="usado")
    resultado = reportes.reporte_negativas(_ClienteFalso([fila]), "111")
    assert resultado[0]["texto"] == "usado"


def test_reporte_search_terms():
    fila = filas.fila_search_term(termino="ropa interior talle grande")
    resultado = reportes.reporte_search_terms(_ClienteFalso([fila]), "111", "2026-07-01", "2026-07-07")
    assert resultado[0]["termino"] == "ropa interior talle grande"


def test_reporte_conversion_actions():
    fila = filas.fila_conversion_action(nombre="Compra", estado="ENABLED")
    resultado = reportes.reporte_conversion_actions(_ClienteFalso([fila]), "111")
    assert resultado[0]["nombre"] == "Compra"
    assert resultado[0]["estado"] == "ENABLED"


def test_reporte_shopping():
    fila = filas.fila_shopping(product_title="Conjunto de encaje")
    resultado = reportes.reporte_shopping(_ClienteFalso([fila]), "111", "2026-07-01", "2026-07-07")
    assert resultado[0]["product_title"] == "Conjunto de encaje"


def test_reporte_asset_groups():
    fila = filas.fila_asset_group(nombre="PMAX_INVIERNO")
    resultado = reportes.reporte_asset_groups(_ClienteFalso([fila]), "111")
    assert resultado[0]["nombre"] == "PMAX_INVIERNO"


def test_reporte_cambios_recientes():
    fila = filas.fila_cambio(usuario="mica@zasdigital.com", operacion="UPDATE")
    resultado = reportes.reporte_cambios_recientes(_ClienteFalso([fila]), "111", "2026-07-01T00:00:00Z", "2026-07-07T23:59:59Z")
    assert resultado[0]["usuario"] == "mica@zasdigital.com"
    assert resultado[0]["operacion"] == "UPDATE"


def test_reporte_recomendaciones():
    fila = filas.fila_recomendacion(tipo="KEYWORD", costo_potencial_micros=200_000_000)
    resultado = reportes.reporte_recomendaciones(_ClienteFalso([fila]), "111")
    assert resultado[0]["tipo"] == "KEYWORD"
    assert resultado[0]["costo_potencial"] == 200.0
