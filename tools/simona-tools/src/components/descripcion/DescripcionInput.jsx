const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#a2897b' }}>{label}</label>
    {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
    {children}
  </div>
)

const inputCls = "w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#90263A]"

const Input = (props) => <input {...props} className={inputCls} />
const Textarea = (props) => <textarea {...props} rows={2} className={`${inputCls} resize-none`} />

export default function DescripcionInput({ values, onChange }) {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre del producto">
          <Input value={values.nombre} onChange={set('nombre')} placeholder="Falda Horizonte Bordo" />
        </Field>
        <Field label="Temporada">
          <Input value={values.temporada} onChange={set('temporada')} placeholder="Otoño · Invierno" />
        </Field>
      </div>

      <Field label="Subtítulo">
        <Input value={values.subtitulo} onChange={set('subtitulo')} placeholder="Falda de crepé con cintura elástica – fluida, sofisticada y versátil" />
      </Field>

      <div className="border-t pt-4" style={{ borderColor: '#f0efec' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#90263a' }}>Detalles de la prenda</p>
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

      <div className="border-t pt-4" style={{ borderColor: '#f0efec' }}>
        <Field label="Cuidados" hint="Separar con comas">
          <Input value={values.cuidados} onChange={set('cuidados')} placeholder="Lavar a mano con agua fría, No retorcer, Secar a la sombra" />
        </Field>
      </div>

      <div className="border-t pt-4" style={{ borderColor: '#f0efec' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#90263a' }}>Guía de talles</p>
        <Field label="URL de la imagen de talles" hint="URL del PNG ya subido al CDN (ej: cloudfront.net/...)">
          <Input value={values.urlTablaImg} onChange={set('urlTablaImg')} placeholder="https://d1a9qnv764bsoo.cloudfront.net/stores/601/496/rte/tabla-falda.png" />
        </Field>
      </div>

      <div className="border-t pt-4" style={{ borderColor: '#f0efec' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#90263a' }}>Referencia de talle</p>
        <div className="space-y-3">
          <Field label="Nombre del modelo + talle">
            <Input value={values.talleModelo} onChange={set('talleModelo')} placeholder="Ale usa talle M en este modelo" />
          </Field>
          <Field label="Talle de la modelo en la foto">
            <Input value={values.modeloFotoTalle} onChange={set('modeloFotoTalle')} placeholder="S" />
          </Field>
          <Field label="Nota de medidas">
            <Input value={values.notaTalles} onChange={set('notaTalles')} placeholder="Todas las medidas son aproximadas y lineales. No son de contorno." />
          </Field>
        </div>
      </div>
    </div>
  )
}
