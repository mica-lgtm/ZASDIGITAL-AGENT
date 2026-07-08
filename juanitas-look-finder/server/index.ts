import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { getLiveCatalog, getRawProduct, ACCESS_TOKEN, TN_BASE, TN_HEADERS, tnStr, type TNVariantRaw } from "../api/_lib/tn.js";

function normalize(s: string): string {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
}

function findVariant(variants: TNVariantRaw[], size: string, color?: string): TNVariantRaw | null {
  const normSize = normalize(size);
  const normColor = color ? normalize(color) : null;
  const candidates = variants.filter((v) => {
    const vals = v.values.map((x) => normalize(tnStr(x)));
    const sizeMatch = vals.includes(normSize);
    const colorMatch = normColor ? vals.includes(normColor) : true;
    return sizeMatch && colorMatch;
  });
  return candidates[0] || null;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // ── GET /api/health ───────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, token: !!ACCESS_TOKEN });
  });

  // ── GET /api/catalog ──────────────────────────────────────────────────────
  app.get("/api/catalog", async (_req, res) => {
    try {
      const catalog = await getLiveCatalog();
      res.json({ products: Array.from(catalog.values()) });
    } catch (err) {
      console.error("/api/catalog error:", err);
      res.status(500).json({ error: "Error al cargar el catálogo" });
    }
  });

  // ── POST /api/cart ────────────────────────────────────────────────────────
  app.post("/api/cart", async (req, res) => {
    const { handle, size, color } = req.body as { handle?: string; size?: string; color?: string };
    if (!handle || !size) {
      res.status(400).json({ error: "handle y size son requeridos" });
      return;
    }
    if (!ACCESS_TOKEN) {
      res.status(503).json({ error: "TIENDANUBE_ACCESS_TOKEN no configurado" });
      return;
    }
    try {
      const raw = await getRawProduct(handle);
      if (!raw) {
        res.status(404).json({ error: "Producto no encontrado en la tienda" });
        return;
      }
      const variant = findVariant(raw.variants, size, color);
      if (!variant) {
        res.status(422).json({ error: "No se encontró una variante disponible para ese talle/color" });
        return;
      }
      const payload = {
        contact_name: "Visitante",
        contact_lastname: "MiTalleJuanitas",
        contact_email: "tu@email.com",
        payment_status: "unpaid",
        sale_channel: "Mi Talle Juanitas",
        products: [{ variant_id: variant.id, quantity: 1 }],
      };
      const tnRes = await fetch(`${TN_BASE}/draft_orders`, { method: "POST", headers: TN_HEADERS, body: JSON.stringify(payload) });
      const data = await tnRes.json();
      if (!tnRes.ok) {
        console.error("TN draft_orders error:", data);
        res.status(502).json({ error: "Error al crear el carrito en Tienda Nube", detail: data });
        return;
      }
      res.json({ checkout_url: data.checkout_url, draft_order_id: data.id });
    } catch (err) {
      console.error("/api/cart error:", err);
      res.status(500).json({ error: "Error interno al crear el carrito" });
    }
  });

  // ── Static / SPA ─────────────────────────────────────────────────────────
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    if (ACCESS_TOKEN) {
      getLiveCatalog()
        .then((c) => console.log(`Catalog cache warmed (${c.size} productos)`))
        .catch((e) => console.warn("Catalog pre-warm failed:", e));
    }
  });
}

startServer().catch(console.error);
