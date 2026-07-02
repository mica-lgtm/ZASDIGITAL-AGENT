import { num } from './gviz.js'

// La hoja ESTRELLA es una secuencia de bloques mensuales: una fila con los
// nombres de los clientes, un encabezado MES/PERIODO/MÉTRICAS con TOTAL y %,
// y filas de métricas (Inversion, Facturacion, Ventas, ROI) agrupadas por
// Semana 1..N y TOTAL. Las columnas de clientes pueden cambiar entre meses.

const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
]

const NO_CLIENTES = ['TOTAL', '%', 'MENSUAL', 'REVISADO', 'MES', 'PERIODO', 'MÉTRICAS']

function esFilaDeClientes(fila) {
  if (fila[0] || fila[1] || fila[2]) return false
  const nombres = fila.filter(
    (c, i) => i >= 3 && typeof c === 'string' && c && !NO_CLIENTES.includes(c.toUpperCase()),
  )
  return nombres.length >= 2
}

function normalizarMetrica(texto) {
  const limpio = texto.trim().toLowerCase()
  if (limpio.startsWith('inversion')) return 'Inversión'
  if (limpio.startsWith('facturacion')) return 'Facturación'
  if (limpio.startsWith('ventas')) return 'Ventas'
  if (limpio.startsWith('roi')) return 'ROI'
  return texto.trim()
}

export function parsearEstrella(filas) {
  const meses = []
  let clientesCols = [] // [{col, nombre}]
  let totalCol = null
  let mesActual = null
  let periodoActual = null

  for (const fila of filas) {
    if (esFilaDeClientes(fila)) {
      clientesCols = fila
        .map((c, col) => ({ col, nombre: typeof c === 'string' ? c.trim() : null }))
        .filter((x) => x.nombre && !NO_CLIENTES.includes(x.nombre.toUpperCase()))
      continue
    }

    if (typeof fila[2] === 'string' && fila[2].trim().startsWith('MÉTRICAS')) {
      totalCol = fila.findIndex((c) => typeof c === 'string' && c.trim() === 'TOTAL')
      continue
    }

    const celdaMes = typeof fila[0] === 'string' ? fila[0].trim().toUpperCase() : null
    if (celdaMes && MESES.includes(celdaMes)) {
      mesActual = { mes: celdaMes, clientes: clientesCols, periodos: [] }
      meses.push(mesActual)
      periodoActual = null
    }

    if (!mesActual) continue

    const celdaPeriodo = typeof fila[1] === 'string' ? fila[1].trim() : null
    if (celdaPeriodo) {
      periodoActual = { nombre: celdaPeriodo, metricas: {} }
      mesActual.periodos.push(periodoActual)
    }

    const celdaMetrica = typeof fila[2] === 'string' ? fila[2].trim() : null
    if (!celdaMetrica || !periodoActual) continue

    const porCliente = {}
    for (const { col, nombre } of mesActual.clientes) {
      porCliente[nombre] = num(fila[col])
    }
    periodoActual.metricas[normalizarMetrica(celdaMetrica)] = {
      porCliente,
      total: totalCol !== null && totalCol >= 0 ? num(fila[totalCol]) : null,
    }
  }

  // Un mes sin ningún dato cargado (todo null/0) no aporta: se filtra.
  return meses.filter((m) =>
    m.periodos.some((p) =>
      Object.values(p.metricas).some((met) =>
        Object.values(met.porCliente).some((v) => v),
      ),
    ),
  )
}

export const METRICAS_ORDEN = ['Inversión', 'Facturación', 'Ventas', 'ROI']
