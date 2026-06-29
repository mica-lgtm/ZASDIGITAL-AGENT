// SVG diagrams per garment type showing measurement points A, B, C
const diagrams = {
  falda: (
    <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Skirt body */}
      <path d="M70 40 Q100 35 130 40 L155 200 Q100 215 45 200 Z" stroke="#222" strokeWidth="2" fill="none"/>
      {/* Waistband */}
      <rect x="68" y="30" width="64" height="14" rx="3" stroke="#222" strokeWidth="2" fill="none"/>
      {/* Pleats */}
      <line x1="100" y1="44" x2="100" y2="200" stroke="#222" strokeWidth="1" strokeDasharray="4 3"/>
      <line x1="80" y1="46" x2="68" y2="195" stroke="#222" strokeWidth="1" strokeDasharray="4 3"/>
      <line x1="120" y1="46" x2="132" y2="195" stroke="#222" strokeWidth="1" strokeDasharray="4 3"/>
      {/* Measurement lines */}
      {/* A - Cintura */}
      <line x1="68" y1="37" x2="132" y2="37" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="68" cy="37" r="3" fill="#c0392b"/>
      <circle cx="132" cy="37" r="3" fill="#c0392b"/>
      <text x="52" y="33" fill="#c0392b" fontSize="14" fontWeight="bold">A</text>
      {/* B - Cadera */}
      <line x1="58" y1="100" x2="142" y2="100" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="58" cy="100" r="3" fill="#c0392b"/>
      <circle cx="142" cy="100" r="3" fill="#c0392b"/>
      <text x="40" y="104" fill="#c0392b" fontSize="14" fontWeight="bold">B</text>
      {/* C - Largo */}
      <line x1="100" y1="37" x2="100" y2="205" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="100" cy="205" r="3" fill="#c0392b"/>
      <text x="105" y="218" fill="#c0392b" fontSize="14" fontWeight="bold">C</text>
    </svg>
  ),
  pantalon: (
    <svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Waist */}
      <rect x="60" y="20" width="80" height="16" rx="3" stroke="#222" strokeWidth="2" fill="none"/>
      {/* Legs */}
      <path d="M60 36 L50 220 L90 220 L100 100 L110 220 L150 220 L140 36 Z" stroke="#222" strokeWidth="2" fill="none"/>
      {/* A - Cintura */}
      <line x1="60" y1="28" x2="140" y2="28" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="60" cy="28" r="3" fill="#c0392b"/>
      <circle cx="140" cy="28" r="3" fill="#c0392b"/>
      <text x="42" y="32" fill="#c0392b" fontSize="14" fontWeight="bold">A</text>
      {/* B - Cadera */}
      <line x1="53" y1="80" x2="147" y2="80" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="53" cy="80" r="3" fill="#c0392b"/>
      <circle cx="147" cy="80" r="3" fill="#c0392b"/>
      <text x="35" y="84" fill="#c0392b" fontSize="14" fontWeight="bold">B</text>
      {/* C - Largo total */}
      <line x1="155" y1="28" x2="155" y2="220" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="155" cy="220" r="3" fill="#c0392b"/>
      <text x="160" y="130" fill="#c0392b" fontSize="14" fontWeight="bold">C</text>
    </svg>
  ),
  remera: (
    <svg viewBox="0 0 220 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <path d="M75 60 L55 90 L75 95 L70 210 L150 210 L145 95 L165 90 L145 60 Q130 50 110 48 Q90 50 75 60Z" stroke="#222" strokeWidth="2" fill="none"/>
      {/* Neck */}
      <path d="M92 60 Q110 72 128 60" stroke="#222" strokeWidth="2" fill="none"/>
      {/* A - Ancho hombros */}
      <line x1="75" y1="62" x2="145" y2="62" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="75" cy="62" r="3" fill="#c0392b"/>
      <circle cx="145" cy="62" r="3" fill="#c0392b"/>
      <text x="55" y="58" fill="#c0392b" fontSize="14" fontWeight="bold">A</text>
      {/* B - Busto */}
      <line x1="68" y1="115" x2="152" y2="115" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="68" cy="115" r="3" fill="#c0392b"/>
      <circle cx="152" cy="115" r="3" fill="#c0392b"/>
      <text x="50" y="119" fill="#c0392b" fontSize="14" fontWeight="bold">B</text>
      {/* C - Largo */}
      <line x1="165" y1="62" x2="165" y2="210" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="165" cy="210" r="3" fill="#c0392b"/>
      <text x="170" y="140" fill="#c0392b" fontSize="14" fontWeight="bold">C</text>
    </svg>
  ),
  vestido: (
    <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M75 30 Q100 24 125 30 L135 80 L160 260 Q100 270 40 260 L65 80 Z" stroke="#222" strokeWidth="2" fill="none"/>
      <path d="M88 30 Q100 40 112 30" stroke="#222" strokeWidth="2" fill="none"/>
      <line x1="75" y1="30" x2="125" y2="30" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="75" cy="30" r="3" fill="#c0392b"/>
      <circle cx="125" cy="30" r="3" fill="#c0392b"/>
      <text x="55" y="27" fill="#c0392b" fontSize="14" fontWeight="bold">A</text>
      <line x1="62" y1="100" x2="138" y2="100" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="62" cy="100" r="3" fill="#c0392b"/>
      <circle cx="138" cy="100" r="3" fill="#c0392b"/>
      <text x="44" y="104" fill="#c0392b" fontSize="14" fontWeight="bold">B</text>
      <line x1="100" y1="30" x2="100" y2="262" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="100" cy="262" r="3" fill="#c0392b"/>
      <text x="105" y="275" fill="#c0392b" fontSize="14" fontWeight="bold">C</text>
    </svg>
  ),
  saco: (
    <svg viewBox="0 0 220 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M80 40 L55 80 L70 88 L65 230 L155 230 L150 88 L165 80 L140 40 Q130 34 110 32 Q90 34 80 40Z" stroke="#222" strokeWidth="2" fill="none"/>
      <path d="M95 40 Q110 55 125 40" stroke="#222" strokeWidth="2" fill="none"/>
      <path d="M110 55 L102 95 M110 55 L118 95" stroke="#222" strokeWidth="1.5"/>
      <line x1="80" y1="42" x2="140" y2="42" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="80" cy="42" r="3" fill="#c0392b"/>
      <circle cx="140" cy="42" r="3" fill="#c0392b"/>
      <text x="60" y="38" fill="#c0392b" fontSize="14" fontWeight="bold">A</text>
      <line x1="64" y1="110" x2="156" y2="110" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="64" cy="110" r="3" fill="#c0392b"/>
      <circle cx="156" cy="110" r="3" fill="#c0392b"/>
      <text x="46" y="114" fill="#c0392b" fontSize="14" fontWeight="bold">B</text>
      <line x1="165" y1="42" x2="165" y2="230" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="165" cy="230" r="3" fill="#c0392b"/>
      <text x="170" y="140" fill="#c0392b" fontSize="14" fontWeight="bold">C</text>
    </svg>
  ),
  buzo: (
    <svg viewBox="0 0 220 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M75 50 L45 95 L72 105 L68 220 L152 220 L148 105 L175 95 L145 50 Q128 42 110 40 Q92 42 75 50Z" stroke="#222" strokeWidth="2" fill="none"/>
      <path d="M92 50 Q110 62 128 50" stroke="#222" strokeWidth="2" fill="none"/>
      <line x1="75" y1="52" x2="145" y2="52" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="75" cy="52" r="3" fill="#c0392b"/>
      <circle cx="145" cy="52" r="3" fill="#c0392b"/>
      <text x="55" y="48" fill="#c0392b" fontSize="14" fontWeight="bold">A</text>
      <line x1="66" y1="115" x2="154" y2="115" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="66" cy="115" r="3" fill="#c0392b"/>
      <circle cx="154" cy="115" r="3" fill="#c0392b"/>
      <text x="48" y="119" fill="#c0392b" fontSize="14" fontWeight="bold">B</text>
      <line x1="165" y1="52" x2="165" y2="220" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="165" cy="220" r="3" fill="#c0392b"/>
      <text x="170" y="140" fill="#c0392b" fontSize="14" fontWeight="bold">C</text>
    </svg>
  ),
}

const labels = {
  falda: ['A - Cintura', 'B - Cadera', 'C - Largo'],
  pantalon: ['A - Cintura', 'B - Cadera', 'C - Largo'],
  remera: ['A - Hombros', 'B - Busto', 'C - Largo'],
  vestido: ['A - Cintura', 'B - Cadera', 'C - Largo'],
  saco: ['A - Hombros', 'B - Busto', 'C - Largo'],
  buzo: ['A - Hombros', 'B - Busto', 'C - Largo'],
}

export default function GarmentDiagram({ tipo }) {
  const svg = diagrams[tipo] || diagrams.falda
  const lbs = labels[tipo] || labels.falda
  return (
    <div className="bg-white rounded-xl p-4 flex flex-col items-center" style={{ width: 200 }}>
      <div style={{ width: 160 }}>{svg}</div>
      <div className="mt-3 text-center">
        {lbs.map((l, i) => (
          <div key={i} className="text-sm font-semibold" style={{ color: '#c0392b' }}>{l}</div>
        ))}
      </div>
    </div>
  )
}
