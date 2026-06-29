import { forwardRef } from 'react'
import GarmentDiagram from './GarmentDiagram.jsx'

const TablePreview = forwardRef(function TablePreview({ parsed, nombreProducto, tipoGarment }, ref) {
  if (!parsed) return null

  const { headers, rows } = parsed

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: '#FDF8F4',
        padding: '48px 56px',
        display: 'flex',
        alignItems: 'center',
        gap: 56,
        width: 860,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Left: garment diagram */}
      <GarmentDiagram tipo={tipoGarment} />

      {/* Right: name + table */}
      <div style={{ flex: 1 }}>
        {nombreProducto && (
          <div style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 38,
            fontWeight: 400,
            color: '#111',
            marginBottom: 28,
            lineHeight: 1.1,
          }}>
            {nombreProducto}
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    backgroundColor: '#C4917A',
                    color: '#fff',
                    padding: '12px 20px',
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: '1px solid #e8e0da' }}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      padding: '14px 20px',
                      textAlign: 'center',
                      fontSize: 14,
                      fontWeight: ci === 0 ? 700 : 400,
                      color: '#111',
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})

export default TablePreview
