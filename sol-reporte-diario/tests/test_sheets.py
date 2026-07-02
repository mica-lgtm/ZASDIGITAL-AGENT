import sheets


class HojaFake:
    def __init__(self, filas=None):
        self._filas = filas or []
        self.appended = []

    def get_all_records(self):
        return self._filas

    def append_rows(self, valores, value_input_option=None):
        self.appended.extend(valores)


class PlanillaFake:
    def __init__(self, hojas):
        self._hojas = hojas

    def worksheet(self, nombre):
        return self._hojas[nombre]


def test_leer_filas():
    hoja = HojaFake(filas=[{"marca": "Piloto", "meta_ads": "x"}])
    planilla = PlanillaFake({"Roster": hoja})
    assert sheets.leer_filas(planilla, "Roster") == [{"marca": "Piloto", "meta_ads": "x"}]


def test_escribir_filas_respeta_orden_de_columnas_y_none_como_vacio():
    hoja = HojaFake()
    planilla = PlanillaFake({"Datos Diarios": hoja})
    filas = [{"fecha": "2026-06-01", "marca": "piloto", "canal": "tienda_nube", "spend": None, "ingresos": 400.0}]

    sheets.escribir_filas(planilla, "Datos Diarios", filas, columnas=["fecha", "marca", "canal", "spend", "ingresos"])

    assert hoja.appended == [["2026-06-01", "piloto", "tienda_nube", "", 400.0]]


def test_escribir_filas_no_hace_nada_si_no_hay_filas():
    hoja = HojaFake()
    planilla = PlanillaFake({"Datos Diarios": hoja})
    sheets.escribir_filas(planilla, "Datos Diarios", [], columnas=["fecha"])
    assert hoja.appended == []
