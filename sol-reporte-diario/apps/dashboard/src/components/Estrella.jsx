import { METRICAS_ORDEN } from '../lib/parseEstrella.js'
import { moneda, entero, decimal } from '../lib/formato.js'
import Kpi from './Kpi.jsx'

function formatoMetrica(metrica, valor) {
  if (valor === null || valor === undefined) return null
  if (metrica === 'Inversión' || metrica === 'Facturación') return moneda(valor)
  if (metrica === 'Ventas') return entero(valor)
  if (metrica === 'ROI') return `${decimal(valor)}x`
  return String(valor)
}

function claseRoi(metrica, valor) {
  if (metrica !== 'ROI' || valor === null || valor === undefined) return ''
  return valor >= 1 ? 'roi-bueno' : 'roi-malo'
}

export default function Estrella({ mes }) {
  const clientes = mes.clientes.map((c) => c.nombre)
  const semanas = mes.periodos.filter((p) => p.nombre.toUpperCase() !== 'TOTAL')
  const totalPeriodo = mes.periodos.find((p) => p.nombre.toUpperCase() === 'TOTAL')

  const kpi = (metrica) => totalPeriodo?.metricas[metrica]?.total ?? null

  return (
    <>
      <div className="kpis">
        <Kpi etiqueta={`Inversión ${mes.mes.toLowerCase()}`} valor={moneda(kpi('Inversión'))} />
        <Kpi etiqueta={`Facturación ${mes.mes.toLowerCase()}`} valor={moneda(kpi('Facturación'))} />
        <Kpi etiqueta={`Ventas ${mes.mes.toLowerCase()}`} valor={entero(kpi('Ventas'))} />
        <Kpi
          etiqueta="ROI del mes"
          valor={
            kpi('Facturación') && kpi('Inversión')
              ? `${decimal(kpi('Facturación') / kpi('Inversión'))}x`
              : '—'
          }
          detalle="facturación / inversión"
        />
      </div>

      <div className="tabla-wrap">
        <table>
          <thead>
            <tr>
              <th>Semana · Métrica</th>
              {clientes.map((c) => (
                <th key={c}>{c}</th>
              ))}
              <th className="sep-canal">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {[...semanas, ...(totalPeriodo ? [totalPeriodo] : [])].map((periodo) => (
              <FilasPeriodo key={periodo.nombre} periodo={periodo} clientes={clientes} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function FilasPeriodo({ periodo, clientes }) {
  const esTotal = periodo.nombre.toUpperCase() === 'TOTAL'
  const metricas = METRICAS_ORDEN.filter((m) => periodo.metricas[m])
  return metricas.map((metrica, i) => {
    const datos = periodo.metricas[metrica]
    return (
      <tr key={`${periodo.nombre}-${metrica}`} className={esTotal && i === 0 ? 'total' : ''}>
        <td className="metrica">
          {i === 0 ? <strong>{periodo.nombre}</strong> : null} {i === 0 ? '· ' : ''}
          {metrica}
        </td>
        {clientes.map((c) => {
          const v = datos.porCliente[c]
          const texto = formatoMetrica(metrica, v)
          return (
            <td key={c} className={texto === null ? 'vacia' : claseRoi(metrica, v)}>
              {texto ?? '—'}
            </td>
          )
        })}
        <td className="sep-canal">
          <strong>{formatoMetrica(metrica, datos.total) ?? '—'}</strong>
        </td>
      </tr>
    )
  })
}
