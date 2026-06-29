import { forwardRef } from 'react'

const DescripcionPreview = forwardRef(function DescripcionPreview({ values }, ref) {
  const { nombre, subtitulo, temporada, material, diseno, calce, estilo, cuidados, talleModelo, notaTalles } = values
  const hasDetalles = material || diseno || calce || estilo
  const cuidadosList = cuidados ? cuidados.split(',').map(c => c.trim()).filter(Boolean) : []

  return (
    <div
      ref={ref}
      style={{
        fontFamily: "'DM Sans', sans-serif",
        color: '#111',
        maxWidth: 680,
        lineHeight: 1.6,
        backgroundColor: '#fff',
        padding: '32px',
      }}
    >
      {/* Header box */}
      <div style={{ textAlign: 'center', border: '1px solid #C4917A', padding: '20px 28px', marginBottom: 24 }}>
        {temporada && (
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: '#C4917A', textTransform: 'uppercase', marginBottom: 8 }}>
            {temporada}
          </div>
        )}
        {nombre && (
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{nombre}</div>
        )}
        {subtitulo && (
          <div style={{ fontSize: 13, fontStyle: 'italic', color: '#C4917A' }}>{subtitulo}</div>
        )}
      </div>

      {/* Detalles */}
      {hasDetalles && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#888', borderBottom: '2px solid #f0ebe6', paddingBottom: 6, marginBottom: 0 }}>
            DETALLES DE LA PRENDA
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {[['MATERIAL', material], ['DISEÑO', diseno], ['CALCE', calce], ['ESTILO', estilo]].filter(([, v]) => v).map(([label, value]) => (
              <tr key={label}>
                <td style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#888', width: 90, verticalAlign: 'top' }}>{label}</td>
                <td style={{ padding: '10px 16px', fontSize: 13, color: '#222', borderBottom: '1px solid #f0ebe6' }}>{value}</td>
              </tr>
            ))}
          </table>
        </div>
      )}

      {/* Cuidados */}
      {cuidadosList.length > 0 && (
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: '#f5f0eb', padding: '10px 16px' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginRight: 8 }}>CUIDADOS</span>
          {cuidadosList.map((c, i) => (
            <span key={i} style={{ display: 'inline-block', border: '1px solid #ccc', borderRadius: 4, padding: '3px 10px', fontSize: 11, color: '#444' }}>
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Referencia de talle */}
      {talleModelo && (
        <div style={{ background: '#C4917A', color: '#fff', padding: '12px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ background: '#fff', color: '#C4917A', fontWeight: 700, fontSize: 11, width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>A</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>REFERENCIA DE TALLE</span>
          <span style={{ fontSize: 13 }}>{talleModelo}</span>
        </div>
      )}

      {notaTalles && (
        <div style={{ fontSize: 12, color: '#888', textAlign: 'center', marginTop: 8 }}>{notaTalles}</div>
      )}
    </div>
  )
})

export default DescripcionPreview
