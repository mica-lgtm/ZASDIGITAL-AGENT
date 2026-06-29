export function parseTable(raw) {
  if (!raw || !raw.trim()) return null

  const lines = raw.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return null

  // Detect delimiter: tab > pipe > 2+ spaces
  const hasTabs = lines.some(l => l.includes('\t'))
  const hasPipes = lines.some(l => l.includes('|'))

  function splitLine(line) {
    if (hasTabs) return line.split('\t').map(c => c.trim())
    if (hasPipes) return line.split('|').map(c => c.trim()).filter((c, i, a) => !(i === 0 && c === '') && !(i === a.length - 1 && c === ''))
    return line.split(/\s{2,}/).map(c => c.trim()).filter(Boolean)
  }

  const rows = lines.map(splitLine)
  // Use mode of column counts to determine expected cols
  const counts = rows.map(r => r.length)
  const mode = counts.sort((a, b) =>
    counts.filter(v => v === b).length - counts.filter(v => v === a).length
  )[0]

  const filtered = rows.filter(r => r.length >= mode - 1)
  if (filtered.length < 2) return null

  return {
    headers: filtered[0],
    rows: filtered.slice(1),
  }
}
