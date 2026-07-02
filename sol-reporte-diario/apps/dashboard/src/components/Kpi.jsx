export default function Kpi({ etiqueta, valor, detalle }) {
  return (
    <div className="kpi">
      <div className="etiqueta">{etiqueta}</div>
      <div className="valor">{valor ?? '—'}</div>
      {detalle && <div className="detalle">{detalle}</div>}
    </div>
  )
}
