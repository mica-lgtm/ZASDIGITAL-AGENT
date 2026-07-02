"""Wrapper delgado sobre Google Sheets vía gspread + cuenta de servicio.
Las funciones toman un objeto `planilla` (o `gc`) ya construido en vez de
armarlo ellas mismas, para poder testear con dobles simples sin red."""

import os

import gspread


def cliente_sheets(service_account_file=None, env=None):
    env = env or os.environ
    archivo = service_account_file or env.get(
        "SOL_SHEETS_SERVICE_ACCOUNT_FILE", "secrets/sheets-service-account.json"
    )
    return gspread.service_account(filename=archivo)


def abrir_planilla(gc, spreadsheet_id):
    return gc.open_by_key(spreadsheet_id)


def leer_filas(planilla, hoja):
    """Devuelve la hoja como lista de dicts, una entrada por fila (header = keys)."""
    return planilla.worksheet(hoja).get_all_records()


def escribir_filas(planilla, hoja, filas, columnas):
    """Appendea `filas` (list of dict) a `hoja`, en el orden de `columnas`.
    Los None se escriben como celda vacía, no como el string "None"."""
    if not filas:
        return
    worksheet = planilla.worksheet(hoja)
    valores = [
        [("" if fila.get(c) is None else fila.get(c)) for c in columnas]
        for fila in filas
    ]
    worksheet.append_rows(valores, value_input_option="USER_ENTERED")
