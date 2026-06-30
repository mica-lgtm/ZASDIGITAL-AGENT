import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../.."))

import pytest
from apps.cro.backend.services import template_store as ts


@pytest.fixture(autouse=True)
def use_tmp_dir(tmp_path, monkeypatch):
    monkeypatch.setattr(ts, "TEMPLATES_DIR", tmp_path)


def test_list_vacio():
    assert ts.list_templates() == []


def test_create_y_list():
    t = ts.create_template("Mi template", "<p>{{nombre}}</p>")
    assert t["nombre"] == "Mi template"
    assert t["html"] == "<p>{{nombre}}</p>"
    assert "id" in t
    lista = ts.list_templates()
    assert len(lista) == 1
    assert lista[0]["id"] == t["id"]


def test_get_existente():
    t = ts.create_template("A", "<div></div>")
    found = ts.get_template(t["id"])
    assert found["id"] == t["id"]


def test_get_inexistente():
    assert ts.get_template("no-existe") is None


def test_update():
    t = ts.create_template("Viejo", "<p>old</p>")
    updated = ts.update_template(t["id"], "Nuevo", "<p>new</p>")
    assert updated["nombre"] == "Nuevo"
    assert updated["html"] == "<p>new</p>"
    assert updated["updated_at"] > t["created_at"]


def test_update_inexistente():
    assert ts.update_template("no-existe", "X", "Y") is None


def test_delete():
    t = ts.create_template("Para borrar", "<p></p>")
    assert ts.delete_template(t["id"]) is True
    assert ts.get_template(t["id"]) is None


def test_delete_inexistente():
    assert ts.delete_template("no-existe") is False
