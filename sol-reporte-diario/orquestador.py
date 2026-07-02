"""Entrypoint único: roster -> fetch por canal -> agregación -> Sheet -> WhatsApp.
Es el único script que invoca la rutina programada de /schedule a las 9am."""

import argparse
import os
import sys
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv

import reporte
import roster as roster_mod
import sheets
import whatsapp
from canales.base import COLUMNAS
from formato_whatsapp import formatear_mensaje

ARGENTINA = timezone(timedelta(hours=-3))


def fecha_ayer():
    return (datetime.now(ARGENTINA) - timedelta(days=1)).strftime("%Y-%m-%d")


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="Sol -- reporte diario multi-canal")
    parser.add_argument("--fecha", default=None, help="YYYY-MM-DD, default: ayer (hora Argentina)")
    parser.add_argument("--canales", default=None, help="lista separada por comas, default: todos los activos")
    parser.add_argument(
        "--sin-whatsapp", action="store_true",
        help="imprime el mensaje por consola en vez de mandarlo por WhatsApp",
    )
    return parser.parse_args(argv)


def run(args):
    fecha = args.fecha or fecha_ayer()
    canales = args.canales.split(",") if args.canales else None

    spreadsheet_id = os.environ.get("SOL_SHEETS_SPREADSHEET_ID")
    if not spreadsheet_id:
        sys.exit("Falta SOL_SHEETS_SPREADSHEET_ID en .env")

    gc = sheets.cliente_sheets()
    planilla = sheets.abrir_planilla(gc, spreadsheet_id)

    hoja_roster = os.environ.get("SOL_SHEETS_HOJA_ROSTER", "Roster")
    hoja_datos = os.environ.get("SOL_SHEETS_HOJA_DATOS", "Datos Diarios")

    roster_data = roster_mod.leer_roster(planilla, hoja=hoja_roster)
    reporte_dia = reporte.generar_reporte(fecha, roster_data, canales=canales)
    sheets.escribir_filas(planilla, hoja_datos, reporte_dia["filas"], columnas=COLUMNAS)

    sheet_url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}"
    mensaje = formatear_mensaje(reporte_dia, sheet_url=sheet_url)

    if args.sin_whatsapp:
        print(mensaje)
    else:
        whatsapp.enviar_plantilla(mensaje)

    if reporte_dia["errores"]:
        print(f"[Sol] {len(reporte_dia['errores'])} canal(es) fallaron hoy:", file=sys.stderr)
        for error in reporte_dia["errores"]:
            print(f"  - {error['canal']} ({error['marca']}): {error['error']}", file=sys.stderr)

    intentos = len(reporte_dia["filas"]) + len(reporte_dia["errores"])
    if intentos and not reporte_dia["filas"]:
        sys.exit(1)  # falla total: nada se pudo levantar
    return reporte_dia


def main():
    load_dotenv()
    run(parse_args())


if __name__ == "__main__":
    main()
