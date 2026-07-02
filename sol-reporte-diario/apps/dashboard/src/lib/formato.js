// Formato local Argentina: $1.234.567, coma decimal.

export function moneda(v) {
  if (v === null || v === undefined) return null
  return '$' + Math.round(v).toLocaleString('es-AR')
}

export function entero(v) {
  if (v === null || v === undefined) return null
  return Math.round(v).toLocaleString('es-AR')
}

export function decimal(v, digitos = 2) {
  if (v === null || v === undefined) return null
  return v.toLocaleString('es-AR', {
    minimumFractionDigits: digitos,
    maximumFractionDigits: digitos,
  })
}
