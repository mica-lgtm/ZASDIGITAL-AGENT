from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from apps.cro.backend.services import tn_service, template_store
from apps.cro.backend.services.preview_service import render

router = APIRouter(prefix="/api/preview", tags=["preview"])


class PreviewRequest(BaseModel):
    tienda: str
    producto_id: int
    template_id: str


@router.post("")
def preview(req: PreviewRequest):
    template = template_store.get_template(req.template_id)
    if not template:
        raise HTTPException(404, "Template no encontrado")
    try:
        product = tn_service.get_producto(req.tienda, req.producto_id)
    except Exception as e:
        raise HTTPException(502, f"Error TN API: {e}")
    html = render(template["html"], product["variables"])
    return {"html": html, "variables": product["variables"]}
