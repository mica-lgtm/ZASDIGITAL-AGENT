import html2canvas from 'html2canvas'

export async function exportElementAsPng(elementRef, filename = 'imagen.png') {
  await document.fonts.ready
  const canvas = await html2canvas(elementRef.current, {
    backgroundColor: '#FDF8F4',
    scale: 2,
    useCORS: true,
    logging: false,
    onclone: (doc) => {
      // ensure fonts are available in clone
      const style = doc.createElement('style')
      style.textContent = `* { font-family: 'DM Sans', sans-serif !important; }`
      doc.head.appendChild(style)
    }
  })
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}
