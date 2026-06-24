# Playbook · Auditoría de conversión inicial

1. `snapshot.snapshot_tienda(client)` → estado real (info, productos, precios).
2. Revisar carritos abandonados: `client.get_all("checkouts")`.
3. `metricas.resumen_ventana()` del último mes → baseline de pedidos/AOV.
4. Listar 3-5 hipótesis de mejora priorizadas por impacto esperado vs. esfuerzo.
5. Cada hipótesis se convierte en un experimento (Task 10 plantilla).
