import { useRef, useState } from 'react'
import TableInput from './TableInput.jsx'
import TablePreview from './TablePreview.jsx'
import { parseTable } from '../../utils/parseTable.js'
import { exportElementAsPng } from '../../utils/exportPng.js'

export default function MedidasTool() {
  const [raw, setRaw] = useState('')
  const [nombreProducto, setNombreProducto] = useState('')
  const [tipoGarment, setTipoGarment] = useState('pollera-mujer')
  const [loading, setLoading] = useState(false)
  const previewRef = useRef(null)

  const parsed = parseTable(raw)

  async function handleDownload() {
    if (!previewRef.current) return
    setLoading(true)
    try {
      const filename = nombreProducto
        ? `tabla-medidas-${nombreProducto.toLowerCase().replace(/\s+/g, '-')}.png`
        : 'tabla-medidas.png'
      await exportElementAsPng(previewRef, filename)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Inputs */}
      <div>
        <h2 className="text-lg font-bold mb-4">Datos de la tabla</h2>
        <TableInput
          value={raw}
          onChange={setRaw}
          nombreProducto={nombreProducto}
          onNombreChange={setNombreProducto}
          tipoGarment={tipoGarment}
          onTipoGarmentChange={setTipoGarment}
        />

        <button
          onClick={handleDownload}
          disabled={!parsed || loading}
          className="mt-6 w-full bg-orange text-white py-3 rounded font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition"
        >
          {loading ? 'Generando PNG...' : '⬇ Descargar PNG'}
        </button>
      </div>

      {/* Preview */}
      <div>
        <h2 className="text-lg font-bold mb-4">Vista previa</h2>
        {parsed ? (
          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <TablePreview
              ref={previewRef}
              parsed={parsed}
              nombreProducto={nombreProducto}
              tipoGarment={tipoGarment}
            />
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
            Pegá la tabla de medidas para ver la preview
          </div>
        )}
      </div>
    </div>
  )
}
