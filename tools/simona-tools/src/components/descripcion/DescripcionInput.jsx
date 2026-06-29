const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{label}</label>
    {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
    {children}
  </div>
)

const Input = (props) => (
  <input
    {...props}
    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange"
  />
)

const Textarea = (props) => (
  <textarea
    {...props}
    rows={2}
    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange resize-none"
  />
)

export default function DescripcionInput({ values, onChange }) {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre del producto">
          <Input value={values.nombre} onChange={set('nombre')} placeholder="Falda Horizonte Chocolate" />
        </Field>
        <Field label="Temporada">
          <Input value={values.temporada} onChange={set('temporada')} placeholder="OTOÑO · INVIERNO" />
        </Field>
      </div>

      <Field label="Subtítulo / tagline">
        <Input value={values.subtitulo} onChange={set('subtitulo')} placeholder="Falda de crepé con cintura elástica – fluida, sofisticada y versátil" />
      </Field>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Detalles de la prenda</p>
        <div className="space-y-3">
          <Field label="Material">
            <Textarea value={values.material} onChange={set('material')} placeholder="Crepé ligero y con caída elegante. Textura suave y liviana perfecta para cualquier temporada." />
          </Field>
          <Field label="Diseño">
            <Textarea value={values.diseno} onChange={set('diseno')} placeholder="Corte fluido con cintura elástica que se adapta a la silueta." />
          </Field>
          <Field label="Calce">
            <Textarea value={values.calce} onChange={set('calce')} placeholder="Cintura elástica que se adapta sin apretar. Versátil para distintos cuerpos." />
          </Field>
          <Field label="Estilo">
            <Textarea value={values.estilo} onChange={set('estilo')} placeholder="Con top ajustado y tacos para un outfit elegante." />
          </Field>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <Field label="Cuidados" hint="Separar con comas">
          <Input value={values.cuidados} onChange={set('cuidados')} placeholder="Lavar a mano con agua fría, No retorcer, Secar a la sombra" />
        </Field>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Referencia de talle (modelo)">
            <Input value={values.talleModelo} onChange={set('talleModelo')} placeholder="Ale usa talle M en este modelo" />
          </Field>
          <Field label="Nota de talles">
            <Input value={values.notaTalles} onChange={set('notaTalles')} placeholder="Todas las medidas son aproximadas y lineales. No son de contorno." />
          </Field>
        </div>
      </div>
    </div>
  )
}
