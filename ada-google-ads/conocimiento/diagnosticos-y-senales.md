# Diagnósticos y señales

Cómo leer las señales de Google Ads para decidir qué proponer. Analogía Google-Ads-específica del `metricas-y-diagnosticos.md` que usaba Mateo para Meta.

## Quality Score

- `quality_score` 1-10 por keyword. Debajo de 5 amerita revisar: relevancia del anuncio (`creative_quality_score`), landing page (`post_click_quality_score`), o CTR esperado (`search_predicted_ctr`).
- No proponer subir puja en una keyword con quality score bajo sin primero proponer arreglar la causa (copy, landing, o pausarla si no hay forma de mejorarla).

## Impression share perdido

- `search_budget_lost_impression_share` alto → el presupuesto es la restricción, no la puja ni la calidad. Candidato a propuesta de aumento de presupuesto (respetando el tope de la ficha de marca).
- `search_rank_lost_impression_share` alto → el ranking (puja x quality score) es la restricción. Candidato a ajuste de puja o mejora de anuncio/landing, no de presupuesto.

## Anuncios

- `approval_status` distinto de `APPROVED` → desaprobación, señal urgente para la rutina de tarde (puede cortar el delivery de un grupo entero).
- `performance_label` de assets RSA en `LOW` sostenido → candidato a reemplazar ese headline/description.

## Search terms

- Términos con spend alto y 0 conversiones en la ventana → candidatos a negativa (revisar contra `negativas-baseline.md` y la ficha de marca antes de proponerlo, para no pausar algo que la marca sí quiere captar).
- Términos nuevos con buen CPA que no están como keyword → candidatos a nueva keyword.

## Pacing

- `pct_consumido` de presupuesto muy por delante o por detrás de la fracción del día ya transcurrida → señal de pacing para la rutina de tarde.

## Cambios recientes (`change_event`)

- Cambios hechos por un usuario humano fuera de una ejecución de Ada (`client_type` distinto de lo esperado) → reportar como "cambio manual detectado", no asumir que fue Ada.
