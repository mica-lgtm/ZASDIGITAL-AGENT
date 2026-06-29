import { useState } from 'react'
import TabNav from './components/TabNav.jsx'
import MedidasTool from './components/medidas/MedidasTool.jsx'
import DescripcionTool from './components/descripcion/DescripcionTool.jsx'

export default function App() {
  const [activeTab, setActiveTab] = useState('medidas')

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-4">
        <div className="text-xl font-bold text-dark tracking-tight">Simona Tools</div>
        <div className="text-sm text-gray-400">Herramientas internas de producto</div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8">
        <TabNav active={activeTab} onChange={setActiveTab} />

        {activeTab === 'medidas' && <MedidasTool />}
        {activeTab === 'descripcion' && <DescripcionTool />}
      </main>
    </div>
  )
}
