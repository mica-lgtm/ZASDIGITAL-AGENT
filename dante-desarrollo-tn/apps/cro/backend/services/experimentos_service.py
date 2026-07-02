import re
from pathlib import Path

EXPERIMENTOS_DIR = Path(__file__).parents[4] / "experimentos"


def _leer(path: Path) -> str:
    return path.read_text() if path.exists() else ""


def _extraer_script_ids(texto: str) -> list[int]:
    return [int(m) for m in re.findall(r"script_id[:\s]+(\d+)", texto)]


def _status(resultado: str) -> str:
    if "GANA" in resultado:
        return "ganador"
    if "PIERDE" in resultado:
        return "perdedor"
    if "NEUTRO" in resultado:
        return "completo"
    return "activo"


def _resumir(tienda_dir: Path, exp_dir: Path) -> dict:
    resultado = _leer(exp_dir / "resultado.md")
    impl = _leer(exp_dir / "implementacion.md")
    return {
        "tienda": tienda_dir.name,
        "slug": exp_dir.name,
        "status": _status(resultado),
        "script_ids": _extraer_script_ids(impl),
        "tiene_resultado": bool(resultado.strip()),
    }


def list_experimentos(tienda: str = None) -> list[dict]:
    if not EXPERIMENTOS_DIR.exists():
        return []
    if tienda:
        dirs = [EXPERIMENTOS_DIR / tienda]
    else:
        dirs = [
            d for d in EXPERIMENTOS_DIR.iterdir()
            if d.is_dir() and not d.name.startswith("_")
        ]
    experimentos = []
    for tienda_dir in dirs:
        if not tienda_dir.is_dir():
            continue
        for exp_dir in sorted(tienda_dir.iterdir()):
            if exp_dir.is_dir():
                experimentos.append(_resumir(tienda_dir, exp_dir))
    return experimentos


def get_experimento(tienda: str, exp_slug: str) -> dict | None:
    exp_dir = EXPERIMENTOS_DIR / tienda / exp_slug
    if not exp_dir.is_dir():
        return None
    return {
        **_resumir(exp_dir.parent, exp_dir),
        "brief": _leer(exp_dir / "brief.md"),
        "implementacion": _leer(exp_dir / "implementacion.md"),
        "resultado": _leer(exp_dir / "resultado.md"),
    }
