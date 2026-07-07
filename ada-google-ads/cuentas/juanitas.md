# Juanitas

> Ficha creada a partir del documento "Juanitas x ZAS - Detalle estratégico Julio 2026" (propuesta integral de growth, no específica de Google Ads). Extraigo acá solo lo relevante para operar Google Ads; el resto de la propuesta (Meta, TikTok, Mercado Libre, CRM, contenido) queda fuera del alcance de Ada.

## Datos generales

- Nombre de la marca: Juanitas
- URL de la tienda: dato pendiente
- Plataforma: Tienda Nube
- Rubro: Ropa interior femenina (bombachas, corpiños, vedetinas, camisetas, trajes de baño), venta por unidad y por packs (x3, x6, kit viajero).
- Estado actual de la cuenta: **activa y con campañas reales corriendo** -- confirmado el 2026-07-07 auditando directamente la MCC de Ada vía la API de Google Ads (independiente de Sol). Ver detalle en sección Google Ads.
- Responsable interno en Zas: Mica
- Nivel de prioridad: dato pendiente

## Qué vende

- Categorías principales: bombachas, colaless, vedetinas, corpiños, camisetas, trajes de baño, packs (x3/x6/kit viajero).
- Productos más vendidos (ene-jun 2026, dato de auditoría previa -- confirmar vigencia): Colaless tiro alto pack x3 (1.733 uds), pack x6 (1.386 uds), kit viajero (952 uds), con refuerzo (936 uds), corpiño taza soft (ganador may-jun).
- Ticket promedio aproximado: $69.103,71 (ene-jun 2026, fuente Tiendanube).
- Estacionalidades importantes: Hot Sale, Black Sale (mencionadas como campañas históricas de Google Ads).

## Público objetivo

- Quién compra: mujeres, sin segmentación etaria confirmada en el documento fuente.
- Edad aproximada: dato pendiente.
- Género principal: mujeres.
- Ubicación: dato pendiente.
- Motivaciones: comodidad cotidiana, packs convenientes, certeza de talle antes de comprar.
- Dolores o miedos: duda de talle/calce/modelo -- es el eje central de la propuesta de marca ("Mi Talle Juanitas").
- Objeciones frecuentes: talle, calce, diferencias entre modelos.

## Tono de voz

- Estilo de comunicación: dato pendiente (el documento fuente es un plan de growth, no un manual de marca).
- Palabras que usa / evita: dato pendiente.
- Nivel de emojis: dato pendiente.
- Tipo de humor: dato pendiente.

## Identidad visual

- Colores principales: fucsia, rosa (mencionado como paleta para piezas ejecutivas del documento, no confirmado como paleta de marca oficial).
- Tipografías: Poppins (mencionada en el documento como sugerencia, no confirmada).
- Estilo visual: dato pendiente.

## Promociones y beneficios

- Envío gratis: sí, compras superiores a $50.000 (dato del documento de propuesta -- **confirmar vigencia con Mica antes de usarlo en un anuncio**).
- Cuotas: 6 cuotas sin interés (dato de propuesta -- confirmar vigencia).
- Descuento por transferencia: 5% OFF (dato de propuesta -- confirmar vigencia).
- Regla dura heredada del resto de fichas de Ada: no usar ninguna promoción sin validación previa de Mica.

## Google Ads

- ID de cuenta: `809-224-4949` -- confirmado el 2026-07-07 auditando directamente la MCC de Ada vía la API (`ads/reportes.reporte_cuentas_cliente`), sin depender de Sol.
- Objetivo de cuenta: CPA objetivo / ROAS objetivo específico de Google: dato pendiente. El documento de propuesta solo da un ROAS de negocio blended (todos los canales) de 5,5x-6x para julio 2026, no un objetivo desagregado para Google.
- Conversion actions trackeadas (auditoría real 2026-07-07): 6 totales, 5 `ENABLED` -- `Tiendanube Website purchases`, `Tiendanube Backend purchases`, `Android installs`, `YouTube channel subscriptions`, `YouTube follow-on views`. Ninguna se llama explícitamente "Compra" -- confirmar con Mica cuál de las dos de Tiendanube es la conversión primaria a optimizar.
- Tipos de campaña habilitados hoy (auditoría real 2026-07-07): **Search y PMax**, no Display ni Demand Gen. Consistente con lo que sugería el documento de propuesta.
- Presupuesto Google Ads julio 2026 (propuesto, no confirmado como tope duro): $2.524.897, equivalente al 7,2% del presupuesto total de paid media de la marca ($35,3M) según el documento de propuesta. Confirmar con Mica si es el tope real.

### Auditoría real de la cuenta (2026-07-07, ventana 2026-06-01 a 2026-07-07)

- 72 campañas totales, solo **5 en estado ENABLED**. De esas, **4 tienen spend $0** en la ventana -- son campañas de promo estacional que quedaron encendidas después de terminada la fecha: `MPD - Ropa Interior - San Valentín`, `BUS - Hot Sale - 9 al 18`, `MPD - Hot Sale - 9 al 18`, `MPD - Día de la Madre - Imágenes + Videos`. Candidatas a pausar por prolijidad de cuenta (no están gastando, pero ensucian el panorama y el reporting) -- **a proponer formalmente vía `propuestas/`, nunca pausadas directamente**.
- La única campaña con actividad real: `MPR - HOT SALE - Placas` (PMax), spend $2.168.402, 245 conversiones, $16.689.991 en ingresos, ROAS 7,7, impression share perdida por presupuesto ~15% -- **candidata a propuesta de aumento de presupuesto**, dado el ROAS saludable y la pérdida de IS por presupuesto.
- **Contradicción con el documento de propuesta de Mica**: el documento cita `BUS - Marca - B` como campaña histórica top (Search, ROAS 9,82 ene-jun). Esa campaña **no aparece activa hoy** en la cuenta real -- o está pausada/removida, o cambió de nombre. No asumir que la estructura descripta en el documento de propuesta sigue vigente sin confirmar.
- 45 asset groups de PMax detectados (44 `ENABLED`) -- confirma que PMax sí está en uso real en esta cuenta.
- Top campañas históricas citadas en el documento de propuesta (dato de plataforma reportado por el documento, no necesariamente vigente hoy -- ver contradicción arriba):
  - `BUS - Marca - B` (Search): $3,83M invertidos, $37,62M valor, ROAS 9,82.
  - `MPD - Bombachas por modelo - Foto Producto - C`: $4,65M invertidos, $42,15M valor, ROAS 9,06.
  - `MPR - HOT SALE - Placas`: $2,48M invertidos, $21,87M valor, ROAS 8,82 (esta sí sigue activa hoy, ver arriba).
  - `MPD - Black Sale - Videos`: $1,12M invertidos, $7,85M valor, ROAS 7,01.
- Rol asignado a Google en el mix (según propuesta): capturar demanda de alta intención, sin competir con Meta como canal masivo. No mezclar todo el catálogo en un único PMax.
- Negativas propias: dato pendiente, no mencionadas en el documento fuente ni auditadas todavía en esta pasada.
- Calendario de estacionalidad/promos específico: Hot Sale y Black Sale aparecen como nombres de campaña histórica -- cruzar fechas exactas con `conocimiento/calendario-estacional.md` y confirmar con Mica si siguen vigentes para julio 2026.

## Canales activos

- Meta Ads: sí (79,4% del presupuesto de paid media según propuesta). Google Ads: sí, confirmado activo con campañas reales (7,2% del presupuesto propuesto). TikTok Ads: sí (10,9%). Mercado Libre: sí (2,6%, canal complementario). Email marketing: sí (Perfit).

## Reglas importantes

- Qué NO inventar: CPA/ROAS objetivo específico del canal, cuál conversion action es la primaria, tope de presupuesto real, vigencia de promociones, tono de marca.
- Qué siempre validar con Mica: si las cifras de presupuesto/estructura del documento de propuesta son las que se van a ejecutar en julio o solo una referencia comercial, y por qué `BUS - Marca - B` no aparece activa hoy.
- Qué evitar: proponer pausar las 4 campañas estacionales sin stock de una propuesta formal en `propuestas/` (nunca pausar directo); asumir que la estructura del documento de propuesta es la real sin contrastarla contra la cuenta.

## Pendientes de información

- [ ] Confirmar CPA/ROAS objetivo específico de Google Ads (el documento solo da un ROAS de negocio blended).
- [ ] Confirmar cuál conversion action de Tiendanube es la primaria a optimizar.
- [ ] Confirmar si $2.524.897 es el tope real de presupuesto de Google Ads para julio 2026.
- [ ] Confirmar por qué `BUS - Marca - B` no aparece activa hoy pese a ser la campaña de marca citada en el documento de propuesta.
- [ ] Confirmar tono de voz e identidad visual de marca (no está en el documento fuente, que es un plan de growth, no un manual de marca).
- [ ] Aprobar o rechazar la propuesta de pausar las 4 campañas estacionales con spend $0 (San Valentín, Hot Sale x2, Día de la Madre).
