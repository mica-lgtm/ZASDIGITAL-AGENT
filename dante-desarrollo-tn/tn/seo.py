import re

IDIOMA = "es"

CAMPOS_SEO = ("seo_title", "seo_description", "handle", "google_shopping_category")


def _texto(valor):
    """Los campos multi-idioma de TN vienen como dict {'es': ...} o string plano."""
    if isinstance(valor, dict):
        return valor.get(IDIOMA) or next(iter(valor.values()), "") or ""
    return valor or ""


def _sin_tags(html):
    return re.sub(r"<[^>]+>", "", html or "").strip()


def obtener_seo(client, producto_id):
    p = client.get(f"products/{producto_id}")
    return {"id": p["id"], **{campo: p.get(campo) for campo in CAMPOS_SEO}}


def actualizar_seo(client, producto_id, titulo_seo=None, desc_seo=None, handle=None):
    """Actualiza solo los campos SEO provistos (idioma 'es')."""
    data = {}
    if titulo_seo is not None:
        data["seo_title"] = {IDIOMA: titulo_seo}
    if desc_seo is not None:
        data["seo_description"] = {IDIOMA: desc_seo}
    if handle is not None:
        data["handle"] = {IDIOMA: handle}
    return client.put(f"products/{producto_id}", data)


def auditar_seo_catalogo(client):
    """Flags de calidad SEO/contenido por producto. Base para quick wins."""
    resultado = []
    for p in client.get_all("products"):
        descripcion = _sin_tags(_texto(p.get("description")))
        resultado.append({
            "id": p["id"],
            "nombre": _texto(p.get("name")),
            "sin_seo_title": not _texto(p.get("seo_title")),
            "sin_seo_desc": not _texto(p.get("seo_description")),
            "sin_descripcion": not descripcion,
            "descripcion_corta": bool(descripcion) and len(descripcion) < 100,
            "handle_vacio": not _texto(p.get("handle")),
        })
    return resultado


def bulk_actualizar_seo(client, actualizaciones):
    """Aplica una lista de {id, seo_title?, seo_description?, handle?}.

    Secuencial: el rate-limit lo absorbe el client (retry en 429).
    """
    aplicados = []
    for act in actualizaciones:
        aplicados.append(actualizar_seo(
            client,
            act["id"],
            titulo_seo=act.get("seo_title"),
            desc_seo=act.get("seo_description"),
            handle=act.get("handle"),
        ))
    return aplicados
