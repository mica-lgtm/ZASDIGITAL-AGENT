import { forwardRef } from 'react'

const DescripcionPreview = forwardRef(function DescripcionPreview({ values }, ref) {
  const { nombre, subtitulo, temporada, material, diseno, calce, estilo, cuidados, urlTablaImg, talleModelo, modeloFotoTalle, notaTalles } = values
  const hasDetalles = material || diseno || calce || estilo
  const cuidadosList = cuidados ? cuidados.split(',').map(c => c.trim()).filter(Boolean) : []

  const detalleRow = (label, value) => !value ? null : (
    <tr key={label} style={{ borderBottom: '1px solid #f0efec' }}>
      <td style={{ padding: '11px 0', width: 95, verticalAlign: 'top' }}>
        <span style={{ fontSize: 9, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#a2897b' }}>{label}</span>
      </td>
      <td style={{ padding: '11px 0', fontSize: 13, color: '#444', lineHeight: 1.6 }}>{value}</td>
    </tr>
  )

  return (
    <div ref={ref} style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 680, backgroundColor: '#fff' }}>
      {/* Header */}
      <div style={{ background: '#e9eae5', padding: '32px 28px 26px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#90263A,#D5C792,#A2897B)' }} />
        {temporada && (
          <span style={{ display: 'inline-block', border: '1px solid #A2897B', color: '#a2897b', fontSize: 9, fontWeight: 'bold', letterSpacing: '2.5px', textTransform: 'uppercase', padding: '4px 14px', marginBottom: 16 }}>
            {temporada}
          </span>
        )}
        {nombre && <h2 style={{ fontSize: 22, fontWeight: 600, color: '#3a2a2a', lineHeight: 1.2, margin: '0 0 8px 0' }}>{nombre}</h2>}
        {subtitulo && <p style={{ color: '#a2897b', fontSize: 13, fontStyle: 'italic', margin: 0 }}>{subtitulo}</p>}
      </div>

      {/* Detalles */}
      {hasDetalles && (
        <div style={{ background: '#ffffff', padding: '24px 28px', marginTop: 2 }}>
          <p style={{ fontSize: 9, fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: '#90263a', margin: '0 0 18px 0' }}>Detalles de la prenda</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {detalleRow('Material', material)}
              {detalleRow('Diseño', diseno)}
              {detalleRow('Calce', calce)}
              {detalleRow('Estilo', estilo)}
            </tbody>
          </table>
        </div>
      )}

      {/* Cuidados */}
      {cuidadosList.length > 0 && (
        <div style={{ background: '#e9eae5', padding: '18px 28px', marginTop: 2, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: '#90263a', flexShrink: 0 }}>Cuidados</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {cuidadosList.map((c, i) => (
              <span key={i} style={{ background: '#fff', color: '#555', fontSize: 11, padding: '5px 13px' }}>❦ {c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Guía de talles */}
      {urlTablaImg && (
        <div style={{ background: '#f7f4f1', padding: '22px 28px 18px', marginTop: 2, borderTop: '1px solid #e0dbd5' }}>
          <p style={{ fontSize: 9, fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: '#90263a', margin: '0 0 14px 0' }}>Guía de talles</p>
          <img style={{ display: 'block', width: '100%', height: 'auto' }} src={urlTablaImg} alt={`Guía de talles ${nombre}`} />
        </div>
      )}

      {/* Referencia + notas */}
      {(talleModelo || modeloFotoTalle || notaTalles) && (
        <div style={{ background: '#ffffff', padding: '20px 28px 22px', marginTop: 2, borderBottom: '3px solid #90263A' }}>
          {talleModelo && (
            <div style={{ background: '#90263A', padding: '14px 20px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 15, fontWeight: 'bold', color: '#90263a' }}>A</div>
              <div>
                <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: '#d5c792', margin: '0 0 3px 0' }}>Referencia de talle</p>
                <p style={{ fontSize: 14, color: '#ffffff', fontWeight: 'bold', margin: 0 }}>{talleModelo}</p>
              </div>
            </div>
          )}
          {modeloFotoTalle && <p style={{ fontSize: 12, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', margin: '0 0 10px 0' }}>La modelo de la foto usa talle {modeloFotoTalle}</p>}
          {notaTalles && <p style={{ fontSize: 11, fontWeight: 600, color: '#1a1a1a', textAlign: 'center', fontStyle: 'italic', margin: 0 }}>{notaTalles}</p>}
        </div>
      )}
    </div>
  )
})

export default DescripcionPreview
