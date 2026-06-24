# Playbook · Landing conectada al checkout

1. Identificar los `variant_id` de los productos (vía `tn/productos.py`).
2. Para 1 producto: `checkout.cart_permalink(url_tienda, [(variant_id, 1)])`.
3. Para varios / con cliente: `checkout.draft_order(client, items)` → usar `checkout_url`.
4. En la landing, el botón de compra apunta a esa URL → cae en el checkout nativo de TN.
5. Atribución: agregar UTM o un cupón propio del experimento para medir luego.
