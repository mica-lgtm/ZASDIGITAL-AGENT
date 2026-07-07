"""Rutina de tarde (~16:00 ART): NO es un re-run de la mañana -- pacing
intradía, seguimiento de propuestas pendientes/campañas SUBIDA PAUSADA
esperando ACTIVAR, y anomalías del propio día (CPC, desaprobaciones
frescas). 100% de lectura + escritura de archivos locales. NUNCA importa
`ads/mutate.py`."""

import argparse
import os
import sys
from datetime import date, datetime, timedelta, timezone

from dotenv import load_dotenv

import diagnostico
import motor
import propuestas
import reportes_md
import roster_ada
import whatsapp
from ads.client import cliente_desde_env, customer_id_de_marca
from formato_whatsapp import formatear_resumen_tarde
from orquestador_manana import _bloqueos

ARGENTINA = timezone(timedelta(hours=-3))


def fecha_hoy():
    return datetime.now(ARGENTINA).strftime("%Y-%m-%d")


def ventana_baseline(hoy):
    h = date.fromisoformat(hoy)
    hasta_baseline = (h - timedelta(days=1)).strftime("%Y-%m-%d")
    desde_baseline = (h - timedelta(days=7)).strftime("%Y-%m-%d")
    return desde_baseline, hasta_baseline


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="Ada -- rutina de tarde")
    parser.add_argument("--fecha", default=None, help="YYYY-MM-DD, default: hoy (hora Argentina)")
    parser.add_argument("--marcas", default=None, help="lista separada por comas, default: todas las activas con ficha")
    parser.add_argument(
        "--customer-id-directo", default=None,
        help="Bypassea la planilla de Sheets: corre solo contra este customer ID de Google Ads "
             "(requiere --marcas con exactamente una marca).",
    )
    parser.add_argument("--sin-whatsapp", action="store_true", help="imprime el resumen en vez de mandarlo por WhatsApp")
    return parser.parse_args(argv)


def _pendientes_aging(hoy):
    pendientes = []
    for fila in propuestas.leer_indice():
        if fila["estado"] == "PROPUESTA":
            pendientes.append({"id": fila["id"], "marca": fila["marca"], "dias": diagnostico.dias_desde(fila["fecha"], hoy)})
    return pendientes


def _esperando_activar():
    return [
        {"id": fila["id"], "marca": fila["marca"]}
        for fila in propuestas.leer_indice()
        if fila["estado"] == "SUBIDA PAUSADA" and fila["tipo"] == "nueva_campana"
    ]


def _reporte_markdown(reporte):
    lineas = [f"# Ada · Rutina de tarde · {reporte['fecha']}", "", "## Rollup de hoy por marca"]
    for marca, r in sorted(reporte["rollups_por_marca"].items()):
        roas = f"{r['roas']}x" if r["roas"] is not None else "s/d"
        lineas.append(f"- **{marca}**: spend ${r['spend']} · {r['conversiones']} conversiones · ROAS {roas}")

    lineas += ["", "## Propuestas pendientes (sin aprobar)"]
    lineas += [f"- `{p['id']}` ({p['marca']}) -- {p['dias']} día(s)" for p in reporte["pendientes_aging"]] or ["- Ninguna."]

    lineas += ["", "## Campañas SUBIDA PAUSADA esperando ACTIVAR"]
    lineas += [f"- `{c['id']}` ({c['marca']})" for c in reporte["esperando_activar"]] or ["- Ninguna."]

    lineas += ["", "## Alertas de hoy"]
    lineas += [f"- ⚠️ {a['marca']}: {a['mensaje']}" for a in reporte["alertas"]] or ["- Ninguna."]

    lineas += ["", "## Bloqueos"]
    lineas += [f"- 🚧 {b['marca']}: {b['motivo']}" for b in reporte["bloqueos"]] or ["- Ninguno."]

    lineas += ["", "## Errores"]
    lineas += [f"- ❌ {e['marca']}: {e['error']}" for e in reporte["errores"]] or ["- Ninguno."]

    return "\n".join(lineas) + "\n"


def run(args, env=None):
    env = env or os.environ
    hoy = args.fecha or fecha_hoy()
    desde_baseline, hasta_baseline = ventana_baseline(hoy)

    customer_id_directo = None
    if args.customer_id_directo:
        if not args.marcas or "," in args.marcas:
            sys.exit("--customer-id-directo requiere --marcas con exactamente una marca")
        marca_directa = args.marcas
        marcas_activas = [{"marca": marca_directa, "marca_original": marca_directa, "canales_activos": ["google_ads"]}]
        customer_id_directo = args.customer_id_directo.replace("-", "")
    else:
        spreadsheet_id = env.get("ADA_SHEETS_SPREADSHEET_ID")
        if not spreadsheet_id:
            sys.exit("Falta ADA_SHEETS_SPREADSHEET_ID en .env")

        gc = roster_ada.cliente_sheets(env=env)
        planilla = roster_ada.abrir_planilla(gc, spreadsheet_id)
        hoja_roster = env.get("ADA_SHEETS_HOJA_ROSTER", "Roster")
        marcas_activas = roster_ada.marcas_google_ads_activas(planilla, hoja=hoja_roster)

        if args.marcas:
            filtro = set(args.marcas.split(","))
            marcas_activas = [m for m in marcas_activas if m["marca"] in filtro]

    cuentas_dir = os.path.join(os.path.dirname(__file__), "cuentas")
    bloqueos, faltantes = _bloqueos(marcas_activas, cuentas_dir)
    marcas_a_procesar = [m for m in marcas_activas if m["marca"] not in faltantes]

    cliente = cliente_desde_env(env)

    rollups_por_marca = {}
    todas_alertas = []
    errores = []

    for cuenta in marcas_a_procesar:
        marca = cuenta["marca"]
        try:
            customer_id = customer_id_directo or customer_id_de_marca(marca, env=env)
            resultado = motor.procesar_marca_tarde(cliente, marca, customer_id, hoy, desde_baseline, hasta_baseline)
        except Exception as exc:
            errores.append({"marca": marca, "error": str(exc)})
            continue
        rollups_por_marca[marca] = resultado["rollup"]
        todas_alertas += resultado["alertas"]

    reporte = {
        "fecha": hoy, "rutina": "tarde", "rollups_por_marca": rollups_por_marca,
        "propuestas": [], "alertas": todas_alertas, "bloqueos": bloqueos, "errores": errores,
        "pendientes_aging": _pendientes_aging(hoy), "esperando_activar": _esperando_activar(),
    }

    ruta_reporte = reportes_md.escribir_reporte_tarde(hoy, _reporte_markdown(reporte))
    mensaje = formatear_resumen_tarde(reporte, reporte_url=ruta_reporte)

    if args.sin_whatsapp:
        print(mensaje)
    else:
        whatsapp.enviar_plantilla(mensaje, env=env)

    return reporte


def main():
    load_dotenv()
    run(parse_args())


if __name__ == "__main__":
    main()
