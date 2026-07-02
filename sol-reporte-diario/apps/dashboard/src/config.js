export const SPREADSHEET_ID = '1QTAakTd0SM59B_YYHSJmuZvFi2HbEeiOKpdqTRDMrxM'

export const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`

export const HOJA_DATA = 'DATA'
export const HOJA_ESTRELLA = 'ESTRELLA'

// Orden de los grupos de columnas de la hoja DATA, después de las dos columnas
// de totales (VENTAS, FACTURACION). Cada grupo completo trae INVERSION,
// FACTURACION, VENTAS y VISITAS; el último grupo es parcial (solo FACTURACION
// y VENTAS). La hoja no nombra los canales, así que este orden es deducido:
// si algún canal aparece con los números de otro, corregir SOLO esta lista.
export const CANALES_DATA = [
  'Tienda Nube',
  'Meta Ads',
  'Google Ads',
  'TikTok Ads',
]
export const CANAL_PARCIAL = 'Mercado Libre'
