const RED = '#90263A'
const STROKE = '#222'
const SW = 2.5

const diagrams = {
  jean: {
    labels: ['A - Medida de cintura', 'B - Medida de cadera', 'C - Largo'],
    svg: (
      <svg viewBox="0 0 220 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Waistband */}
        <rect x="55" y="28" width="110" height="18" rx="2" stroke={STROKE} strokeWidth={SW} fill="none"/>
        {/* Belt loops */}
        <rect x="70" y="24" width="8" height="10" rx="1" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        <rect x="142" y="24" width="8" height="10" rx="1" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        <rect x="105" y="22" width="10" height="12" rx="1" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        {/* Button */}
        <circle cx="110" cy="34" r="4" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        <circle cx="110" cy="34" r="1.5" fill={STROKE}/>
        {/* Left pocket */}
        <path d="M58 46 Q72 44 82 52 L80 70 L58 70 Z" stroke={STROKE} strokeWidth="1.5" fill="none" strokeDasharray="3 2"/>
        {/* Right pocket */}
        <path d="M162 46 Q148 44 138 52 L140 70 L162 70 Z" stroke={STROKE} strokeWidth="1.5" fill="none" strokeDasharray="3 2"/>
        {/* Legs */}
        <path d="M55 46 L40 270 L95 270 L110 130 L125 270 L180 270 L165 46 Z" stroke={STROKE} strokeWidth={SW} fill="none"/>
        {/* Crotch seam */}
        <path d="M95 130 Q110 150 125 130" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        {/* Leg seam dashes */}
        <line x1="68" y1="130" x2="55" y2="268" stroke={STROKE} strokeWidth="1" strokeDasharray="4 3"/>
        <line x1="152" y1="130" x2="165" y2="268" stroke={STROKE} strokeWidth="1" strokeDasharray="4 3"/>
        {/* A - Cintura */}
        <line x1="55" y1="36" x2="165" y2="36" stroke={RED} strokeWidth="1.8"/>
        <circle cx="55" cy="36" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="165" cy="36" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="110" cy="36" r="3" fill={RED}/>
        <text x="28" y="32" fill={RED} fontSize="15" fontWeight="bold" fontFamily="serif">A</text>
        {/* B - Cadera */}
        <line x1="50" y1="95" x2="170" y2="95" stroke={RED} strokeWidth="1.8"/>
        <circle cx="50" cy="95" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="170" cy="95" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <text x="26" y="100" fill={RED} fontSize="15" fontWeight="bold" fontFamily="serif">B</text>
        {/* C - Largo */}
        <line x1="110" y1="36" x2="110" y2="270" stroke={RED} strokeWidth="1.8"/>
        <circle cx="110" cy="270" r="4" fill={RED}/>
        <text x="60" y="290" fill={RED} fontSize="15" fontWeight="bold" fontFamily="serif">C</text>
      </svg>
    )
  },
  pantalon: {
    labels: ['A - Medida de cintura', 'B - Medida de cadera', 'C - Largo'],
    svg: (
      <svg viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Waistband with tie */}
        <rect x="50" y="22" width="100" height="20" rx="10" stroke={STROKE} strokeWidth={SW} fill="none"/>
        {/* Bow/tie */}
        <path d="M90 32 Q100 28 110 32 Q100 36 90 32Z" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        <line x1="100" y1="32" x2="100" y2="42" stroke={STROKE} strokeWidth="1.5"/>
        {/* Wide legs */}
        <path d="M50 42 L20 272 L90 272 L100 120 L110 272 L180 272 L150 42 Z" stroke={STROKE} strokeWidth={SW} fill="none"/>
        {/* A - Cintura */}
        <line x1="50" y1="32" x2="150" y2="32" stroke={RED} strokeWidth="1.8"/>
        <circle cx="50" cy="32" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="150" cy="32" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="100" cy="32" r="3" fill={RED}/>
        <text x="26" y="28" fill={RED} fontSize="15" fontWeight="bold" fontFamily="serif">A</text>
        {/* B - Cadera */}
        <line x1="42" y1="88" x2="158" y2="88" stroke={RED} strokeWidth="1.8"/>
        <circle cx="42" cy="88" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="158" cy="88" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <text x="20" y="93" fill={RED} fontSize="15" fontWeight="bold" fontFamily="serif">B</text>
        {/* C - Largo */}
        <line x1="100" y1="32" x2="100" y2="272" stroke={RED} strokeWidth="1.8"/>
        <circle cx="100" cy="272" r="4" fill={RED}/>
        <text x="55" y="292" fill={RED} fontSize="15" fontWeight="bold" fontFamily="serif">C</text>
      </svg>
    )
  },
  falda: {
    labels: ['A - Cintura', 'B - Cadera', 'C - Largo'],
    svg: (
      <svg viewBox="0 0 220 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Waistband */}
        <path d="M62 30 Q110 24 158 30 L155 50 Q110 44 65 50 Z" stroke={STROKE} strokeWidth={SW} fill="none"/>
        {/* Pleated skirt body */}
        <path d="M65 50 Q30 160 18 230 Q110 248 202 230 Q190 160 155 50 Z" stroke={STROKE} strokeWidth={SW} fill="none"/>
        {/* Pleats */}
        <path d="M80 52 Q72 150 60 228" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        <path d="M95 51 Q95 150 90 228" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        <path d="M110 50 Q112 150 110 228" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        <path d="M125 51 Q128 150 130 228" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        <path d="M140 52 Q148 150 158 228" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        {/* A - Cintura */}
        <line x1="62" y1="38" x2="158" y2="38" stroke={RED} strokeWidth="1.8"/>
        <circle cx="62" cy="38" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="158" cy="38" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="110" cy="38" r="3" fill={RED}/>
        <text x="36" y="34" fill={RED} fontSize="15" fontWeight="bold" fontFamily="serif">A</text>
        {/* B - Cadera */}
        <line x1="30" y1="120" x2="190" y2="120" stroke={RED} strokeWidth="1.8"/>
        <circle cx="30" cy="120" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="190" cy="120" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <text x="6" y="125" fill={RED} fontSize="15" fontWeight="bold" fontFamily="serif">B</text>
        {/* C - Largo */}
        <line x1="110" y1="38" x2="110" y2="232" stroke={RED} strokeWidth="1.8"/>
        <circle cx="110" cy="232" r="4" fill={RED}/>
        <text x="114" y="250" fill={RED} fontSize="15" fontWeight="bold" fontFamily="serif">C</text>
      </svg>
    )
  },
  remera: {
    labels: ['A - Medida de hombros', 'B - Medida de sisa', 'C - Largo de frente', 'D - Largo de espalda'],
    svg: (
      <svg viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body */}
        <path d="M80 52 Q60 48 45 70 L30 100 L58 110 L55 250 L185 250 L182 110 L210 100 L195 70 Q180 48 160 52 Q150 40 120 38 Q90 40 80 52Z" stroke={STROKE} strokeWidth={SW} fill="none"/>
        {/* Neck */}
        <path d="M95 52 Q120 65 145 52" stroke={STROKE} strokeWidth={SW} fill="none"/>
        {/* Sleeves */}
        <path d="M80 52 L45 70 L30 100 L58 110 L68 68" stroke={STROKE} strokeWidth={SW} fill="none"/>
        <path d="M160 52 L195 70 L210 100 L182 110 L172 68" stroke={STROKE} strokeWidth={SW} fill="none"/>
        {/* Sleeve dashes */}
        <line x1="30" y1="100" x2="58" y2="95" stroke={STROKE} strokeWidth="1" strokeDasharray="4 3"/>
        <line x1="210" y1="100" x2="182" y2="95" stroke={STROKE} strokeWidth="1" strokeDasharray="4 3"/>
        {/* A - Hombros (horizontal across shoulders) */}
        <line x1="62" y1="62" x2="178" y2="62" stroke={RED} strokeWidth="1.8"/>
        <circle cx="62" cy="62" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="178" cy="62" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <text x="32" y="58" fill={RED} fontSize="14" fontWeight="bold" fontFamily="serif">A</text>
        {/* B - Sisa */}
        <line x1="56" y1="108" x2="184" y2="108" stroke={RED} strokeWidth="1.8"/>
        <circle cx="56" cy="108" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="184" cy="108" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <text x="32" y="113" fill={RED} fontSize="14" fontWeight="bold" fontFamily="serif">B</text>
        {/* C - Largo frente (left vertical) */}
        <line x1="88" y1="54" x2="88" y2="250" stroke={RED} strokeWidth="1.8"/>
        <circle cx="88" cy="54" r="3" fill={RED}/>
        <circle cx="88" cy="250" r="4" fill={RED}/>
        <text x="62" y="48" fill={RED} fontSize="14" fontWeight="bold" fontFamily="serif">C</text>
        {/* D - Largo espalda (right vertical) */}
        <line x1="152" y1="54" x2="152" y2="250" stroke={RED} strokeWidth="1.8"/>
        <circle cx="152" cy="54" r="3" fill={RED}/>
        <circle cx="152" cy="250" r="4" fill={RED}/>
        <text x="158" y="48" fill={RED} fontSize="14" fontWeight="bold" fontFamily="serif">D</text>
      </svg>
    )
  },
  buzo: {
    labels: ['A - Medida de hombros', 'B - Medida de sisa', 'C - Largo de frente', 'D - Largo de espalda'],
    svg: (
      <svg viewBox="0 0 260 290" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body oversized */}
        <path d="M85 55 Q55 45 35 75 L15 115 L55 128 L52 262 L208 262 L205 128 L245 115 L225 75 Q205 45 175 55 Q162 40 130 38 Q98 40 85 55Z" stroke={STROKE} strokeWidth={SW} fill="none"/>
        {/* Neck - crew */}
        <path d="M100 55 Q130 70 160 55" stroke={STROKE} strokeWidth={SW} fill="none"/>
        {/* Cuffs */}
        <rect x="15" y="110" width="40" height="10" rx="2" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        <rect x="205" y="110" width="40" height="10" rx="2" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        {/* Bottom rib */}
        <rect x="52" y="255" width="156" height="12" rx="2" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        {/* A - Hombros */}
        <line x1="68" y1="66" x2="192" y2="66" stroke={RED} strokeWidth="1.8"/>
        <circle cx="68" cy="66" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="192" cy="66" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <text x="36" y="62" fill={RED} fontSize="14" fontWeight="bold" fontFamily="serif">A</text>
        {/* B - Sisa */}
        <line x1="54" y1="125" x2="206" y2="125" stroke={RED} strokeWidth="1.8"/>
        <circle cx="54" cy="125" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="206" cy="125" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <text x="30" y="130" fill={RED} fontSize="14" fontWeight="bold" fontFamily="serif">B</text>
        {/* C - Largo frente */}
        <line x1="96" y1="58" x2="96" y2="262" stroke={RED} strokeWidth="1.8"/>
        <circle cx="96" cy="58" r="3" fill={RED}/>
        <circle cx="96" cy="262" r="4" fill={RED}/>
        <text x="66" y="52" fill={RED} fontSize="14" fontWeight="bold" fontFamily="serif">C</text>
        {/* D - Largo espalda */}
        <line x1="164" y1="58" x2="164" y2="262" stroke={RED} strokeWidth="1.8"/>
        <circle cx="164" cy="58" r="3" fill={RED}/>
        <circle cx="164" cy="262" r="4" fill={RED}/>
        <text x="170" y="52" fill={RED} fontSize="14" fontWeight="bold" fontFamily="serif">D</text>
      </svg>
    )
  },
  vestido: {
    labels: ['A - Cintura', 'B - Cadera', 'C - Largo'],
    svg: (
      <svg viewBox="0 0 200 310" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M80 38 Q60 34 55 60 L45 100 L65 108 L60 290 Q100 300 140 290 L135 108 L155 100 L145 60 Q140 34 120 38 Q110 28 100 27 Q90 28 80 38Z" stroke={STROKE} strokeWidth={SW} fill="none"/>
        <path d="M90 38 Q100 50 110 38" stroke={STROKE} strokeWidth={SW} fill="none"/>
        <line x1="80" y1="40" x2="120" y2="40" stroke={RED} strokeWidth="1.8"/>
        <circle cx="80" cy="40" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="120" cy="40" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="100" cy="40" r="3" fill={RED}/>
        <text x="56" y="36" fill={RED} fontSize="14" fontWeight="bold" fontFamily="serif">A</text>
        <line x1="56" y1="115" x2="144" y2="115" stroke={RED} strokeWidth="1.8"/>
        <circle cx="56" cy="115" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="144" cy="115" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <text x="34" y="120" fill={RED} fontSize="14" fontWeight="bold" fontFamily="serif">B</text>
        <line x1="100" y1="40" x2="100" y2="292" stroke={RED} strokeWidth="1.8"/>
        <circle cx="100" cy="292" r="4" fill={RED}/>
        <text x="104" y="308" fill={RED} fontSize="14" fontWeight="bold" fontFamily="serif">C</text>
      </svg>
    )
  },
  saco: {
    labels: ['A - Medida de hombros', 'B - Medida de sisa', 'C - Largo'],
    svg: (
      <svg viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M82 50 Q55 42 40 72 L25 105 L58 116 L55 252 L185 252 L182 116 L215 105 L200 72 Q185 42 158 50 Q150 36 120 34 Q90 36 82 50Z" stroke={STROKE} strokeWidth={SW} fill="none"/>
        <path d="M100 50 Q108 62 120 58 Q132 62 140 50" stroke={STROKE} strokeWidth={SW} fill="none"/>
        {/* Lapels */}
        <path d="M100 50 L82 90 L110 90" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        <path d="M140 50 L158 90 L130 90" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        {/* Buttons */}
        <circle cx="120" cy="130" r="3" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        <circle cx="120" cy="155" r="3" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        <circle cx="120" cy="180" r="3" stroke={STROKE} strokeWidth="1.5" fill="none"/>
        {/* A */}
        <line x1="64" y1="62" x2="176" y2="62" stroke={RED} strokeWidth="1.8"/>
        <circle cx="64" cy="62" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="176" cy="62" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <text x="36" y="58" fill={RED} fontSize="14" fontWeight="bold" fontFamily="serif">A</text>
        {/* B */}
        <line x1="57" y1="113" x2="183" y2="113" stroke={RED} strokeWidth="1.8"/>
        <circle cx="57" cy="113" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <circle cx="183" cy="113" r="4" stroke={RED} strokeWidth="1.5" fill="white"/>
        <text x="33" y="118" fill={RED} fontSize="14" fontWeight="bold" fontFamily="serif">B</text>
        {/* C */}
        <line x1="120" y1="62" x2="120" y2="252" stroke={RED} strokeWidth="1.8"/>
        <circle cx="120" cy="252" r="4" fill={RED}/>
        <text x="124" y="270" fill={RED} fontSize="14" fontWeight="bold" fontFamily="serif">C</text>
      </svg>
    )
  },
}

export default function GarmentDiagram({ tipo }) {
  const d = diagrams[tipo] || diagrams.falda
  return (
    <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 190 }}>
      <div style={{ width: 150 }}>{d.svg}</div>
      <div style={{ marginTop: 10, textAlign: 'center' }}>
        {d.labels.map((l, i) => (
          <div key={i} style={{ fontSize: 12, fontWeight: 700, color: RED, lineHeight: 1.6 }}>{l}</div>
        ))}
      </div>
    </div>
  )
}
