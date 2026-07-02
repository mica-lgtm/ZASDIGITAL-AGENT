# Aprendizajes de Dante

> Destilado acumulado de todos los experimentos. Cada tienda nueva arranca con esto.
> Formato: una línea por aprendizaje, con la evidencia (EXP que lo respalda).
> Los ítems marcados [seed] vienen de literatura CRO y experiencia en TN, no de experimentos propios — se promueven a "Qué funciona" recién cuando un EXP los valida.

## Qué funciona
- (vacío — se completa con el primer experimento ganador)

## Qué no funciona
- (vacío)

## Por validar
- [seed] Descripciones de producto ricas (HTML con bullets, medidas, materiales) suben conversión en PDP: `products.description` renderiza HTML raw, es el lever más barato de la plataforma.
- [seed] En tiendas TN el 60-75% del tráfico es mobile: un CTA sticky de compra en mobile debería subir add-to-cart.
- [seed] Señales de confianza cerca del botón de compra (cuotas, medios de pago, política de cambios) bajan anxiety en la PDP — las tiendas TN suelen tener la política de cambios enterrada en el footer.
- [seed] Mostrar el umbral de envío gratis en el carrito ("te faltan $X para envío gratis") sube AOV.
- [seed] Formato de precio argentino correcto ($1.290, no $1,290) evita fricción de lectura; verificar en cada tema.
- [seed] Urgencia honesta (stock real bajo, vigencia real de promo) funciona; urgencia inventada quema confianza de marca y es política de no-uso.
- [seed] Cupón de 0% como tracker es el mecanismo de atribución de brazo más confiable en TN (sin split testing nativo): medir con `cupones.uso_por_cupon()`.
