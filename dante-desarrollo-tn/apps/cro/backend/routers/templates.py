from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from apps.cro.backend.services import template_store

router = APIRouter(prefix="/api/templates", tags=["templates"])


class TemplateBody(BaseModel):
    nombre: str
    html: str


@router.get("")
def list_templates():
    return template_store.list_templates()


@router.post("")
def create_template(body: TemplateBody):
    return template_store.create_template(body.nombre, body.html)


@router.put("/{template_id}")
def update_template(template_id: str, body: TemplateBody):
    t = template_store.update_template(template_id, body.nombre, body.html)
    if not t:
        raise HTTPException(404, "Template no encontrado")
    return t


@router.delete("/{template_id}")
def delete_template(template_id: str):
    if not template_store.delete_template(template_id):
        raise HTTPException(404, "Template no encontrado")
    return {"ok": True}
