from unittest.mock import patch

from fastapi.testclient import TestClient

from apps.cro.backend.main import app
from apps.cro.backend.services import experimentos_service


def _armar_experimento(base, tienda, slug, resultado="", impl=""):
    exp = base / tienda / slug
    exp.mkdir(parents=True)
    if resultado:
        (exp / "resultado.md").write_text(resultado)
    if impl:
        (exp / "implementacion.md").write_text(impl)
    return exp


def test_list_experimentos_lee_filesystem(tmp_path):
    _armar_experimento(
        tmp_path, "piloto", "EXP-001-cta",
        resultado="## resultado\n- **Veredicto:** GANA\n",
        impl="- script_id: 555 deployed\n",
    )
    _armar_experimento(tmp_path, "piloto", "EXP-002-urgencia")

    with patch.object(experimentos_service, "EXPERIMENTOS_DIR", tmp_path):
        exps = experimentos_service.list_experimentos("piloto")

    assert len(exps) == 2
    ganador = next(e for e in exps if e["slug"] == "EXP-001-cta")
    assert ganador["status"] == "ganador"
    assert ganador["script_ids"] == [555]
    activo = next(e for e in exps if e["slug"] == "EXP-002-urgencia")
    assert activo["status"] == "activo"
    assert activo["script_ids"] == []


def test_list_experimentos_ignora_plantilla(tmp_path):
    (tmp_path / "_PLANTILLA.md").write_text("plantilla")
    _armar_experimento(tmp_path, "piloto", "EXP-001-x")
    with patch.object(experimentos_service, "EXPERIMENTOS_DIR", tmp_path):
        exps = experimentos_service.list_experimentos()
    assert [e["tienda"] for e in exps] == ["piloto"]


def test_get_experimento_incluye_contenido(tmp_path):
    exp = _armar_experimento(
        tmp_path, "piloto", "EXP-001-cta", resultado="- **Veredicto:** PIERDE\n"
    )
    (exp / "brief.md").write_text("## brief\nHipótesis X")

    with patch.object(experimentos_service, "EXPERIMENTOS_DIR", tmp_path):
        e = experimentos_service.get_experimento("piloto", "EXP-001-cta")

    assert e["status"] == "perdedor"
    assert "Hipótesis X" in e["brief"]


def test_endpoint_experimentos(tmp_path):
    _armar_experimento(tmp_path, "piloto", "EXP-001-cta")
    with patch.object(experimentos_service, "EXPERIMENTOS_DIR", tmp_path):
        r = TestClient(app).get("/api/experimentos?tienda=piloto")
    assert r.status_code == 200
    assert r.json()[0]["slug"] == "EXP-001-cta"


def test_endpoint_experimento_inexistente(tmp_path):
    with patch.object(experimentos_service, "EXPERIMENTOS_DIR", tmp_path):
        r = TestClient(app).get("/api/experimentos/piloto/EXP-999-nada")
    assert r.status_code == 404
