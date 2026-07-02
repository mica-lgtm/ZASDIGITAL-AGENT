import { CANALES_DATA, CANAL_PARCIAL } from '../config.js'
import { moneda, entero, decimal } from '../lib/formato.js'
import Kpi from './Kpi.jsx'

function Celda({ valor, formato = entero, className = '' }) {
  const texto = formato(valor)
  return <td className={texto === null ? `vacia ${className}` : className}>{texto ?? '—'}</td>
}

export default function TablaDiaria({ bloque }) {
  const filas = bloque.filas

  const totInversion = filas.reduce(
    (acc, f) => acc + f.canales.reduce((a, c) => a + (c.inversion || 0), 0),
    0,
  )
  const totFacturacion = filas.reduce((acc, f) => acc + (f.facturacion || 0), 0)
  const totVentas = filas.reduce((acc, f) => acc + (f.ventas || 0), 0)
  const roi = totInversion ? totFacturacion / totInversion : null

  return (
    <>
      <div className="kpis">
        <Kpi etiqueta="Facturación total" valor={moneda(totFacturacion)} />
        <Kpi etiqueta="Inversión total" valor={moneda(totInversion)} />
        <Kpi etiqueta="Ventas" valor={entero(totVentas)} />
        <Kpi
          etiqueta="ROI general"
          valor={roi ? `${decimal(roi)}x` : '—'}
          detalle="facturación / inversión"
        />
      </div>

      <div className="tabla-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th className="grupo" colSpan={2}>
                Totales
              </th>
              {CANALES_DATA.map((canal) => (
                <th key={canal} className="grupo sep-canal" colSpan={4}>
                  {canal}
                </th>
              ))}
              <th className="grupo sep-canal" colSpan={2}>
                {CANAL_PARCIAL}
              </th>
            </tr>
            <tr>
              <th>Cliente</th>
              <th>Ventas</th>
              <th>Facturación</th>
              {CANALES_DATA.map((canal) => (
                <FragmentoEncabezado key={canal} />
              ))}
              <th className="sep-canal">Facturación</th>
              <th>Ventas</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.cliente}>
                <td className="nombre">{f.cliente}</td>
                <Celda valor={f.ventas} />
                <Celda valor={f.facturacion} formato={moneda} />
                {f.canales.map((c, i) => (
                  <FragmentoCanal key={i} canal={c} />
                ))}
                <Celda valor={f.parcial.facturacion} formato={moneda} className="sep-canal" />
                <Celda valor={f.parcial.ventas} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="nota">
        Los nombres de los canales no vienen en la hoja DATA: si algún canal muestra los números
        de otro, se corrige el orden en <code>src/config.js</code>.
      </p>
    </>
  )
}

function FragmentoEncabezado() {
  return (
    <>
      <th className="sep-canal">Inversión</th>
      <th>Facturación</th>
      <th>Ventas</th>
      <th>Visitas</th>
    </>
  )
}

function FragmentoCanal({ canal }) {
  return (
    <>
      <Celda valor={canal.inversion} formato={moneda} className="sep-canal" />
      <Celda valor={canal.facturacion} formato={moneda} />
      <Celda valor={canal.ventas} />
      <Celda valor={canal.visitas} />
    </>
  )
}
