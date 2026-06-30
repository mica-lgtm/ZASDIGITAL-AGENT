import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../.."))

from apps.cro.backend.services.preview_service import render


def test_render_variable_simple():
    html = "<h1>{{nombre}}</h1>"
    result = render(html, {"nombre": "Buzo Plush"})
    assert result == "<h1>Buzo Plush</h1>"


def test_render_multiples_variables():
    html = "<p>{{nombre}} — ${{precio}}</p>"
    result = render(html, {"nombre": "Buzo", "precio": "42990"})
    assert result == "<p>Buzo — $42990</p>"


def test_render_variable_faltante_queda_vacia():
    html = "<p>{{nombre}} {{inexistente}}</p>"
    result = render(html, {"nombre": "Buzo"})
    assert "Buzo" in result


def test_render_lista_variantes():
    html = "{% for v in variantes %}{{v}},{% endfor %}"
    result = render(html, {"variantes": ["S", "M", "L"]})
    assert result == "S,M,L,"
