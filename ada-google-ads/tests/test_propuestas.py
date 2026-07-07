import os

import pytest

import propuestas


@pytest.fixture(autouse=True)
def _aislar_propuestas(tmp_path, monkeypatch):
    monkeypatch.setattr(propuestas, "_PROPUESTAS_DIR", str(tmp_path))
    monkeypatch.setattr(propuestas, "_INDICE", str(tmp_path / "indice-propuestas.md"))
    yield


def _operaciones():
    return [{"tipo": "ad_group_criterion_status", "recurso": "customers/1/adGroupCriteria/1~2", "nuevo_estado": "PAUSED"}]


def test_generar_id_formato():
    assert propuestas.generar_id("piloto", "2026-07-07", 1) == "ADA-PILOTO-20260707-001"


def test_crear_propuesta_escribe_archivo_con_front_matter_y_operaciones():
    id_propuesta, ruta = propuestas.crear_propuesta(
        marca="piloto", tipo="pausar_keyword", customer_id="1112223333",
        rutina_origen="manana", fecha="2026-07-07",
        titulo="Piloto · Pausar keyword de bajo quality score",
        cuerpo_md="## Diagnóstico\nQuality score 2/10 hace 14 días.",
        operaciones=_operaciones(),
    )

    assert id_propuesta == "ADA-PILOTO-20260707-001"
    assert os.path.isfile(ruta)

    propuesta = propuestas.leer_propuesta(id_propuesta)
    assert propuesta["estado"] == "PROPUESTA"
    assert propuesta["marca"] == "piloto"
    assert propuesta["tipo"] == "pausar_keyword"
    assert propuesta["operaciones"] == _operaciones()
    assert "Quality score 2/10" in propuesta["_cuerpo"]


def test_crear_propuesta_rechaza_tipo_desconocido():
    with pytest.raises(ValueError):
        propuestas.crear_propuesta(
            marca="piloto", tipo="tipo_inventado", customer_id="1", rutina_origen="manana",
            fecha="2026-07-07", titulo="x", cuerpo_md="x", operaciones=[],
        )


def test_numeracion_secuencial_por_marca_y_fecha():
    id1, _ = propuestas.crear_propuesta(
        marca="piloto", tipo="pausar_keyword", customer_id="1", rutina_origen="manana",
        fecha="2026-07-07", titulo="uno", cuerpo_md="x", operaciones=_operaciones(),
    )
    id2, _ = propuestas.crear_propuesta(
        marca="piloto", tipo="nueva_negativa", customer_id="1", rutina_origen="manana",
        fecha="2026-07-07", titulo="dos", cuerpo_md="x", operaciones=_operaciones(),
    )
    assert id1 == "ADA-PILOTO-20260707-001"
    assert id2 == "ADA-PILOTO-20260707-002"


def test_indice_se_actualiza_al_crear():
    propuestas.crear_propuesta(
        marca="piloto", tipo="pausar_keyword", customer_id="1", rutina_origen="manana",
        fecha="2026-07-07", titulo="uno", cuerpo_md="x", operaciones=_operaciones(),
    )
    filas = propuestas.leer_indice()
    assert len(filas) == 1
    assert filas[0]["marca"] == "piloto"
    assert filas[0]["estado"] == "PROPUESTA"


def test_actualizar_estado_cambia_archivo_e_indice():
    id_propuesta, _ = propuestas.crear_propuesta(
        marca="piloto", tipo="pausar_keyword", customer_id="1", rutina_origen="manana",
        fecha="2026-07-07", titulo="uno", cuerpo_md="x", operaciones=_operaciones(),
    )
    propuestas.actualizar_estado(id_propuesta, "EJECUTADA", campos_extra={"recurso_objetivo": "customers/1/x"})

    propuesta = propuestas.leer_propuesta(id_propuesta)
    assert propuesta["estado"] == "EJECUTADA"
    assert propuesta["recurso_objetivo"] == "customers/1/x"

    filas = propuestas.leer_indice()
    assert filas[0]["estado"] == "EJECUTADA"


def test_buscar_archivo_falla_si_no_existe():
    with pytest.raises(FileNotFoundError):
        propuestas.buscar_archivo("ADA-NOEXISTE-20260707-001")
