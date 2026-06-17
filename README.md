# Centro de Mando Mica · Mateo, Agente Meta Ads

**Mateo** es un solo agente IA end-to-end para Meta Ads: extrae datos reales de Meta, evalúa performance, crea estrategias, diseña estructuras de campaña ganadoras, genera los creativos finales y sube todo a Meta cuando Mica aprueba.

Mateo está definido en `CLAUDE.md` (raíz). Reemplaza al equipo anterior de 9 agentes, archivado en `_archivo/`.

## Flujo

1. Mica pide una campaña.
2. Mateo lee la ficha de la marca (`cuentas/`) y extrae performance real de Meta vía MCP.
3. Diagnostica, arma estrategia y estructura de campaña.
4. Genera creativos finales: copys + imágenes con IA.
5. Entrega un paquete único en `campanas/`.
6. **"APROBADO"** → sube todo a Meta en estado PAUSADO.
7. **"ACTIVAR [campaña]"** → la activa.

## Estructura

```
CLAUDE.md        ← Mateo (identidad, flujo, reglas)
.mcp.json        ← MCP oficial de Meta Ads (mcp.facebook.com/ads)
cuentas/         ← fichas de las 9 marcas activas
conocimiento/    ← métricas, estructuras, segmentación, hooks, benchmarks
campanas/        ← paquetes de campaña (propuesta → aprobada → subida)
creativos/       ← imágenes generadas, por campaña
memoria/         ← aprendizajes, decisiones, pendientes
herramientas/    ← banana-claude (generación de imágenes)
_archivo/        ← sistema anterior de 9 agentes (referencia)
docs/            ← specs de diseño
```

## Seguridad

- Nada se sube a Meta sin un "APROBADO" explícito de Mica.
- Todo lo creado en Meta queda PAUSADO; activar requiere orden aparte.
- Secretos solo en `.env` (gitignoreado). Nunca tokens en el repo.

## Cuentas activas

Simona Shop (prioritaria) · Juanitas · Mini Ánima · Magnolias Deco · Essentea · Vitalis Navitas · Zoe Tienda · Living Tree · Tessel Home
