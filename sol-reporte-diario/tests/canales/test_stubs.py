import pytest

from canales import meli_ads, meta_organico, perfit, pinterest_ads, tiktok_ads

STUBS = [meli_ads, meta_organico, perfit, pinterest_ads, tiktok_ads]


@pytest.mark.parametrize("modulo", STUBS)
def test_stub_levanta_not_implemented(modulo):
    with pytest.raises(NotImplementedError):
        modulo.stats_dia("piloto", "2026-06-01")
