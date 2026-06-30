const RED = '#90263A'

const config = {
  'pollera-mujer': {
    file: '/diagrams/pollera-mujer.svg',
    labels: ['A - Cintura', 'B - Cadera', 'C - Largo'],
  },
  'pantalon-mujer': {
    file: '/diagrams/pantalon-mujer.svg',
    labels: ['A - Medida de cintura', 'B - Medida de cadera', 'C - Largo'],
  },
  'pantalon-hombre': {
    file: '/diagrams/pantalon-hombre.svg',
    labels: ['A - Medida de cintura', 'B - Medida de cadera', 'C - Largo'],
  },
  'remera-mujer': {
    file: '/diagrams/remera-mujer.svg',
    labels: ['A - Medida de hombros', 'B - Medida de sisa', 'C - Largo de frente', 'D - Largo de espalda'],
  },
  'remera-hombre': {
    file: '/diagrams/remera-hombre.svg',
    labels: ['A - Medida de hombros', 'B - Medida de sisa', 'C - Largo de frente', 'D - Largo de espalda'],
  },
  'calzado': {
    file: '/diagrams/calzado.svg',
    labels: ['A - Largo del pie', 'B - Ancho del pie'],
  },
}

export default function GarmentDiagram({ tipo }) {
  const d = config[tipo] || config['pollera-mujer']
  return (
    <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 190 }}>
      <img src={d.file} alt={tipo} style={{ width: 150, height: 'auto' }} />
      <div style={{ marginTop: 10, textAlign: 'center' }}>
        {d.labels.map((l, i) => (
          <div key={i} style={{ fontSize: 12, fontWeight: 700, color: RED, lineHeight: 1.7 }}>{l}</div>
        ))}
      </div>
    </div>
  )
}
