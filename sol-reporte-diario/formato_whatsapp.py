"""Arma el mensaje de texto plano para WhatsApp a partir del dict que devuelve
reporte.generar_reporte(). WhatsApp no renderiza HTML/tablas ni markdown más
allá de *bold*/_italic_, así que el mensaje es un rollup por marca, no el
detalle canal por canal (eso vive en la Sheet)."""


def _moneda(valor):
    return "{:,.0f}".format(valor or 0).replace(",", ".")


def _nombre_marca(slug):
    return slug.replace("_", " ").title()


def formatear_mensaje(reporte, sheet_url=None):
    lineas = [f"📊 *Reporte diario* — {reporte['fecha']}", ""]

    for marca in sorted(reporte["rollups_por_marca"]):
        r = reporte["rollups_por_marca"][marca]
        roas = f"{r['roas']}x" if r["roas"] is not None else "s/d"
        lineas.append(
            f"{_nombre_marca(marca)}: ${_moneda(r['spend'])} spend · "
            f"{r['conversiones']} ventas · ROAS {roas}"
        )

    if reporte["errores"]:
        lineas.append("")
        for error in reporte["errores"]:
            lineas.append(f"⚠️ {error['canal']} ({_nombre_marca(error['marca'])}): {error['error']}")

    if sheet_url:
        lineas.append("")
        lineas.append(f"Detalle completo → {sheet_url}")

    return "\n".join(lineas)
