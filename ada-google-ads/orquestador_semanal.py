"""Rutina de fin de semana (domingo ~10:00 ART): rollup completo de los
últimos 7 días por marca, accionables estratégicos, e ideas de campaña
nueva por cliente. Las ideas de campaña nueva quedan en el reporte y en
`memoria/pendientes.md` como texto -- convertirlas en una propuesta formal
(`propuestas.crear_propuesta`, tipo `nueva_campana`) requiere el criterio de
Ada en modo interactivo (copy, estructura, audiencias), no se fabrica acá.
100% de lectura + escritura de archivos locales. NUNCA importa
`ads/mutate.py`."""

import argparse
import os
import sys
from datetime import date, datetime, timedelta, timezone

from dotenv import load_dotenv

import motor
import reportes_md
import roster_ada
import whatsapp
from ads.client import cliente_desde_env, customer_id_de_marca
from formato_whatsapp import formatear_resumen_semanal
from orquestador_manana import _bloqueos

ARGENTINA = timezone(timedelta(hours=-3))


def fecha_domingo_reciente():
    hoy = datetime.now(ARGENTINA).date()
    offset = (hoy.weekday() - 6) % 7  # weekday(): lunes=0 ... domingo=6
    return (hoy - timedelta(days=offset)).strftime("%Y-%m-%d")


def ventana_semana(hasta):
    return (date.fromisoformat(hasta) - timedelta(days=6)).strftime("%Y-%m-%d")


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="Ada -- rutina de fin de semana")
    parser.add_argument("--fecha", default=None, help="YYYY-MM-DD (domingo), default: domingo más reciente (hora Argentina)")
    parser.add_argument("--marcas", default=None, help="lista separada por comas, default: todas las activas con ficha")
    parser.add_argument(
        "--customer-id-directo", default=None,
        help="Bypassea la planilla de Sheets: corre solo contra este customer ID de Google Ads "
             "(requiere --marcas con exactamente una marca).",
    )
    parser.add_argument("--sin-whatsapp", action="store_true", help="imprime el resumen en vez de mandarlo por WhatsApp")
    return parser.parse_args(argv)


def _registrar_pendientes(actionables, fecha):
    if not actionables:
        return
    ruta = os.path.join(os.path.dirname(__file__), "memoria", "pendientes.md")
    with open(ruta, "a", encoding="utf-8") as f:
        for a in actionables:
            f.write(f"- [{fecha}] {a['marca']}: {a['texto']}\n")


def _reporte_markdown(reporte):
    lineas = [f"# Ada · Revisión semanal · semana al {reporte['fecha']}", "", "## Rollup de la semana por marca"]
    for marca, r in sorted(reporte["rollups_por_marca"].items()):
        roas = f"{r['roas']}x" if r["roas"] is not None else "s/d"
        lineas.append(f"- **{marca}**: spend ${r['spend']} · {r['conversiones']} conversiones · ROAS {roas}")

    lineas += ["", "## Accionables estratégicos"]
    lineas += [f"- {a['marca']}: {a['texto']}" for a in reporte["actionables"]] or ["- Ninguno."]

    lineas += ["", "## Bloqueos"]
    lineas += [f"- 🚧 {b['marca']}: {b['motivo']}" for b in reporte["bloqueos"]] or ["- Ninguno."]

    lineas += ["", "## Errores"]
    lineas += [f"- ❌ {e['marca']}: {e['error']}" for e in reporte["errores"]] or ["- Ninguno."]

    return "\n".join(lineas) + "\n"


def run(args, env=None):
    env = env or os.environ
    hasta = args.fecha or fecha_domingo_reciente()
    desde = ventana_semana(hasta)

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
    todos_actionables = []
    errores = []

    for cuenta in marcas_a_procesar:
        marca = cuenta["marca"]
        try:
            customer_id = customer_id_directo or customer_id_de_marca(marca, env=env)
            resultado = motor.procesar_marca_semanal(cliente, marca, customer_id, desde, hasta)
        except Exception as exc:
            errores.append({"marca": marca, "error": str(exc)})
            continue
        rollups_por_marca[marca] = resultado["rollup"]
        todos_actionables += resultado["actionables"]

    _registrar_pendientes(todos_actionables, hasta)

    reporte = {
        "fecha": hasta, "rutina": "semanal", "rollups_por_marca": rollups_por_marca,
        "actionables": todos_actionables, "propuestas_nueva_campana": [],
        "alertas": [], "bloqueos": bloqueos, "errores": errores,
    }

    ruta_reporte = reportes_md.escribir_reporte_semanal(hasta, _reporte_markdown(reporte))
    mensaje = formatear_resumen_semanal(reporte, reporte_url=ruta_reporte)

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
