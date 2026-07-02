import roster


class HojaFake:
    def __init__(self, filas):
        self._filas = filas

    def get_all_records(self):
        return self._filas


class PlanillaFake:
    def __init__(self, hojas):
        self._hojas = hojas

    def worksheet(self, nombre):
        return self._hojas[nombre]


def test_leer_roster_normaliza_marca_y_filtra_canales_activos():
    hoja = HojaFake([
        {"marca": "Mini Ánima", "meta_ads": "x", "google_ads": "", "tienda_nube": "x"},
        {"marca": "", "meta_ads": "x"},  # fila sin marca: se ignora
    ])
    planilla = PlanillaFake({"Roster": hoja})

    resultado = roster.leer_roster(planilla, hoja="Roster")

    assert len(resultado) == 1
    assert resultado[0]["marca"] == "mini_anima"
    assert resultado[0]["marca_original"] == "Mini Ánima"
    assert resultado[0]["canales_activos"] == ["meta_ads", "tienda_nube"]


def test_normalizar_marca():
    assert roster.normalizar_marca("Mini Ánima") == "mini_anima"
    assert roster.normalizar_marca("Simona Shop") == "simona_shop"
