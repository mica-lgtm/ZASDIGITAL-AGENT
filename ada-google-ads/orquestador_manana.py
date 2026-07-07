"""Rutina de mañana (~9:00 ART): auditoría completa de cada cuenta activa --
campañas, keywords, anuncios, search terms -- y generación de propuestas.
100% de lectura + escritura de archivos locales (propuestas/, reportes/).
NUNCA importa `ads/mutate.py`. Invocado a diario vía `/schedule`, no cron
propio -- ver README."""

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
from formato_whatsapp import formatear_resumen_manana

ARGENTINA = timezone(timedelta(hours=-3))


def fecha_ayer():
    return (datetime.now(ARGENTINA) - timedelta(days=1)).strftime("%Y-%m-%d")


def fecha_hace_7_dias(hasta):
    return (date.fromisoformat(hasta) - timedelta(days=6)).strftime("%Y-%m-%d")


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="Ada -- rutina de mañana")
    parser.add_argument("--fecha", default=None, help="YYYY-MM-DD, default: ayer (hora Argentina)")
    parser.add_argument("--marcas", default=None, help="lista separada por comas, default: todas las activas con ficha")
    parser.add_argument(
        "--customer-id-directo", default=None,
        help="Bypassea la planilla de Sheets: corre solo contra este customer ID de Google Ads "
             "(requiere --marcas con exactamente una marca). Uso: mientras la planilla de Sol no esté configurada.",
    )
    parser.add_argument("--sin-whatsapp", action="store_true", help="imprime el resumen en vez de mandarlo por WhatsApp")
    return parser.parse_args(argv)


def _bloqueos(marcas_activas, cuentas_dir):
    faltantes = roster_ada.marcas_sin_ficha(marcas_activas, cuentas_dir)
    obsoletas = roster_ada.fichas_sin_marca_activa(marcas_activas, cuentas_dir)
    bloqueos = [
        {"marca": m, "motivo": "ficha faltante en cuentas/ -- no puedo personalizar, avisar a Mica"}
        for m in faltantes
    ]
    bloqueos += [
        {"marca": slug, "motivo": "ficha en cuentas/ sin marca activa en la planilla -- posible ficha obsoleta"}
        for slug in obsoletas
    ]
    return bloqueos, faltantes


def _reporte_markdown(reporte):
    lineas = [f"# Ada · Rutina de mañana · {reporte['fecha']}", "", "## Rollup por marca"]
    for marca, r in sorted(reporte["rollups_por_marca"].items()):
        roas = f"{r['roas']}x" if r["roas"] is not None else "s/d"
        lineas.append(f"- **{marca}**: spend ${r['spend']} · {r['conversiones']} conversiones · ROAS {roas}")

    lineas += ["", "## Propuestas generadas"]
    lineas += [f"- `{p['id']}` ({p['marca']})" for p in reporte["propuestas"]] or ["- Ninguna."]

    lineas += ["", "## Alertas"]
    lineas += [f"- ⚠️ {a['marca']}: {a['mensaje']}" for a in reporte["alertas"]] or ["- Ninguna."]

    lineas += ["", "## Bloqueos"]
    lineas += [f"- 🚧 {b['marca']}: {b['motivo']}" for b in reporte["bloqueos"]] or ["- Ninguno."]

    lineas += ["", "## Errores"]
    lineas += [f"- ❌ {e['marca']}: {e['error']}" for e in reporte["errores"]] or ["- Ninguno."]

    return "\n".join(lineas) + "\n"


def run(args, env=None):
    env = env or os.environ
    hasta = args.fecha or fecha_ayer()
    desde = fecha_hace_7_dias(hasta)

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
    todas_propuestas = []
    todas_alertas = []
    errores = []

    for cuenta in marcas_a_procesar:
        marca = cuenta["marca"]
        try:
            customer_id = customer_id_directo or customer_id_de_marca(marca, env=env)
            resultado = motor.procesar_marca_manana(cliente, marca, customer_id, desde, hasta)
        except Exception as exc:  # una marca no debe tumbar el resto de la rutina
            errores.append({"marca": marca, "error": str(exc)})
            continue
        rollups_por_marca[marca] = resultado["rollup"]
        todas_propuestas += [{"id": pid, "marca": marca} for pid in resultado["propuestas"]]
        todas_alertas += resultado["alertas"]

    reporte = {
        "fecha": hasta, "rutina": "manana", "rollups_por_marca": rollups_por_marca,
        "propuestas": todas_propuestas, "alertas": todas_alertas, "bloqueos": bloqueos, "errores": errores,
    }

    ruta_reporte = reportes_md.escribir_reporte_manana(hasta, _reporte_markdown(reporte))
    mensaje = formatear_resumen_manana(reporte, reporte_url=ruta_reporte)

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
