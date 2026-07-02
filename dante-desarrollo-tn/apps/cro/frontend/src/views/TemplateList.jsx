import { useState, useEffect } from 'react'
import { api } from '../utils/api.js'

export default function TemplateList({ onNuevo, onEditar }) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api.getTemplates()
      .then(setTemplates)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleDelete(id, nombre) {
    if (!confirm(`Borrar "${nombre}"?`)) return
    await api.deleteTemplate(id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-dark">Templates de producto</h1>
        <button
          onClick={onNuevo}
          className="bg-dark text-white px-4 py-2 rounded text-sm font-semibold hover:opacity-80 transition"
        >
          + Nuevo template
        </button>
      </div>

      {loading && <div className="text-gray-400 text-sm">Cargando...</div>}

      {!loading && templates.length === 0 && (
        <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
          No hay templates todavía. Creá el primero.
        </div>
      )}

      <div className="space-y-3">
        {templates.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-100 px-6 py-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="font-semibold text-dark text-sm">{t.nombre}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Actualizado {new Date(t.updated_at).toLocaleDateString('es-AR')}
              </div>
            </div>
            <button
              onClick={() => onEditar(t.id)}
              className="text-sm text-orange font-semibold hover:opacity-70 transition"
            >
              Editar
            </button>
            <button
              onClick={() => handleDelete(t.id, t.nombre)}
              className="text-sm text-gray-400 hover:text-red-500 transition"
            >
              Borrar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
