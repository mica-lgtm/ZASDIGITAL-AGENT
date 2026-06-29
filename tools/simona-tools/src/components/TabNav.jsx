export default function TabNav({ active, onChange }) {
  const tabs = [
    { id: 'medidas', label: 'Tabla de Medidas → PNG' },
    { id: 'descripcion', label: 'Descripción → HTML + PNG' },
  ]
  return (
    <div className="flex border-b border-gray-200 mb-8">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-6 py-3 text-sm font-semibold transition-colors ${
            active === t.id
              ? 'border-b-2 border-orange text-orange'
              : 'text-gray-500 hover:text-dark'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
