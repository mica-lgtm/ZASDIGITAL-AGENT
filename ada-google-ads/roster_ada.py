"""Adaptador de solo lectura sobre el roster que ya construyó Sol
(sol-reporte-diario/roster.py + sheets.py). No reimplementa nada: solo
importa `roster.leer_roster` para no duplicar la planilla maestra como
fuente de verdad de qué marca tiene el canal `google_ads` activo.

Nunca importar acá nada de `canales/` de Sol (eso sería otro canal, no el
roster) ni escribir nada dentro de `sol-reporte-diario/` -- ver CLAUDE.md,
sección Ámbito."""

import os
import sys

_SOL_DIR = os.path.join(os.path.dirname(__file__), "..", "sol-reporte-diario")
if _SOL_DIR not in sys.path:
    # Append (no insert al principio): Ada tiene sus propios módulos
    # `whatsapp.py`/`formato_whatsapp.py` con el mismo nombre que los de Sol.
    # Si insertáramos el directorio de Sol al principio de sys.path, un
    # `import whatsapp` en el código de Ada podría resolver por accidente al
    # de Sol. Agregándolo al final, Ada solo cae a los módulos de Sol
    # (`roster`, `sheets`) que ella misma no define.
    sys.path.append(_SOL_DIR)

import roster as _sol_roster  # noqa: E402
import sheets as _sol_sheets  # noqa: E402

_CUENTAS_RESERVADOS = {"template-cuenta", "indice-cuentas", "cuentas-publicitarias-google-ads"}


def cliente_sheets(env=None):
    env = env or os.environ
    archivo = env.get("ADA_SHEETS_SERVICE_ACCOUNT_FILE", "secrets/sheets-service-account.json")
    return _sol_sheets.cliente_sheets(service_account_file=archivo)


def abrir_planilla(gc, spreadsheet_id):
    return _sol_sheets.abrir_planilla(gc, spreadsheet_id)


def marcas_google_ads_activas(planilla, hoja="Roster"):
    """Marcas con el canal `google_ads` activo según la planilla maestra."""
    roster = _sol_roster.leer_roster(planilla, hoja=hoja)
    return [c for c in roster if "google_ads" in c["canales_activos"]]


def marcas_sin_ficha(marcas_activas, cuentas_dir):
    """Marcas activas en la planilla que todavía no tienen `cuentas/<marca>.md`.
    No improviso su contexto -- la rutina debe reportarlo como bloqueante."""
    faltantes = []
    for cuenta in marcas_activas:
        ficha = os.path.join(cuentas_dir, f"{cuenta['marca']}.md")
        if not os.path.isfile(ficha):
            faltantes.append(cuenta["marca"])
    return faltantes


def fichas_sin_marca_activa(marcas_activas, cuentas_dir):
    """Fichas en `cuentas/` cuya marca ya no figura activa en la planilla --
    posible ficha obsoleta a revisar con Mica."""
    activas = {cuenta["marca"] for cuenta in marcas_activas}
    if not os.path.isdir(cuentas_dir):
        return []
    existentes = [
        nombre[:-3] for nombre in os.listdir(cuentas_dir)
        if nombre.endswith(".md") and nombre[:-3] not in _CUENTAS_RESERVADOS
    ]
    return [slug for slug in existentes if slug not in activas]
