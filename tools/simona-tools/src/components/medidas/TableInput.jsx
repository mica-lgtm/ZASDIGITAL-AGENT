export default function TableInput({ value, onChange, nombreProducto, onNombreChange, tipoGarment, onTipoGarmentChange }) {
  const garments = [
    { value: 'falda', label: 'Falda / Pollera' },
    { value: 'jean', label: 'Jean / Pantalón' },
    { value: 'pantalon', label: 'Pantalón wide leg / jogger' },
    { value: 'remera', label: 'Remera / Top' },
    { value: 'buzo', label: 'Buzo / Campera oversized' },
    { value: 'vestido', label: 'Vestido' },
    { value: 'saco', label: 'Saco / Blazer' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
            Nombre del producto
          </label>
          <input
            type="text"
            value={nombreProducto}
            onChange={e => onNombreChange(e.target.value)}
            placeholder="Falda Lias Chocolate"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
            Tipo de prenda
          </label>
          <select
            value={tipoGarment}
            onChange={e => onTipoGarmentChange(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange"
          >
            {garments.map(g => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
          Tabla de medidas
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Pegá desde Excel/Sheets (TSV), con pipes | o con espacios. La primera fila es el encabezado.
        </p>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={`MEDIDAS\tCINTURA\tCADERA\tLARGO\nTALLE S\t35 CM\t48 CM\t34 CM\nTALLE M\t37 CM\t50 CM\t34 CM\nTALLE L\t39 CM\t52 CM\t35 CM\nTALLE XL\t41 CM\t54 CM\t36 CM`}
          rows={8}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-orange resize-none"
        />
      </div>
    </div>
  )
}
