# Magnolias

> Ficha creada a partir del documento "Magnolias Deco Commerce Experience - Growth Partner Julio 2026" (propuesta integral de growth, no específica de Google Ads). Extraigo acá solo lo relevante para operar Google Ads; el resto de la propuesta (Meta, TikTok, Pinterest, CRM, contenido, Magnolias Concierge) queda fuera del alcance de Ada.

## Datos generales

- Nombre de la marca: Magnolias
- URL de la tienda: dato pendiente
- Plataforma: Tienda Nube
- Rubro: Muebles y decoración de hogar (deco/home): muebles, textiles, iluminación, línea cocina, baño.
- Estado actual de la cuenta: **activa y con campañas reales corriendo, la más sólida de las cuentas auditadas por ROAS** -- confirmado el 2026-07-07 auditando directamente la MCC de Ada vía la API (independiente de Sol). Ver detalle en sección Google Ads.
- Responsable interno en Zas: Mica
- Nivel de prioridad: dato pendiente

## Qué vende

- Categorías principales: muebles (mesas de luz, racks, cómodas, recibidores), textiles (cortinas, almohadones, rellenos, mantas), alfombras, iluminación, línea cocina y baño.
- Productos más vendidos (ene-jun 2026, dato de auditoría previa -- confirmar vigencia y stock real antes de usar como base de campaña): Mesa de Luz Boho (producto héroe, ~900+ uds en ambos cortes pero con stock bajo/reservado), Alfombra Algodón Crudo, Relleno vellón 50x50, Zapatero, Panel Acústico Varillado, Cortina Gasa.
- Ticket promedio aproximado: $261.408 (ene-jun 2026), sube a ~$280K en may-jun (dato Tiendanube).
- Estacionalidades importantes: no se mencionan fechas específicas en el documento fuente (a diferencia de Simona/Juanitas, que sí citan Hot Sale/Black Sale) -- confirmar con Mica.

## Público objetivo

- Quién compra: compradores de decoración/muebles para el hogar, sin segmentación etaria/género confirmada en el documento.
- Motivaciones: armar un ambiente completo (recibidor, dormitorio, living, baño), no solo comprar un mueble suelto.
- Dolores o miedos: dificultad para visualizar cómo queda un espacio completo, indecisión sobre qué combinar.
- Objeciones frecuentes: precio/financiación en tickets altos, logística de entrega de productos grandes.

## Tono de voz

- Estilo de comunicación: dato pendiente (el documento fuente es un plan de growth, no un manual de marca). Se menciona identidad "cálida, natural" como observación de diagnóstico de sitio, no como lineamiento de copy confirmado.
- Palabras que usa / evita: dato pendiente.
- Nivel de emojis: dato pendiente.

## Identidad visual

- Colores principales: paleta tierra/natural (madera clara, tonos cálidos) -- observación de diagnóstico, no confirmado como paleta oficial de marca.
- Tipografía: "Elms Sans" mencionada como provista por el equipo -- confirmar si es la tipografía oficial de marca.
- Estilo visual: fotografía de ambientes reales, materiales naturales (madera, fibras, textiles).

## Promociones y beneficios

- Cuotas: 3 cuotas sin interés (dato de propuesta -- confirmar vigencia con Mica antes de usarlo en un anuncio).
- Descuento por efectivo/billetera: 20% OFF (dato de propuesta -- confirmar vigencia).
- Descuento por transferencia: 5% OFF (dato de propuesta -- confirmar vigencia).
- Envío: a todo el país (dato de propuesta -- confirmar condiciones/costos).
- Regla dura heredada del resto de fichas de Ada: no usar ninguna promoción sin validación previa de Mica.

## Google Ads

- ID de cuenta: `232-856-2558` -- confirmado el 2026-07-07 auditando directamente la MCC de Ada vía la API (`ads/reportes.reporte_cuentas_cliente`), sin depender de Sol.
- Objetivo de cuenta: CPA objetivo / ROAS objetivo específico de Google: dato pendiente. El documento de propuesta da un ROAS de negocio (todos los canales) objetivo de 13,5x-14,5x para julio 2026 sobre un presupuesto total de $51,9M, no un objetivo desagregado para Google.
- Conversion actions trackeadas (auditoría real 2026-07-07): 11 totales, 9 `ENABLED` -- hay **duplicados numerados** (`Compra`, `Compra (1)`, `Tiendanube Website purchases`, `Tiendanube Website purchases (1)`, `Tiendanube Website purchases (2)`, etc.). Esto sugiere conversiones configuradas más de una vez (¿migraciones, tests, integraciones duplicadas?) -- **riesgo real de doble conteo de conversiones/ROAS inflado**. Confirmar con Mica cuál es la conversión primaria y si hay que desactivar las duplicadas.
- Tipos de campaña habilitados hoy (auditoría real 2026-07-07): **Search y PMax**, no Display. Consistente con lo que sugería el documento de propuesta.
- Presupuesto Google Ads julio 2026 (propuesto, no confirmado como tope duro): $7,94M, equivalente al 15% del presupuesto total de paid media de la marca ($51,9M) según el documento de propuesta. Confirmar con Mica si es el tope real.

### Auditoría real de la cuenta (2026-07-07, ventana 2026-06-01 a 2026-07-07)

- **Es la cuenta con mejor desempeño real de todas las auditadas**: 101 campañas totales, 11 `ENABLED`, spend $10.958.885, 970 conversiones, $276.647.532 en ingresos, ROAS 25,24 blended -- incluso más alto que el histórico ene-jun citado en el documento de propuesta (32,9x, aunque esa cifra podría incluir el problema de conversiones duplicadas señalado arriba).
- Campañas activas con spend real (todas con ROAS saludable, ninguna en zona de riesgo):
  - `BUS - Marca - B` (Search): $2.940.234, ROAS 29,38, **impression share 93,7%** -- prácticamente saturada, muy poco margen para crecer solo con más presupuesto en esta campaña puntual.
  - `MPR - Todos los productos - Images + Video` (PMax): $2.176.441, ROAS 29,13, IS perdida por presupuesto 6,2% -- margen chico para escalar.
  - `MPD - Muebles - Foto producto` (PMax): $2.178.606, ROAS 25,41, IS perdida por presupuesto 6,8%.
  - `MPR - Textiles - Imagenes - D` (PMax): $1.705.798, ROAS 17,03, IS perdida por presupuesto 6,5%.
  - `MPR - Linea Cocina - Foto Producto - D` (PMax): $1.097.270, ROAS 21,58, IS perdida por presupuesto 5,2%.
  - `P MAX - MAS VENDIDOS` (PMax): $860.535, ROAS 21,81, IS perdida por presupuesto 5,2%.
  - Todas las PMax activas pierden solo 5-7% de impression share por presupuesto -- a diferencia de Simona/Juanitas/Hanna OK/Mini Anima, acá el freno no es tan claramente el presupuesto. Antes de proponer aumentar presupuesto, revisar si el techo real es de audiencia/creativos, no de plata.
- **5 campañas ENABLED con spend $0** (leftover estacional, mismo patrón que las otras cuentas): `BUS - CYBER - 4 Y 5`, `MPR - CYBER - 4 Y 5`, `BUS - Hot Sale - 12 de Mayo`, `MPR - Hot Sale - 12 Mayo`, `MPR - 12 cuotas Cyber - Placas Diciembre`. Candidatas a pausar por prolijidad -- **a proponer formalmente, no pausado**.
- 72 asset groups de PMax detectados (71 `ENABLED`) -- ya hay una segmentación amplia por categoría (Muebles, Textiles, Línea Cocina, Todos los productos, Más Vendidos), consistente con la recomendación del documento de propuesta de "PMax por familia, no todo mezclado".
- Top campañas históricas citadas en el documento de propuesta (a contrastar con lo de arriba, los nombres coinciden bien con la cuenta real):
  - `BUS - Marca - B` (Search): $7,9M invertidos, $341,9M valor, ROAS 43,2x (ene-jun) -- sigue activa hoy, con ROAS 29,4x en la ventana más corta auditada.
  - `MPD - Muebles` (PMax): $7,2M invertidos, $235,6M valor, ROAS 32,6x -- sigue activa hoy.
  - `MPR - Todos los productos` (PMax): $5,7M invertidos, $210,1M valor, ROAS 36,8x -- sigue activa hoy.
  - `MPR - Textiles` (PMax): $7,5M invertidos, $201,3M valor, ROAS 27,0x -- sigue activa hoy.
- Rol asignado a Google en el mix (según propuesta): capturar demanda de alta intención sin competir con Meta por el mismo usuario. Separar Brand Search de no-marca. PMax por familia de producto, no un solo PMax con todo el catálogo mezclado. Negativizar búsquedas irrelevantes.
- **Regla de stock explícita del documento**: no escalar campañas de Google (ni ninguna otra) basándose solo en unidades vendidas históricas si el producto tiene stock bajo o stock 0 -- varios de los productos más vendidos (ej. Mesa de Luz Boho) tienen alertas de stock. Antes de proponer escalar una campaña o un PMax por categoría, confirmar stock real disponible.
- Negativas propias: dato pendiente, no auditadas todavía en esta pasada.
- Calendario de estacionalidad/promos específico: dato pendiente -- no mencionado en el documento fuente, pero la cuenta real tiene campañas nombradas "Cyber" y "Hot Sale" (mayo) -- cruzar fechas con Mica.

## Canales activos

- Meta Ads: sí (68% del presupuesto de paid media según propuesta). Google Ads: sí, confirmado activo y con el mejor ROAS real de todas las cuentas auditadas (15% del presupuesto propuesto). TikTok Ads: sí (13%). Pinterest Ads: sí (4%, test controlado). Email marketing: sí (Perfit).

## Reglas importantes

- Qué NO inventar: CPA/ROAS objetivo específico del canal, cuál conversion action es la primaria (hay duplicadas), tope de presupuesto real, vigencia de promociones, stock real de cada SKU.
- Qué siempre validar con Mica: si las cifras de presupuesto/estructura del documento de propuesta son las que se van a ejecutar en julio, el stock real antes de proponer escalar cualquier campaña, y por qué hay conversion actions duplicadas (riesgo de ROAS inflado).
- Qué evitar: proponer escalar productos con stock bajo/crítico sin validarlo primero; asumir el ROAS blended de la cuenta como limpio sin antes resolver la duplicación de conversion actions.

## Pendientes de información

- [ ] Confirmar CPA/ROAS objetivo específico de Google Ads (el documento solo da un ROAS de negocio blended).
- [ ] Resolver la duplicación de conversion actions (`Compra` / `Compra (1)`, `Tiendanube Website purchases` x3) -- confirmar cuál es la primaria y si hay doble conteo de conversiones.
- [ ] Confirmar si $7,94M es el tope real de presupuesto de Google Ads para julio 2026.
- [ ] Confirmar tono de voz e identidad visual de marca (no está en el documento fuente, que es un plan de growth, no un manual de marca).
- [ ] Obtener planilla de stock actualizada antes de tratar cualquier producto como candidato a escalar en Google Ads.
- [ ] Aprobar o rechazar la propuesta de pausar las 5 campañas estacionales con spend $0 (Cyber x2, Hot Sale 12 de Mayo x2, 12 cuotas Cyber Diciembre).
