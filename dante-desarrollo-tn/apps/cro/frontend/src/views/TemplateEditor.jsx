import { useState, useEffect } from 'react'
import { api } from '../utils/api.js'

const VARIABLES = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'precio', label: 'Precio' },
  { key: 'precio_promo', label: 'Precio promo' },
  { key: 'descripcion', label: 'Descripción actual' },
  { key: 'imagen', label: 'Imagen' },
  { key: 'variantes', label: 'Variantes (lista)' },
  { key: 'categorias', label: 'Categorías (lista)' },
]

export default function TemplateEditor({ templateId, tienda, onVolver }) {
  const [nombre, setNombre] = useState('')
  const [html, setHtml] = useState('')
  const [productos, setProductos] = useState([])
  const [productoId, setProductoId] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [variables, setVariables] = useState({})
  const [saving, setSaving] = useState(false)
  const [previewing, setPreviewing] = useState(false)

  useEffect(() => {
    if (templateId) {
      api.getTemplates().then(ts => {
        const t = ts.find(x => x.id === templateId)
        if (t) { setNombre(t.nombre); setHtml(t.html) }
      })
    }
  }, [templateId])

  useEffect(() => {
    if (!tienda) return
    api.getProductos(tienda, busqueda)
      .then(ps => {
        setProductos(ps)
        if (ps.length && !productoId) setProductoId(String(ps[0].id))
      })
      .catch(console.error)
  }, [tienda, busqueda])

  async function handlePreview() {
    if (!productoId || !html) return
    if (!templateId) {
      const t = await api.createTemplate(nombre || 'Preview temp', html)
      setPreviewing(true)
      try {
        const res = await api.preview(tienda, Number(productoId), t.id)
        setPreviewHtml(res.html)
        setVariables(res.variables)
      } finally {
        await api.deleteTemplate(t.id)
        setPreviewing(false)
      }
      return
    }
    setPreviewing(true)
    try {
      const res = await api.preview(tienda, Number(productoId), templateId)
      setPreviewHtml(res.html)
      setVariables(res.variables)
    } finally {
      setPreviewing(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (templateId) {
        await api.updateTemplate(templateId, nombre, html)
      } else {
        await api.createTemplate(nombre, html)
      }
      onVolver()
    } finally {
      setSaving(false)
    }
  }

  function insertVariable(key) {
    const tag = `{{${key}}}`
    setHtml(prev => prev + tag)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onVolver}
          className="text-sm text-gray-400 hover:text-dark transition flex items-center gap-1"
        >
          ← Volver
        </button>
        <span className="text-gray-200">/</span>
        <span className="text-sm text-dark font-semibold">
          {templateId ? 'Editar template' : 'Nuevo template'}
        </span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={handlePreview}
            disabled={!html || !productoId || previewing}
            className="px-4 py-2 text-sm border border-gray-200 rounded font-semibold hover:border-dark transition disabled:opacity-40"
          >
            {previewing ? 'Generando...' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={!nombre || !html || saving}
            className="px-4 py-2 text-sm bg-dark text-white rounded font-semibold hover:opacity-80 transition disabled:opacity-40"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <input
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        placeholder="Nombre del template (ej: Ficha completa v1)"
        className="w-full border border-gray-200 rounded px-4 py-2.5 text-sm mb-6 focus:outline-none focus:border-dark"
      />

      <div className="grid grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">HTML</span>
            <span className="text-xs text-gray-300 ml-auto">Variables disponibles:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {VARIABLES.map(v => (
              <button
                key={v.key}
                onClick={() => insertVariable(v.key)}
                className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:border-dark transition font-mono"
              >
                {`{{${v.key}}}`}
              </button>
            ))}
          </div>
          <textarea
            value={html}
            onChange={e => setHtml(e.target.value)}
            rows={24}
            placeholder={'<div>\n  <h2>{{nombre}}</h2>\n  <p>Precio: ${{precio}}</p>\n</div>'}
            className="w-full border border-gray-200 rounded px-4 py-3 text-xs font-mono focus:outline-none focus:border-dark resize-none"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Preview</span>
          </div>
          <div className="flex gap-2 mb-3">
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar producto..."
              className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-dark"
            />
            <select
              value={productoId}
              onChange={e => setProductoId(e.target.value)}
              className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-dark"
            >
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre || `Producto ${p.id}`}
                </option>
              ))}
            </select>
          </div>

          {previewHtml ? (
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div
                className="bg-white"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
              Escribí HTML y presioná Preview
            </div>
          )}

          {Object.keys(variables).length > 0 && (
            <div className="mt-4 bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Variables del producto
              </div>
              <div className="space-y-1">
                {Object.entries(variables).map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-xs">
                    <span className="font-mono text-orange w-28 shrink-0">{`{{${k}}}`}</span>
                    <span className="text-gray-500 truncate">
                      {Array.isArray(v) ? v.join(', ') : String(v).slice(0, 80)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
