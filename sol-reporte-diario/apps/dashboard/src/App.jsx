import { useEffect, useMemo, useState } from 'react'
import { HOJA_DATA, HOJA_ESTRELLA, SHEET_URL } from './config.js'
import { leerHoja } from './lib/gviz.js'
import { parsearData } from './lib/parseData.js'
import { parsearEstrella } from './lib/parseEstrella.js'
import TablaDiaria from './components/TablaDiaria.jsx'
import Estrella from './components/Estrella.jsx'

export default function App() {
  const [vista, setVista] = useState('diario')
  const [bloques, setBloques] = useState(null)
  const [meses, setMeses] = useState(null)
  const [error, setError] = useState(null)
  const [bloqueIdx, setBloqueIdx] = useState(0)
  const [mesIdx, setMesIdx] = useState(null)

  useEffect(() => {
    Promise.all([leerHoja(HOJA_DATA), leerHoja(HOJA_ESTRELLA)])
      .then(([filasData, filasEstrella]) => {
        setBloques(parsearData(filasData))
        const parseados = parsearEstrella(filasEstrella)
        setMeses(parseados)
        setMesIdx(parseados.length ? parseados.length - 1 : null)
      })
      .catch((e) => setError(e.message))
  }, [])

  const cargando = !error && (bloques === null || meses === null)

  const bloque = useMemo(() => bloques?.[bloqueIdx], [bloques, bloqueIdx])
  const mes = useMemo(() => (mesIdx === null ? null : meses?.[mesIdx]), [meses, mesIdx])

  return (
    <div className="app">
      <header className="app-header">
        <h1>ZAS · Reporte de Clientes</h1>
        <span className="fuente">
          datos en vivo desde la <a href={SHEET_URL}>planilla maestra</a>
        </span>
      </header>

      <nav className="vistas">
        <button className={vista === 'diario' ? 'activa' : ''} onClick={() => setVista('diario')}>
          Tabla principal
        </button>
        <button
          className={vista === 'estrella' ? 'activa' : ''}
          onClick={() => setVista('estrella')}
        >
          Estrella (semanal)
        </button>
      </nav>

      {error && <div className="estado error">No pude leer la planilla: {error}</div>}
      {cargando && <div className="estado">Cargando datos de la planilla…</div>}

      {!cargando && !error && vista === 'diario' && (
        <>
          <div className="filtros">
            <label htmlFor="bloque">Día</label>
            <select
              id="bloque"
              value={bloqueIdx}
              onChange={(e) => setBloqueIdx(Number(e.target.value))}
            >
              {bloques.map((b, i) => (
                <option key={i} value={i}>
                  {b.etiqueta}
                  {i === 0 ? ' (último)' : ''}
                </option>
              ))}
            </select>
          </div>
          {bloque ? (
            <TablaDiaria bloque={bloque} />
          ) : (
            <div className="estado">No hay bloques de datos en la hoja DATA.</div>
          )}
        </>
      )}

      {!cargando && !error && vista === 'estrella' && (
        <>
          <div className="filtros">
            <label htmlFor="mes">Mes</label>
            <select id="mes" value={mesIdx ?? ''} onChange={(e) => setMesIdx(Number(e.target.value))}>
              {meses.map((m, i) => (
                <option key={m.mes} value={i}>
                  {m.mes}
                </option>
              ))}
            </select>
          </div>
          {mes ? (
            <Estrella mes={mes} />
          ) : (
            <div className="estado">No hay meses con datos en la hoja ESTRELLA.</div>
          )}
        </>
      )}
    </div>
  )
}
