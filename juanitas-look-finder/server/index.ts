import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { getLiveCatalog, ACCESS_TOKEN } from "../api/_lib/tn.js";

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
