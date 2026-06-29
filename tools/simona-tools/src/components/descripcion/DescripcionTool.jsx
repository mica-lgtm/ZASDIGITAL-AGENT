import { useRef, useState } from 'react'
import DescripcionInput from './DescripcionInput.jsx'
import DescripcionPreview from './DescripcionPreview.jsx'
import HtmlOutput from './HtmlOutput.jsx'
import { generateHtml } from '../../utils/generateHtml.js'
import { exportElementAsPng } from '../../utils/exportPng.js'

const EMPTY = {
  nombre: '',
  subtitulo: '',
  temporada: '',
  material: '',
  diseno: '',
  calce: '',
  estilo: '',
  cuidados: '',
  urlTablaImg: '',
  talleModelo: '',
  modeloFotoTalle: '',
  notaTalles: '',
}

export default function DescripcionTool() {
  const [values, setValues] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const previewRef = useRef(null)

  const html = generateHtml(values)
  const hasContent = Object.values(values).some(v => v.trim())

  async function handleDownload() {
    if (!previewRef.current) return
    setLoading(true)
    try {
      const filename = values.nombre
        ? `descripcion-${values.nombre.toLowerCase().replace(/\s+/g, '-')}.png`
        : 'descripcion.png'
      await exportElementAsPng(previewRef, filename)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Inputs */}
      <div>
        <h2 className="text-lg font-bold mb-4">Datos del producto</h2>
        <DescripcionInput values={values} onChange={setValues} />

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={!hasContent || loading}
            className="flex-1 bg-dark text-white py-3 rounded font-semibold text-sm disabled:opacity-40 hover:opacity-80 transition"
          >
            {loading ? 'Generando PNG...' : '⬇ Descargar PNG'}
          </button>
        </div>
      </div>

      {/* Preview + HTML */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold mb-4">Vista previa</h2>
          {hasContent ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
              <DescripcionPreview ref={previewRef} values={values} />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
              Completá los campos para ver la preview
            </div>
          )}
        </div>

        {hasContent && (
          <HtmlOutput html={html} />
        )}
      </div>
    </div>
  )
}
