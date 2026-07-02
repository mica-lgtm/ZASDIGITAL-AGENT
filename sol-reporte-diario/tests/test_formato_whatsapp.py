from formato_whatsapp import formatear_mensaje


def test_formatear_mensaje_incluye_rollups_y_errores():
    reporte_dia = {
        "fecha": "2026-07-01",
        "filas": [],
        "rollups_por_marca": {
            "mini_anima": {"spend": 12500.0, "ingresos": 187500.0, "conversiones": 14, "roas": 15.0},
            "simona_shop": {"spend": 8200.0, "ingresos": 51660.0, "conversiones": 9, "roas": 6.3},
        },
        "rollup_total": {"spend": 20700.0, "ingresos": 239160.0, "conversiones": 23, "roas": 11.56},
        "errores": [{"marca": "zoe_tienda", "canal": "pinterest_ads", "error": "token vencido"}],
    }

    mensaje = formatear_mensaje(reporte_dia, sheet_url="https://sheet.example/x")

    assert "Mini Anima" in mensaje
    assert "ROAS 15.0x" in mensaje
    assert "⚠️ pinterest_ads (Zoe Tienda)" in mensaje
    assert "https://sheet.example/x" in mensaje


def test_formatear_mensaje_sin_errores_ni_roas():
    reporte_dia = {
        "fecha": "2026-07-01",
        "filas": [],
        "rollups_por_marca": {"piloto": {"spend": 0.0, "ingresos": 0.0, "conversiones": 0, "roas": None}},
        "rollup_total": {"spend": 0.0, "ingresos": 0.0, "conversiones": 0, "roas": None},
        "errores": [],
    }

    mensaje = formatear_mensaje(reporte_dia)

    assert "ROAS s/d" in mensaje
    assert "⚠️" not in mensaje
