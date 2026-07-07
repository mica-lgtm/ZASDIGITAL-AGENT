from formato_whatsapp import (
    formatear_resumen_manana,
    formatear_resumen_semanal,
    formatear_resumen_tarde,
)


def _reporte_base():
    return {
        "fecha": "2026-07-07",
        "rollups_por_marca": {
            "piloto": {"spend": 12500.0, "conversiones": 14, "roas": 6.3},
        },
        "propuestas": [{"id": "ADA-PILOTO-20260707-001", "marca": "piloto", "tipo": "pausar_keyword"}],
        "alertas": [{"marca": "piloto", "mensaje": "anuncio desaprobado"}],
        "bloqueos": [],
        "errores": [],
    }


def test_formatear_resumen_manana_incluye_rollup_y_propuestas():
    mensaje = formatear_resumen_manana(_reporte_base(), reporte_url="https://x/reporte.md")
    assert "Piloto" in mensaje
    assert "ROAS 6.3x" in mensaje
    assert "1 propuesta" in mensaje
    assert "⚠️ Piloto: anuncio desaprobado" in mensaje
    assert "https://x/reporte.md" in mensaje


def test_formatear_resumen_manana_sin_roas():
    reporte = _reporte_base()
    reporte["rollups_por_marca"]["piloto"]["roas"] = None
    mensaje = formatear_resumen_manana(reporte)
    assert "ROAS s/d" in mensaje


def test_formatear_resumen_tarde_incluye_pendientes_y_activar():
    reporte = _reporte_base()
    reporte["pendientes_aging"] = [{"id": "ADA-PILOTO-20260706-002", "marca": "piloto", "dias": 2}]
    reporte["esperando_activar"] = [{"id": "ADA-PILOTO-20260705-001", "marca": "piloto", "campana": "X"}]
    mensaje = formatear_resumen_tarde(reporte)
    assert "1 propuesta(s) sin aprobar" in mensaje
    assert "la más vieja: 2 día(s)" in mensaje
    assert "1 campaña(s) SUBIDA PAUSADA" in mensaje


def test_formatear_resumen_semanal_incluye_actionables_y_nuevas_campanas():
    reporte = _reporte_base()
    reporte["actionables"] = [{"marca": "piloto", "texto": "subir presupuesto de Search 15%"}]
    reporte["propuestas_nueva_campana"] = [{"id": "ADA-PILOTO-20260707-002", "marca": "piloto"}]
    mensaje = formatear_resumen_semanal(reporte)
    assert "subir presupuesto de Search 15%" in mensaje
    assert "1 propuesta(s) de campaña nueva" in mensaje
