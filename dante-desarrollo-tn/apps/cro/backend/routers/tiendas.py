from fastapi import APIRouter, HTTPException
from apps.cro.backend.services import tn_service

router = APIRouter(prefix="/api/tiendas", tags=["tiendas"])


@router.get("")
def list_tiendas():
    return {"tiendas": tn_service.list_tiendas()}


@router.get("/{tienda}/productos")
def list_productos(tienda: str, q: str = ""):
    try:
        return tn_service.list_productos(tienda, q)
    except KeyError:
        raise HTTPException(404, f"Tienda '{tienda}' no configurada")
    except Exception as e:
        raise HTTPException(502, f"Error TN API: {e}")


@router.get("/{tienda}/producto/{producto_id}")
def get_producto(tienda: str, producto_id: int):
    try:
        return tn_service.get_producto(tienda, producto_id)
    except KeyError:
        raise HTTPException(404, f"Tienda '{tienda}' no configurada")
    except Exception as e:
        raise HTTPException(502, f"Error TN API: {e}")


@router.get("/{tienda}/categorias")
def list_categorias(tienda: str):
    try:
        return tn_service.list_categorias(tienda)
    except KeyError:
        raise HTTPException(404, f"Tienda '{tienda}' no configurada")
    except Exception as e:
        raise HTTPException(502, f"Error TN API: {e}")


@router.get("/{tienda}/metricas")
def get_metricas(tienda: str, dias: int = 30):
    try:
        return tn_service.get_metricas(tienda, dias)
    except KeyError:
        raise HTTPException(404, f"Tienda '{tienda}' no configurada")
    except Exception as e:
        raise HTTPException(502, f"Error TN API: {e}")


@router.get("/{tienda}/salud")
def get_salud(tienda: str):
    try:
        return tn_service.get_salud_tienda(tienda)
    except KeyError:
        raise HTTPException(404, f"Tienda '{tienda}' no configurada")
    except Exception as e:
        raise HTTPException(502, f"Error TN API: {e}")


@router.delete("/{tienda}/scripts/{script_id}")
def borrar_script(tienda: str, script_id: int):
    try:
        ok = tn_service.borrar_script(tienda, script_id)
    except KeyError:
        raise HTTPException(404, f"Tienda '{tienda}' no configurada")
    except Exception as e:
        raise HTTPException(502, f"Error TN API: {e}")
    if not ok:
        raise HTTPException(502, f"No se pudo borrar el script {script_id}")
    return {"ok": True, "script_id": script_id}
