import { useState, useEffect } from 'react'
import { api } from '../utils/api.js'

const PERIODOS = [7, 30, 90]

function fmtMonto(n) {
  return '$' + Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })
}

function colorSalud(score) {
  if (score >= 75) return 'bg-green-500'
  if (score >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

function MetricCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-5">
      <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold text-dark mt-1">{value}</div>
    </div>
  )
}

function BarChart({ serie }) {
  if (!serie.length) {
    return <div className="text-sm text-gray-400 py-8 text-center">Sin pedidos en la ventana</div>
  }
  const max = Math.max(...serie.map(p => p.pedidos))
  const barW = 100 / serie.length
  return (
    <svg viewBox="0 0 100 40" className="w-full h-40" preserveAspectRatio="none">
      {serie.map((p, i) => {
        const h = max ? (p.pedidos / max) * 36 : 0
        return (
          <rect
            key={p.fecha}
            x={i * barW + barW * 0.15}
            y={40 - h}
            width={barW * 0.7}
            height={h}
            className="fill-orange"
          >
            <title>{`${p.fecha}: ${p.pedidos} pedidos · ${fmtMonto(p.ingresos)}`}</title>
          </rect>
        )
      })}
    </svg>
  )
}

export default function Dashboard({ tienda }) {
  const [dias, setDias] = useState(30)
  const [metricas, setMetricas] = useState(null)
  const [salud, setSalud] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tienda) return
    setError('')
    setMetricas(null)
    api.getMetricas(tienda, dias).then(setMetricas).catch(e => setError(String(e)))
  }, [tienda, dias])

  useEffect(() => {
    if (!tienda) return
    setSalud(null)
    api.getSalud(tienda).then(setSalud).catch(console.error)
  }, [tienda])

  if (!tienda) return null
  if (error) return <div className="text-sm text-red-500">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-dark">Dashboard</h2>
        <div className="flex gap-1">
          {PERIODOS.map(p => (
            <button
              key={p}
              onClick={() => setDias(p)}
              className={`px-3 py-1 text-sm rounded ${
                dias === p ? 'bg-dark text-white' : 'bg-white border border-gray-200 text-gray-500'
              }`}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {metricas ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard label={`Pedidos · ${dias}d`} value={metricas.pedidos} />
            <MetricCard label={`Ingresos · ${dias}d`} value={fmtMonto(metricas.ingresos)} />
            <MetricCard label="AOV" value={fmtMonto(metricas.aov)} />
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-5">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">
              Pedidos por día
            </div>
            <BarChart serie={metricas.serie_temporal} />
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-400">Cargando métricas…</div>
      )}

      {salud && (
        <div className="bg-white rounded-lg border border-gray-100 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Salud de la tienda</div>
            <div className="text-lg font-bold text-dark">{salud.score}/100</div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${colorSalud(salud.score)}`}
              style={{ width: `${salud.score}%` }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
            <div>Catálogo {salud.catalogo_completo_pct}% completo ({salud.sin_descripcion} sin descripción)</div>
            <div>SEO {salud.seo_completo_pct}% completo ({salud.sin_seo_title} sin título SEO)</div>
            <div>{salud.scripts_activos} script{salud.scripts_activos === 1 ? '' : 's'} activo{salud.scripts_activos === 1 ? '' : 's'}</div>
          </div>
        </div>
      )}
    </div>
  )
}
