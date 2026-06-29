export function generateHtml({ nombre, subtitulo, temporada, material, diseno, calce, estilo, cuidados, urlTablaImg, talleModelo, modeloFotoTalle, notaTalles }) {
  const detalleRow = (label, value) => !value ? '' : `
<tr style="border-bottom: 1px solid #f0efec;">
  <td style="padding: 11px 0; width: 95px; vertical-align: top;"><span style="font-size: 9px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; color: #a2897b;">${label}</span></td>
  <td style="padding: 11px 0; font-size: 13px; color: #444; line-height: 1.6;">${value}</td>
</tr>`

  const hasDetalles = material || diseno || calce || estilo
  const cuidadosList = cuidados ? cuidados.split(',').map(c => c.trim()).filter(Boolean) : []
  const cuidadosBadges = cuidadosList.map(c => `<span style="background: #fff; color: #555; font-size: 11px; padding: 5px 13px;">❦ ${c}</span>`).join('')

  return `<div style="background: #e9eae5; padding: 32px 28px 26px; text-align: center; position: relative; overflow: hidden;">
<div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg,#90263A,#D5C792,#A2897B);"></div>
${temporada ? `<span style="display: inline-block; border: 1px solid #A2897B; color: #a2897b; font-size: 9px; font-weight: bold; letter-spacing: 2.5px; text-transform: uppercase; padding: 4px 14px; margin-bottom: 16px;">${temporada}</span>` : ''}
${nombre ? `<h2 style="font-size: 22px; font-weight: 600; color: #3a2a2a; line-height: 1.2; margin: 0 0 8px 0;">${nombre}</h2>` : ''}
${subtitulo ? `<p style="color: #a2897b; font-size: 13px; font-style: italic; margin: 0;">${subtitulo}</p>` : ''}
</div>
${hasDetalles ? `
<div style="background: #ffffff; padding: 24px 28px; margin-top: 2px;">
<p style="font-size: 9px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #90263a; margin: 0 0 18px 0;">Detalles de la prenda</p>
<table style="width: 100%; border-collapse: collapse;">
<tbody>${detalleRow('Material', material)}${detalleRow('Dise&ntilde;o', diseno)}${detalleRow('Calce', calce)}${detalleRow('Estilo', estilo)}
</tbody>
</table>
</div>` : ''}
${cuidadosList.length ? `
<div style="background: #e9eae5; padding: 18px 28px; margin-top: 2px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
<span style="font-size: 9px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #90263a; flex-shrink: 0;">Cuidados</span>
<div style="display: flex; gap: 8px; flex-wrap: wrap;">${cuidadosBadges}</div>
</div>` : ''}
${urlTablaImg ? `
<div style="background: #f7f4f1; padding: 22px 28px 18px; margin-top: 2px; border-top: 1px solid #e0dbd5;">
<p style="font-size: 9px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #90263a; margin: 0 0 14px 0;">Gu&iacute;a de talles</p>
<img style="display: block; width: 100%; height: auto;" src="${urlTablaImg}" alt="Gu&iacute;a de talles${nombre ? ' ' + nombre : ''}" />
</div>` : ''}
${(talleModelo || modeloFotoTalle || notaTalles) ? `
<div style="background: #ffffff; padding: 20px 28px 22px; margin-top: 2px; border-bottom: 3px solid #90263A;">
${talleModelo ? `<div style="background: #90263A; padding: 14px 20px; margin-bottom: 14px; display: flex; align-items: center; gap: 14px;">
<div style="width: 38px; height: 38px; border-radius: 50%; background: #ffffff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 15px; font-weight: bold; color: #90263a;">A</div>
<div>
<p style="font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #d5c792; margin: 0 0 3px 0;">Referencia de talle</p>
<p style="font-size: 14px; color: #ffffff; font-weight: bold; margin: 0;">${talleModelo}</p>
</div>
</div>` : ''}
${modeloFotoTalle ? `<p style="font-size: 12px; font-weight: bold; color: #1a1a1a; text-align: center; margin: 0 0 10px 0;">La modelo de la foto usa talle ${modeloFotoTalle}</p>` : ''}
${notaTalles ? `<p style="font-size: 11px; font-weight: 600; color: #1a1a1a; text-align: center; font-style: italic; margin: 0;">${notaTalles}</p>` : ''}
</div>` : ''}`
}
