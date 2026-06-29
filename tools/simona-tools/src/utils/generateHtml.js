export function generateHtml({ nombre, subtitulo, temporada, material, diseno, calce, estilo, cuidados, talleModelo, notaTalles }) {
  const field = (label, value) => value ? `
    <tr>
      <td style="padding:10px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;width:90px;vertical-align:top;">${label}</td>
      <td style="padding:10px 16px;font-size:13px;color:#222;border-bottom:1px solid #f0ebe6;">${value}</td>
    </tr>` : ''

  const cuidadosBadges = cuidados
    ? cuidados.split(',').map(c => `<span style="display:inline-block;border:1px solid #ccc;border-radius:4px;padding:3px 10px;font-size:11px;margin-right:6px;margin-bottom:4px;color:#444;">${c.trim()}</span>`).join('')
    : ''

  return `<div style="font-family:'DM Sans',sans-serif;color:#111;max-width:680px;line-height:1.5;">

  <!-- Encabezado temporada -->
  <div style="text-align:center;border:1px solid #c4917a;padding:18px 24px;margin-bottom:24px;">
    ${temporada ? `<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:#c4917a;text-transform:uppercase;margin-bottom:8px;">${temporada}</div>` : ''}
    <div style="font-size:22px;font-weight:700;margin-bottom:4px;">${nombre || ''}</div>
    ${subtitulo ? `<div style="font-size:13px;font-style:italic;color:#c4917a;">${subtitulo}</div>` : ''}
  </div>

  <!-- Detalles de la prenda -->
  ${(material || diseno || calce || estilo) ? `
  <div style="margin-bottom:20px;">
    <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#888;border-bottom:2px solid #f0ebe6;padding-bottom:6px;margin-bottom:0;">DETALLES DE LA PRENDA</div>
    <table style="width:100%;border-collapse:collapse;">
      ${field('Material', material)}
      ${field('Diseño', diseno)}
      ${field('Calce', calce)}
      ${field('Estilo', estilo)}
    </table>
  </div>` : ''}

  <!-- Cuidados -->
  ${cuidados ? `
  <div style="margin-bottom:20px;">
    <div style="background:#f5f0eb;padding:10px 16px;display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <span style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#888;margin-right:8px;">CUIDADOS</span>
      ${cuidadosBadges}
    </div>
  </div>` : ''}

  <!-- Referencia de talle -->
  ${talleModelo ? `
  <div style="background:#c4917a;color:#fff;padding:12px 16px;margin-bottom:8px;display:flex;align-items:center;gap:12px;">
    <span style="background:#fff;color:#c4917a;font-weight:700;font-size:11px;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;">A</span>
    <span style="font-size:13px;font-weight:600;">REFERENCIA DE TALLE</span>
    <span style="font-size:13px;">${talleModelo}</span>
  </div>` : ''}

  ${notaTalles ? `<div style="font-size:12px;color:#888;text-align:center;margin-top:8px;">${notaTalles}</div>` : ''}

</div>`
}
