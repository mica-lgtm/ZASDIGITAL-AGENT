import { useState, useEffect } from 'react'
import { api } from '../utils/api.js'

const BADGES = {
  ganador: { emoji: '🟢', label: 'Ganador', cls: 'bg-green-50 text-green-700' },
  perdedor: { emoji: '🔴', label: 'Perdedor', cls: 'bg-red-50 text-red-700' },
  activo: { emoji: '🟡', label: 'Activo', cls: 'bg-yellow-50 text-yellow-700' },
  completo: { emoji: '⚪', label: 'Completo', cls: 'bg-gray-50 text-gray-600' },
}

export default function Experimentos({ tienda }) {
  const [experimentos, setExperimentos] = useState(null)
  const [rollbackEnCurso, setRollbackEnCurso] = useState(null)

  function cargar() {
    api.getExperimentos(tienda).then(setExperimentos).catch(console.error)
  }

  useEffect(() => {
    if (!tienda) return
    setExperimentos(null)
    cargar()
  }, [tienda])

  async function rollback(scriptId) {
    if (!confirm(`¿Eliminar el script ${scriptId} de ${tienda}?`)) return
    setRollbackEnCurso(scriptId)
    try {
      await api.rollbackScript(tienda, scriptId)
      cargar()
    } catch (e) {
      alert(`No se pudo hacer rollback: ${e}`)
    } finally {
      setRollbackEnCurso(null)
    }
  }

  if (!tienda) return null
  if (experimentos === null) {
    return <div className="text-sm text-gray-400">Cargando experimentos…</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-dark">Experimentos</h2>

      {experimentos.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-8 text-center text-sm text-gray-400">
          No hay experimentos en {tienda.replace(/_/g, ' ')}. Ver <code>playbooks/</code> para arrancar uno.
        </div>
      ) : (
        <div className="space-y-3">
          {experimentos.map(exp => {
            const badge = BADGES[exp.status] || BADGES.completo
            return (
              <div
                key={`${exp.tienda}/${exp.slug}`}
                className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-4"
              >
                <span className={`text-xs px-2 py-1 rounded-full ${badge.cls}`}>
                  {badge.emoji} {badge.label}
                </span>
                <div className="font-medium text-dark flex-1">{exp.slug}</div>
                {exp.status === 'activo' && exp.script_ids.map(id => (
                  <button
                    key={id}
                    onClick={() => rollback(id)}
                    disabled={rollbackEnCurso === id}
                    className="text-xs px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {rollbackEnCurso === id ? 'Eliminando…' : `Rollback script ${id}`}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
