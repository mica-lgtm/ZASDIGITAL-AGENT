"""
Exporta los 7 creativos del HTML a PNG (1080×1080px).
Ejecutar: python export_pngs.py
"""
import asyncio
from playwright.async_api import async_playwright
import os

HTML_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "creativos.html"))
OUTPUT_DIR = os.path.dirname(HTML_PATH)

AD_NAMES = [
    "PLACA_CUPON-URGENCIA_GENERAL_V1",
    "PLACA_OBJECION-TALLES_GENERAL_V1",
    "PLACA_RECORDATORIO_PACKS_V1",
    "CARRUSEL_CATALOGO_MAS-VENDIDOS_V1",
    "PLACA_RECOMPRA_CAJON_V1",
    "PLACA_CROSSSELL_PACKX6_V1",
    "PLACA_EMOCIONAL_COMODIDAD_V1",
]

ISOLATE_JS = """
(idx) => {
    // Hide everything except the target .inner
    const inners = document.querySelectorAll('.inner');
    const target = inners[idx];
    if (!target) return false;

    // Grab the HTML of the target inner
    const clone = target.cloneNode(true);

    // Replace body with a clean wrapper
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            html, body { width: 1080px; height: 1080px; overflow: hidden; background: transparent; }
        </style>
    `);
    document.body.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:1080px;height:1080px;position:relative;overflow:hidden;';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Remove the scale transform from the cloned inner
    clone.style.transform = 'none';
    clone.style.position = 'relative';
    clone.style.top = '0';
    clone.style.left = '0';

    return true;
}
"""

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        for i, name in enumerate(AD_NAMES):
            print(f"[{i+1}/7] Capturando {name}...")
            page = await browser.new_page(viewport={"width": 1080, "height": 1080})
            await page.goto(f"file://{HTML_PATH}")
            await page.wait_for_load_state("networkidle")

            ok = await page.evaluate(ISOLATE_JS, i)
            if not ok:
                print(f"  ERROR: no se encontró el inner #{i}")
                await page.close()
                continue

            # Pequeña pausa para que las fotos terminen de renderizar
            await page.wait_for_timeout(600)

            output_path = os.path.join(OUTPUT_DIR, f"{name}.png")
            await page.screenshot(
                path=output_path,
                clip={"x": 0, "y": 0, "width": 1080, "height": 1080},
            )
            print(f"  ✓ Guardado: {output_path}")
            await page.close()

        await browser.close()
        print("\n✅ Exportación completa — 7 PNGs en creativos/juanitas-remarketing-duo/")

asyncio.run(main())
