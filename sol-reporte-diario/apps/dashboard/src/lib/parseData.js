import { num, comoFecha } from './gviz.js'

// La hoja DATA es una secuencia de bloques (uno por día cargado). Cada bloque
// arranca con una fila de encabezado que contiene "Nombre del Cliente"; los
// bloques viejos vienen corridos una columna con la fecha del bloque adelante.
// Después de los totales (VENTAS, FACTURACION) hay 4 grupos de canal de
// (INVERSION, FACTURACION, VENTAS, VISITAS) y un grupo parcial (FACTURACION,
// VENTAS). Los nombres de canal no están en la hoja: ver CANALES_DATA en config.

const GRUPOS_COMPLETOS = 4

function esEncabezado(fila) {
  return fila.findIndex((c) => typeof c === 'string' && c.startsWith('Nombre del Cliente'))
}

function parsearFila(fila, off) {
  const cliente = fila[off]
  if (typeof cliente !== 'string' || !cliente) return null

  const dia = comoFecha(fila[off + 1])
  const ventas = num(fila[off + 2])
  const facturacion = num(fila[off + 3])

  const canales = []
  for (let g = 0; g < GRUPOS_COMPLETOS; g++) {
    const base = off + 4 + g * 4
    canales.push({
      inversion: num(fila[base]),
      facturacion: num(fila[base + 1]),
      ventas: num(fila[base + 2]),
      visitas: num(fila[base + 3]),
    })
  }
  const baseParcial = off + 4 + GRUPOS_COMPLETOS * 4
  const parcial = {
    facturacion: num(fila[baseParcial]),
    ventas: num(fila[baseParcial + 1]),
  }

  const etiquetaBloque = off > 0 ? comoFecha(fila[off - 1]) : null
  return { cliente, dia, ventas, facturacion, canales, parcial, etiquetaBloque }
}

export function parsearData(filas) {
  const bloques = []
  let actual = null

  for (const fila of filas) {
    const off = esEncabezado(fila)
    if (off >= 0) {
      actual = { off, filas: [] }
      bloques.push(actual)
      continue
    }
    if (!actual) continue
    const parseada = parsearFila(fila, actual.off)
    if (parseada) actual.filas.push(parseada)
  }

  return bloques
    .filter((b) => b.filas.length)
    .map((b, i) => ({
      etiqueta:
        b.filas[0].etiquetaBloque ||
        b.filas.map((f) => f.dia).find(Boolean) ||
        `Bloque ${i + 1}`,
      filas: b.filas,
    }))
}
