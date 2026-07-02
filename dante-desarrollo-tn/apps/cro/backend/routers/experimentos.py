from fastapi import APIRouter, HTTPException
from apps.cro.backend.services import experimentos_service

router = APIRouter(prefix="/api/experimentos", tags=["experimentos"])


@router.get("")
def list_experimentos(tienda: str = None):
    return experimentos_service.list_experimentos(tienda)


@router.get("/{tienda}/{exp_slug}")
def get_experimento(tienda: str, exp_slug: str):
    exp = experimentos_service.get_experimento(tienda, exp_slug)
    if exp is None:
        raise HTTPException(404, f"Experimento '{tienda}/{exp_slug}' no encontrado")
    return exp
