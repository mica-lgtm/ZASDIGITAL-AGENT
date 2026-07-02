const BASE = 'http://localhost:8000'

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)
  const res = await fetch(BASE + path, opts)
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`)
  return res.json()
}

export const api = {
  getTiendas: () => request('GET', '/api/tiendas'),
  getProductos: (tienda, q = '') =>
    request('GET', `/api/tiendas/${tienda}/productos${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getCategorias: (tienda) => request('GET', `/api/tiendas/${tienda}/categorias`),
  getProducto: (tienda, id) => request('GET', `/api/tiendas/${tienda}/producto/${id}`),
  getTemplates: () => request('GET', '/api/templates'),
  createTemplate: (nombre, html) => request('POST', '/api/templates', { nombre, html }),
  updateTemplate: (id, nombre, html) => request('PUT', `/api/templates/${id}`, { nombre, html }),
  deleteTemplate: (id) => request('DELETE', `/api/templates/${id}`),
  preview: (tienda, producto_id, template_id) =>
    request('POST', '/api/preview', { tienda, producto_id, template_id }),
  getMetricas: (tienda, dias = 30) =>
    request('GET', `/api/tiendas/${tienda}/metricas?dias=${dias}`),
  getSalud: (tienda) => request('GET', `/api/tiendas/${tienda}/salud`),
  getExperimentos: (tienda) =>
    request('GET', `/api/experimentos${tienda ? `?tienda=${encodeURIComponent(tienda)}` : ''}`),
  rollbackScript: (tienda, scriptId) =>
    request('DELETE', `/api/tiendas/${tienda}/scripts/${scriptId}`),
}
