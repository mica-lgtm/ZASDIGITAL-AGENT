import { SPREADSHEET_ID } from '../config.js'

// Base de fechas seriales de Sheets: 1899-12-30 (UTC para evitar husos).
const EPOCA_SHEETS = Date.UTC(1899, 11, 30)
const MS_POR_DIA = 24 * 60 * 60 * 1000

// La planilla tiene celdas numéricas que quedaron formateadas como fecha
// (ej. 1206 ventas se muestra "abril 1903"). gviz devuelve esas celdas como
// Date(y,m,d); el número original se recupera como serial de Sheets.
function serialDesdeDate(y, m, d, h = 0, mi = 0, s = 0) {
  const dias = (Date.UTC(y, m, d) - EPOCA_SHEETS) / MS_POR_DIA
  return dias + (h * 3600 + mi * 60 + s) / 86400
}

const RE_DATE = /^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)$/

function celda(c) {
  if (!c || c.v === null || c.v === undefined) return null
  const v = c.v
  if (typeof v === 'string') {
    const m = v.match(RE_DATE)
    if (m) {
      const [, y, mo, d, h, mi, s] = m.map((x) => (x === undefined ? 0 : Number(x)))
      return { tipo: 'fecha', serial: serialDesdeDate(y, mo, d, h, mi, s), y, m: mo, d }
    }
    return v.trim()
  }
  return v
}

export async function leerHoja(nombreHoja) {
  const url =
    `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq` +
    `?tqx=out:json&headers=0&sheet=${encodeURIComponent(nombreHoja)}`
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`No pude leer la hoja "${nombreHoja}" (HTTP ${resp.status})`)
  const texto = await resp.text()
  const inicio = texto.indexOf('(')
  const fin = texto.lastIndexOf(')')
  const cuerpo = JSON.parse(texto.slice(inicio + 1, fin))
  if (cuerpo.status !== 'ok') {
    throw new Error(`gviz devolvió estado "${cuerpo.status}" para la hoja "${nombreHoja}"`)
  }
  return cuerpo.table.rows.map((r) => (r.c || []).map(celda))
}

// Valor numérico de una celda, recuperando las mal formateadas como fecha.
export function num(v) {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return v
  if (typeof v === 'object' && v.tipo === 'fecha') return v.serial
  if (typeof v === 'string') {
    const limpio = v.replace(/\s|\$/g, '')
    if (/^-?\d+(?:,\d+)?$/.test(limpio)) return Number(limpio.replace(',', '.'))
    const n = Number(limpio)
    return Number.isFinite(n) ? n : null
  }
  return null
}

// Fecha legible si la celda es una fecha real (no un número corrupto).
export function comoFecha(v) {
  if (typeof v === 'object' && v?.tipo === 'fecha' && v.y > 1990 && v.y < 2100) {
    return `${String(v.d).padStart(2, '0')}/${String(v.m + 1).padStart(2, '0')}/${v.y}`
  }
  return null
}
