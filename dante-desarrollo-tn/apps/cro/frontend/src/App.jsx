import { useState, useEffect } from 'react'
import { api } from './utils/api.js'
import Header from './components/Header.jsx'
import Dashboard from './views/Dashboard.jsx'
import Experimentos from './views/Experimentos.jsx'
import TemplateList from './views/TemplateList.jsx'
import TemplateEditor from './views/TemplateEditor.jsx'

export default function App() {
  const [tiendas, setTiendas] = useState([])
  const [tiendaActiva, setTiendaActiva] = useState('')
  const [view, setView] = useState('dashboard')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    api.getTiendas()
      .then(r => {
        setTiendas(r.tiendas)
        if (r.tiendas.length) setTiendaActiva(r.tiendas[0])
      })
      .catch(console.error)
  }, [])

  function goEditor(id = null) {
    setEditingId(id)
    setView('editor')
  }

  function goList() {
    setEditingId(null)
    setView('templates')
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header
        tiendas={tiendas}
        tiendaActiva={tiendaActiva}
        onTiendaChange={setTiendaActiva}
        activeView={view === 'editor' ? 'templates' : view}
        onViewChange={setView}
      />
      <main className="max-w-7xl mx-auto px-8 py-8">
        {view === 'dashboard' && <Dashboard tienda={tiendaActiva} />}
        {view === 'experimentos' && <Experimentos tienda={tiendaActiva} />}
        {view === 'templates' && (
          <TemplateList
            onNuevo={() => goEditor(null)}
            onEditar={(id) => goEditor(id)}
          />
        )}
        {view === 'editor' && (
          <TemplateEditor
            templateId={editingId}
            tienda={tiendaActiva}
            onVolver={goList}
          />
        )}
      </main>
    </div>
  )
}
