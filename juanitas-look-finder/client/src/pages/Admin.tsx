import { useState } from "react";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "juanitas2024";

// Looker Studio report URL — reemplazar con la URL real del reporte compartido
const LOOKER_URL = import.meta.env.VITE_LOOKER_STUDIO_URL || "";

export default function Admin() {
  const [input, setInput] = useState("");
  const [auth, setAuth] = useState(() => sessionStorage.getItem("jt_admin") === "1");
  const [error, setError] = useState(false);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem("jt_admin", "1");
      setAuth(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (!auth) {
    return (
      <div style={styles.gate}>
        <div style={styles.gateCard}>
          <div style={styles.logo}>🔒</div>
          <h1 style={styles.title}>Panel Admin</h1>
          <p style={styles.sub}>Look Finder · Juanitas</p>
          <form onSubmit={login} style={styles.form}>
            <input
              type="password"
              placeholder="Contraseña"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ ...styles.input, borderColor: error ? "#f41f82" : "#e0d0d8" }}
              autoFocus
            />
            {error && <p style={styles.errorMsg}>Contraseña incorrecta</p>}
            <button type="submit" style={styles.btn}>Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  if (!LOOKER_URL) {
    return (
      <div style={styles.setup}>
        <div style={styles.setupCard}>
          <h2 style={styles.setupTitle}>⚙️ Configuración pendiente</h2>
          <p style={styles.setupText}>
            Para ver las estadísticas, creá un reporte en{" "}
            <a href="https://lookerstudio.google.com" target="_blank" rel="noopener noreferrer" style={styles.link}>
              Looker Studio
            </a>{" "}
            conectado a tu propiedad GA4, habilitá la opción <strong>"Compartir → Embeber"</strong> y pegá la URL en la variable de entorno{" "}
            <code style={styles.code}>VITE_LOOKER_STUDIO_URL</code>.
          </p>
          <div style={styles.steps}>
            <p style={styles.stepTitle}>Pasos rápidos:</p>
            <ol style={styles.ol}>
              <li>Abrí <a href="https://lookerstudio.google.com" target="_blank" rel="noopener noreferrer" style={styles.link}>lookerstudio.google.com</a></li>
              <li>Crear → Reporte → Conectar a <strong>Google Analytics</strong></li>
              <li>Elegí la propiedad de Juanitas (GTM-PNKKGBHK)</li>
              <li>Agregá los eventos: <code style={styles.code}>look_finder_*</code></li>
              <li>Compartir → Embeber informe → copiá la URL del iframe</li>
              <li>Agrega <code style={styles.code}>VITE_LOOKER_STUDIO_URL=&lt;url&gt;</code> en Vercel → Settings → Env Vars</li>
              <li>Redeploy</li>
            </ol>
          </div>
          <button style={styles.logoutBtn} onClick={() => { sessionStorage.removeItem("jt_admin"); setAuth(false); }}>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Panel Look Finder</h1>
          <p style={styles.headerSub}>Juanitas · Estadísticas en tiempo real</p>
        </div>
        <button style={styles.logoutBtn} onClick={() => { sessionStorage.removeItem("jt_admin"); setAuth(false); }}>
          Cerrar sesión
        </button>
      </header>
      <iframe
        src={LOOKER_URL}
        style={styles.iframe}
        frameBorder={0}
        allowFullScreen
        title="Estadísticas Look Finder"
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  gate: {
    minHeight: "100vh",
    background: "#fff8fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Poppins, Inter, sans-serif",
  },
  gateCard: {
    background: "#fff",
    borderRadius: 24,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 360,
    boxShadow: "0 8px 32px rgba(244,31,130,0.12)",
    border: "1px solid rgba(244,31,130,0.12)",
    textAlign: "center",
  },
  logo: { fontSize: 36, marginBottom: 12 },
  title: { margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#2e242c", letterSpacing: "-0.03em" },
  sub: { margin: "0 0 24px", fontSize: 13, color: "#9e8a96" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1.5px solid #e0d0d8",
    fontSize: 15,
    outline: "none",
    fontFamily: "inherit",
  },
  errorMsg: { margin: 0, fontSize: 13, color: "#f41f82" },
  btn: {
    padding: "13px",
    background: "#f41f82",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  setup: {
    minHeight: "100vh",
    background: "#fff8fb",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "40px 16px",
    fontFamily: "Poppins, Inter, sans-serif",
  },
  setupCard: {
    background: "#fff",
    borderRadius: 20,
    padding: "32px 28px",
    maxWidth: 560,
    width: "100%",
    boxShadow: "0 4px 20px rgba(244,31,130,0.1)",
  },
  setupTitle: { margin: "0 0 12px", fontSize: 20, fontWeight: 800, color: "#2e242c" },
  setupText: { fontSize: 14, color: "#5a4a56", lineHeight: 1.6, margin: "0 0 20px" },
  steps: { background: "#fff5fa", borderRadius: 12, padding: "16px 20px", marginBottom: 24 },
  stepTitle: { margin: "0 0 8px", fontWeight: 700, fontSize: 13, color: "#f41f82" },
  ol: { margin: 0, paddingLeft: 18, fontSize: 13, color: "#5a4a56", lineHeight: 2 },
  link: { color: "#f41f82", fontWeight: 600 },
  code: { background: "#f4f0f3", padding: "1px 6px", borderRadius: 4, fontSize: 12, fontFamily: "monospace" },
  logoutBtn: {
    background: "transparent",
    border: "1.5px solid #e0d0d8",
    borderRadius: 10,
    padding: "8px 16px",
    fontSize: 13,
    cursor: "pointer",
    color: "#9e8a96",
    fontFamily: "inherit",
  },
  dashboard: {
    minHeight: "100vh",
    background: "#fff8fb",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Poppins, Inter, sans-serif",
  },
  header: {
    padding: "20px 28px",
    borderBottom: "1px solid rgba(244,31,130,0.1)",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { margin: 0, fontSize: 18, fontWeight: 800, color: "#2e242c" },
  headerSub: { margin: "2px 0 0", fontSize: 12, color: "#9e8a96" },
  iframe: { flex: 1, width: "100%", minHeight: "calc(100vh - 72px)", border: "none" },
};
