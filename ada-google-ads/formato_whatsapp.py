"""Arma el mensaje de texto plano para WhatsApp a partir de los dicts que
devuelven `orquestador_manana.py`/`orquestador_tarde.py`/`orquestador_semanal.py`.
WhatsApp no renderiza markdown más allá de *bold*/_italic_, así que esto es
un resumen ejecutivo -- el detalle completo vive en `reportes/*.md`."""


def _moneda(valor):
    return "{:,.0f}".format(valor or 0).replace(",", ".")


def _nombre_marca(slug):
    return slug.replace("_", " ").title()


def _lineas_rollup(reporte):
    lineas = []
    for marca in sorted(reporte.get("rollups_por_marca", {})):
        r = reporte["rollups_por_marca"][marca]
        roas = f"{r['roas']}x" if r.get("roas") is not None else "s/d"
        lineas.append(
            f"{_nombre_marca(marca)}: ${_moneda(r.get('spend'))} spend · "
            f"{r.get('conversiones', 0)} conversiones · ROAS {roas}"
        )
    return lineas


def _lineas_alertas_bloqueos_errores(reporte):
    lineas = []
    for alerta in reporte.get("alertas", []):
        lineas.append(f"⚠️ {_nombre_marca(alerta['marca'])}: {alerta['mensaje']}")
    for bloqueo in reporte.get("bloqueos", []):
        lineas.append(f"🚧 {_nombre_marca(bloqueo['marca'])}: {bloqueo['motivo']}")
    for error in reporte.get("errores", []):
        lineas.append(f"❌ {_nombre_marca(error['marca'])}: {error['error']}")
    return lineas


def formatear_resumen_manana(reporte, reporte_url=None):
    lineas = [f"🌅 *Ada — Rutina de mañana* — {reporte['fecha']}", ""]
    lineas += _lineas_rollup(reporte)

    n_propuestas = len(reporte.get("propuestas", []))
    lineas.append("")
    lineas.append(f"📝 {n_propuestas} propuesta(s) nueva(s) esperando `APROBADO <ID>`.")

    extra = _lineas_alertas_bloqueos_errores(reporte)
    if extra:
        lineas.append("")
        lineas += extra

    if reporte_url:
        lineas.append("")
        lineas.append(f"Detalle completo → {reporte_url}")

    return "\n".join(lineas)


def formatear_resumen_tarde(reporte, reporte_url=None):
    lineas = [f"🌇 *Ada — Rutina de tarde* — {reporte['fecha']}", ""]
    lineas += _lineas_rollup(reporte)

    pendientes = reporte.get("pendientes_aging", [])
    if pendientes:
        mas_antigua = max(p["dias"] for p in pendientes)
        lineas.append("")
        lineas.append(f"⏳ {len(pendientes)} propuesta(s) sin aprobar (la más vieja: {mas_antigua} día(s)).")

    esperando = reporte.get("esperando_activar", [])
    if esperando:
        lineas.append(f"⏸️ {len(esperando)} campaña(s) SUBIDA PAUSADA esperando `ACTIVAR <ID>`.")

    n_propuestas = len(reporte.get("propuestas", []))
    if n_propuestas:
        lineas.append(f"📝 {n_propuestas} propuesta(s) urgente(s) nueva(s) de esta tarde.")

    extra = _lineas_alertas_bloqueos_errores(reporte)
    if extra:
        lineas.append("")
        lineas += extra

    if reporte_url:
        lineas.append("")
        lineas.append(f"Detalle completo → {reporte_url}")

    return "\n".join(lineas)


def formatear_resumen_semanal(reporte, reporte_url=None):
    lineas = [f"📅 *Ada — Revisión semanal* — semana al {reporte['fecha']}", ""]
    lineas += _lineas_rollup(reporte)

    actionables = reporte.get("actionables", [])
    if actionables:
        lineas.append("")
        lineas.append("🎯 Top accionables:")
        for a in actionables[:3]:
            lineas.append(f"  · {_nombre_marca(a['marca'])}: {a['texto']}")

    n_nuevas = len(reporte.get("propuestas_nueva_campana", []))
    lineas.append("")
    lineas.append(f"🚀 {n_nuevas} propuesta(s) de campaña nueva esperando `APROBADO <ID>`.")

    extra = _lineas_alertas_bloqueos_errores(reporte)
    if extra:
        lineas.append("")
        lineas += extra

    if reporte_url:
        lineas.append("")
        lineas.append(f"Detalle completo → {reporte_url}")

    return "\n".join(lineas)
