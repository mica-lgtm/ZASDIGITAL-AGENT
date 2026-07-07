# Vitalis Navitas

> Ficha creada el 2026-07-07 a partir de una auditoría directa de la MCC de Ada vía la API de Google Ads. Vitalis Navitas aparece mencionada en el documento de propuesta de Simona (julio 2026) como marca de colaboración/collab de contenido ("rutina de bienestar + look Simona"), pero **no hay ningún documento de estrategia propio de Vitalis Navitas** -- todo lo que no viene de la API está marcado "dato pendiente".

## Datos generales

- Nombre de la marca: Vitalis Navitas
- URL de la tienda: dato pendiente (probablemente un dominio propio ".digital", ver nota en campañas más abajo)
- Plataforma: Tienda Nube + posible sitio propio (hay conversion actions "Tiendanube Website/Backend purchases" y también "Vitalis Navitas - GA4 (web) purchase" con page views/agregar al carrito separados, lo que sugiere dos fuentes de tracking distintas o una migración de plataforma).
- Rubro: **suplementos/salud y bienestar** -- las campañas de búsqueda genérica son por "Colágeno", "Magnesio", "Omega 3", "Probióticos", "Suplementos Peptan", consistente con la mención de "salud, bienestar" en el documento de Simona.
- Estado actual de la cuenta: **activa, con campañas reales corriendo**, pero sin ficha de marca ni confirmación de Mica de que deba tratarse como cuenta operativa de Ada.
- Responsable interno en Zas: dato pendiente.
- Nivel de prioridad: dato pendiente.

## Google Ads

- ID de cuenta: `331-458-8133`.
- Objetivo de cuenta: dato pendiente.
- Conversion actions trackeadas (auditoría real 2026-07-07): 26 totales, solo 8 `ENABLED` -- incluye "Página vista" y "Agregar al carrito" como conversiones (no solo compra), más "Vitalis Navitas - GA4 (web) purchase", "Tiendanube Website/Backend purchases" y "Compra - Digital". Varias conversiones de compra en paralelo -- mismo riesgo de duplicación que en Simona/Magnolias, confirmar cuál es la primaria.
- Tipos de campaña habilitados hoy: **Search, PMax y Display**.
- Presupuesto: dato pendiente -- no hay documento de propuesta para esta marca.

### Auditoría real de la cuenta (2026-07-07, ventana 2026-06-01 a 2026-07-07)

- Es la cuenta con **más campañas históricas de toda la MCC** (240 totales), 14 `ENABLED`. Spend total $5.839.254, 308,5 conversiones, $33.835.223 en ingresos, ROAS 5,79 -- el ROAS blended más bajo de todas las cuentas con actividad real (compárese con 15-29x en Magnolias/Mini Ánima/Simona).
- Los verdaderos motores de la cuenta son PMax:
  - `PMax - CH 90D`: spend $1.976.496 (el mayor de la cuenta), ROAS 8,77.
  - `BUS - Marca Ultra` (Search): spend $1.569.159, ROAS 7,01.
  - Varios PMax más chicos con ROAS entre 1,4x y 11,6x (`MPR - Top Sellers`, `MPD - Lanzamiento`, `PMax - Vitamina C - Liquidación`, etc.) -- performance dispar, algunos casi no rentables.
- **Hallazgo importante: 5 campañas de Search Generic (no-marca) por ingrediente específico** (`Colágeno`, `Magnesio`, `Omega 3`, `Probióticos`, `Suplementos Peptan`) **gastan plata real con 0 conversiones** en la ventana, y varias tienen **impression share perdida por presupuesto altísima (60%-89%)**:
  - `Search Generic - Colágeno`: spend $157.163, IS perdida por presupuesto 60,3%, 0 conversiones.
  - `Search Generic - Magnesio`: spend $105.468, IS perdida por presupuesto 88,1%, 0 conversiones.
  - `Search Generic - Omega 3`: spend $89.913, IS perdida por presupuesto 89%, 0 conversiones.
  - `Search Generic - Probióticos`: spend $20.353, IS perdida por presupuesto 85,6%, 0 conversiones.
  - `Search Generic - Suplementos Peptan`: spend $22.488, IS perdida por presupuesto 21,7%, 0 conversiones.
  - Esto es una señal contradictoria: estas campañas están **fuertemente limitadas por presupuesto** (lo que normalmente pediría subir presupuesto) **pero no generan ninguna conversión** en la ventana auditada (lo que pediría lo contrario -- revisar antes de meter más plata). Candidata prioritaria para diagnóstico profundo: revisar quality score, landing, y si la ventana de conversión es simplemente muy corta para este tipo de producto antes de decidir.
- `[Digital] Remarketing - Visitantes .digital` (Display): $0 de spend pese a estar `ENABLED` -- sugiere un dominio propio ".digital" además de Tiendanube, y una campaña de remarketing que no está gastando.
- 117 asset groups de PMax detectados (109 `ENABLED`) -- volumen muy alto para el spend real de la cuenta, sugiere muchos asset groups obsoletos de campañas ya pausadas.

## Reglas importantes

- Qué NO inventar: rubro exacto, público, tono, promociones, objetivo de CPA/ROAS -- no hay ficha de marca fuente propia de Google Ads (solo la mención lateral en el documento de Simona).
- Qué siempre validar con Mica: si esta cuenta debe tratarse como cuenta activa de Ada, y priorizar la revisión de las 5 campañas Search Generic con alto IS perdido por presupuesto y 0 conversiones antes de tocar el presupuesto de la cuenta.
- Qué evitar: proponer aumentar presupuesto en las campañas Search Generic sin antes entender por qué no convierten.

## Pendientes de información

- [ ] Confirmar con Mica si Vitalis Navitas debe tratarse como cuenta activa de Ada.
- [ ] Completar ficha de marca completa (rubro exacto, público, tono, promociones).
- [ ] Confirmar cuál conversion action es la primaria (hay varias conversiones de compra en paralelo).
- [ ] Diagnosticar por qué las 5 campañas Search Generic por ingrediente gastan sin convertir pese a perder gran parte de su impression share por presupuesto.
- [ ] Confirmar si existe un sitio propio ".digital" además de Tiendanube.
- [ ] Revisar los 117 asset groups de PMax -- volumen alto, posible limpieza de asset groups obsoletos.
