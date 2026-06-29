import { useState } from 'react'

export default function HtmlOutput({ html }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">HTML generado</span>
        <button
          onClick={handleCopy}
          className={`text-xs px-3 py-1.5 rounded font-semibold transition ${copied ? 'bg-green-500 text-white' : 'bg-orange text-white hover:opacity-90'}`}
        >
          {copied ? '✓ Copiado!' : 'Copiar HTML'}
        </button>
      </div>
      <pre className="bg-gray-50 border border-gray-200 rounded p-4 text-xs overflow-auto max-h-80 text-gray-700 whitespace-pre-wrap break-all">
        {html}
      </pre>
    </div>
  )
}
