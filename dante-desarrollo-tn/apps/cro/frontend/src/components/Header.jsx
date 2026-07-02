const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'templates', label: 'Templates' },
  { id: 'experimentos', label: 'Experimentos' },
]

export default function Header({ tiendas, tiendaActiva, onTiendaChange, activeView, onViewChange }) {
  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-6">
      <div className="text-lg font-bold text-dark tracking-tight">Dante CRO</div>
      <nav className="flex gap-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`px-3 py-1.5 text-sm rounded ${
              activeView === tab.id
                ? 'bg-dark text-white'
                : 'text-gray-500 hover:text-dark'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Tienda</span>
        <select
          value={tiendaActiva}
          onChange={e => onTiendaChange(e.target.value)}
          className="border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-orange"
        >
          {tiendas.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>
    </header>
  )
}
