import pytest

from ads import client as ads_client


def _env():
    return {
        "ADA_GOOGLE_ADS_DEVELOPER_TOKEN": "dev-tok",
        "ADA_GOOGLE_ADS_CLIENT_ID": "client-id",
        "ADA_GOOGLE_ADS_CLIENT_SECRET": "client-secret",
        "ADA_GOOGLE_ADS_REFRESH_TOKEN": "refresh-tok",
        "ADA_GOOGLE_ADS_LOGIN_CUSTOMER_ID": "123-456-7890",
        "ADA_PILOTO_GOOGLE_ADS_CUSTOMER_ID": "111-222-3333",
    }


def test_credenciales_mcc_ok_y_quita_guiones_del_login_customer_id():
    creds = ads_client.credenciales_mcc(_env())
    assert creds["developer_token"] == "dev-tok"
    assert creds["client_id"] == "client-id"
    assert creds["client_secret"] == "client-secret"
    assert creds["refresh_token"] == "refresh-tok"
    assert creds["login_customer_id"] == "1234567890"


@pytest.mark.parametrize("clave_faltante", [
    "ADA_GOOGLE_ADS_DEVELOPER_TOKEN",
    "ADA_GOOGLE_ADS_CLIENT_ID",
    "ADA_GOOGLE_ADS_CLIENT_SECRET",
    "ADA_GOOGLE_ADS_REFRESH_TOKEN",
    "ADA_GOOGLE_ADS_LOGIN_CUSTOMER_ID",
])
def test_credenciales_mcc_falla_si_falta_alguna(clave_faltante):
    env = _env()
    del env[clave_faltante]
    with pytest.raises(ValueError):
        ads_client.credenciales_mcc(env)


def test_customer_id_de_marca_quita_guiones():
    assert ads_client.customer_id_de_marca("piloto", env=_env()) == "1112223333"


def test_customer_id_de_marca_falla_si_falta():
    env = _env()
    del env["ADA_PILOTO_GOOGLE_ADS_CUSTOMER_ID"]
    with pytest.raises(ValueError):
        ads_client.customer_id_de_marca("piloto", env=env)


class _ServicioFalso:
    def __init__(self, filas, customer_id_esperado=None, query_esperado=None):
        self._filas = filas
        self.customer_id_esperado = customer_id_esperado
        self.query_esperado = query_esperado
        self.llamado_con = None

    def search(self, customer_id, query):
        self.llamado_con = (customer_id, query)
        if self.customer_id_esperado is not None:
            assert customer_id == self.customer_id_esperado
        if self.query_esperado is not None:
            assert query == self.query_esperado
        return iter(self._filas)


class _ClienteInternoFalso:
    def __init__(self, filas, **kwargs):
        self._servicio = _ServicioFalso(filas, **kwargs)

    def get_service(self, nombre):
        assert nombre == "GoogleAdsService"
        return self._servicio


def _cliente_con_interno_falso(filas, **kwargs):
    wrapper = ads_client.GoogleAdsQueryClient.__new__(ads_client.GoogleAdsQueryClient)
    wrapper._client = _ClienteInternoFalso(filas, **kwargs)
    return wrapper


def test_buscar_devuelve_lista_materializada():
    wrapper = _cliente_con_interno_falso(["fila1", "fila2"], customer_id_esperado="111", query_esperado="SELECT 1")
    filas = wrapper.buscar("111", "SELECT 1")
    assert filas == ["fila1", "fila2"]


def test_buscar_envuelve_google_ads_exception():
    from google.ads.googleads.errors import GoogleAdsException

    class _ServicioQueFalla:
        def get_service(self, nombre):
            return self

        def search(self, customer_id, query):
            raise GoogleAdsException(None, None, None, None)

    wrapper = ads_client.GoogleAdsQueryClient.__new__(ads_client.GoogleAdsQueryClient)
    wrapper._client = _ServicioQueFalla()
    with pytest.raises(RuntimeError):
        wrapper.buscar("111", "SELECT 1")
