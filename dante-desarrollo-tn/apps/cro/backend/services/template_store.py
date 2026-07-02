import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

TEMPLATES_DIR = Path(__file__).parents[4] / "templates"


def _path(template_id: str) -> Path:
    return TEMPLATES_DIR / f"{template_id}.json"


def list_templates() -> list[dict]:
    TEMPLATES_DIR.mkdir(exist_ok=True)
    return [json.loads(p.read_text()) for p in sorted(TEMPLATES_DIR.glob("*.json"))]


def get_template(template_id: str) -> dict | None:
    p = _path(template_id)
    return json.loads(p.read_text()) if p.exists() else None


def create_template(nombre: str, html: str) -> dict:
    TEMPLATES_DIR.mkdir(exist_ok=True)
    now = datetime.now(timezone.utc).isoformat()
    t = {
        "id": str(uuid.uuid4()),
        "nombre": nombre,
        "html": html,
        "created_at": now,
        "updated_at": now,
    }
    _path(t["id"]).write_text(json.dumps(t, ensure_ascii=False, indent=2))
    return t


def update_template(template_id: str, nombre: str, html: str) -> dict | None:
    t = get_template(template_id)
    if not t:
        return None
    t["nombre"] = nombre
    t["html"] = html
    t["updated_at"] = datetime.now(timezone.utc).isoformat()
    _path(template_id).write_text(json.dumps(t, ensure_ascii=False, indent=2))
    return t


def delete_template(template_id: str) -> bool:
    p = _path(template_id)
    if not p.exists():
        return False
    p.unlink()
    return True
