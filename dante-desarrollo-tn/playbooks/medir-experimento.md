# Playbook · Medir un experimento

1. Definir la ventana (desde/hasta) en formato `YYYY-MM-DD`.
2. Ventana de control (antes) y de tratamiento (después), o segmentar por cupón/UTM.
3. `metricas.resumen_ventana(client, desde, hasta)` → pedidos / ingresos / AOV.
4. Cargar antes/después en `resultado.md`, dictar veredicto (GANA/PIERDE/NEUTRO).
5. Destilar el aprendizaje a `aprendizajes.md`.
