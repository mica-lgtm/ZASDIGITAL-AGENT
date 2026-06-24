# Playbook · Inyectar un cambio de front

1. Crear `experimentos/<tienda>/EXP-NNN-<slug>/` copiando `experimentos/_PLANTILLA.md`.
2. Escribir `front/<tienda>/EXP-NNN-<slug>/variant.js` (+ `variant.css` si hace falta).
   Usar `DanteAB.variante()` si es A/B y `DanteTrack.evento()` para telemetría.
3. Publicar el archivo en el host estático → obtener URL pública.
4. Registrar: `python3 -c "from tn.tiendas import tienda; from tn import scripts; print(scripts.registrar(tienda('<tienda>'), '<url>', where='store'))"`.
5. Guardar el `script_id` en `implementacion.md`.
6. **Probar antes de dar por hecho:** abrir la tienda y verificar el cambio en vivo.
7. Si algo rompe: `scripts.borrar(tienda('<tienda>'), <script_id>)`.
