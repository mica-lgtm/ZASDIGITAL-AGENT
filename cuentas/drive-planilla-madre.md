# Drive · PLANILLA MADRE MANUS · Índice de acceso

Carpeta raíz: `1z3Mxrnn5BG1qqk-Qk4CZYPNi7F5lN-e7` (dueña: nani@zasdigital.com).
Acceso verificado vía MCP de Google Drive el 2026-06-12 (antes era inaccesible; ya se resolvió).

## Qué hay adentro

Una carpeta por marca, con subcarpetas por canal. Los reportes de Meta son CSV a nivel **conjunto de anuncio**, un archivo por mes, con naming `[MARCA]-META-[Cuenta]-[MES]-[COMPLETO|PARCIAL].csv`.

Columnas de los CSV de META (verificado en Simona): campaña, conjunto, anuncio, estado de entrega, resultados, costo por resultado, importe gastado (ARS), **valor de conversión de compra, ROAS, compras, costo por compra, ticket promedio, tasa de conversión del sitio (PUR/VW), pagos iniciados, artículos agregados al carrito y su costo, visitas a destino y su costo, clics únicos en enlace, ThruPlays, frecuencia, CTR único, alcance, impresiones, CPM, tasa de hook**, inicio/fin del informe.

→ Esto complementa al MCP de Meta, que NO expone carritos, pagos iniciados, ticket promedio ni tasa de hook.

## Carpetas por marca (IDs para consultar vía MCP)

| Marca | Carpeta raíz | Subcarpetas |
|---|---|---|
| SIMONA | `1Enq6VVongStlqWSGtuiiZP4zmhE1UFi5` | META `1ObateIDj5vIL6h3-W0xCuSJBAFZmN8iq` · GOOGLE · TIKTOK · Pinterest · JUNIO · MÁS VENDIDOS TN · MASTER METRICS |
| JUANITAS | `1zLgw3E0nU3Ffow4JtGbs351CS4bpc7mW` | Meta `1OW5-arfPFsiXHrB0xSxgETWTDgQLlDPa` · Google · TikTok · Pinterest · MELI · MÁS VENDIDOS TN · MASTER METRICS |
| JUANITAS MAYORISTA | `1PM6H7aqRzIgBH2SRXFgNrtUg6_uNKrAx` | META `1zWtYclh8u71kS2fUnhqlxcisDvRZZp30` · MÁS VENDIDOS · MASTER METRICS |
| MINI ÁNIMA | `10RwW514s8hV3k-nLnEwdlRLoLOZ65HqJ` | META `1Wt7XC_r7P3YR_T_Lzk7f6EaxjZMBgmyv` · GOOGLE · TIK TOK · PINTEREST · MÁS VENDIDOS TN · MASTER METRICS |
| MAGNOLIAS | `1zvCqGnf2OZEF8Huhu3gvL1dp2d1yfWJy` | Meta `1tAcP4IZgipyS4dl9GoJQKhOQdmJ4A6NO` · Google · TikTok · Pinterst · MÁS VENDIDOS TN · MASTER METRICS |
| VITALIS NAVITAS | `1eDuthZEy5onmaQc_HFrAbFASQC5Jz40q` | META CUENTA PRINCIPAL `1IBkH8Q0wzlwDdNQAUKxxQoNf7xYo_XGD` · META CUENTA SECUNDARIA \| BECCA · META CUENTA SECUNDARIA \| MERCO · GOOGLE · TIK TOK · PINTEREST · MERCADO LIBRE · MÁS VENDIDOS TN · MASTER METRICS |
| ZOE | `12WwtXfuEthMErjEFDdDTe5lm5wkOANeJ` | META `1vweIN1x7szKGKd4vhObUhdCIWS0ZN8mk` · DATOS TIENDA NUBE |
| LIVINGTREE | `1Nj-Uvpb2JnLJB53XB0YLp-j-L2RHkBo3` | META `1szQqD9ApN102R4dH8_TyK7ZuqM3Wa-tt` · MASTER METRICS |
| TESSEL HOME | `1Ped81c_Undgp_X6DnkagfYnZZI7ajvss` | META `1i98HJyH4zDGhTZ9RQxFGjmCitM_cp2NE` · DATOS TIENDA NUBE |

## Archivos META de Simona ya identificados (ejemplo del patrón)

- `SIMONA-META-Cuenta-Principal-MAYO-COMPLETO.csv` · `1EieDT6TRfmA7YI6wq6Eb9II4KQtSu7px`
- `SIMONA-META-Cuenta-Principal-JUNIO-PARCIAL.csv` · `1OudImmmLldYVVDRbIEMeOz4XCXdGAiVd` (1-jun → 9-jun)
- `SIMONA-META-Cuenta-Secundaria-MAYO-COMPLETO.csv` · `1ZywzDSnK4gHPswDONpXvL_g7M0EuCx5z`
- `SIMONA-META-Cuenta-Secundaria-JUNIO-PARCIAL.csv` · `1gAF6WhzOhTHJ_Yk9BBPOVGMInHeK0QMb`

## Observaciones

- **Essentea NO tiene carpeta** en PLANILLA MADRE MANUS. Dato pendiente: preguntar a Mica si Essentea se reporta en otro lado o no entra en la planilla.
- La "cuenta secundaria" de Simona en el Drive corre las campañas de catálogo con prefijo `ZAS |` — la secundaria está activa, no es solo respaldo.
- Dueños de archivos: nani@, lautaro@ (zasdigital) y facu.kumz@gmail.com según marca/canal.
- Cómo consultar: buscar con `parentId = '[ID de subcarpeta META]'` y leer el CSV del mes que corresponda. Para campañas nuevas, usar el último COMPLETO + el PARCIAL del mes en curso.
