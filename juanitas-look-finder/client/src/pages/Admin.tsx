import { useEffect, useMemo, useState } from "react";
import "../admin.css";

type EventName = "family_selected" | "size_resolved" | "product_recommended" | "add_to_cart_click" | "cart_success" | "cart_error";
type FamilyName = "Bombachas" | "Camisetas" | "Corpiños" | "Trajes de baño";
type EventCounts = Record<EventName, number>;
type Stats = {
  enabled: boolean;
  totals: EventCounts;
  byFamily: Record<FamilyName, EventCounts>;
  daily: { day: string; counts: EventCounts }[];
};

const FUNNEL: { key: EventName; label: string }[] = [
  { key: "family_selected", label: "Eligió una familia" },
  { key: "size_resolved", label: "Resolvió su talle" },
  { key: "product_recommended", label: "Vio un producto recomendado" },
  { key: "add_to_cart_click", label: "Tocó “Lo quiero ahora”" },
  { key: "cart_success", label: "Llegó al checkout" },
];

const FAMILIES: FamilyName[] = ["Bombachas", "Camisetas", "Corpiños", "Trajes de baño"];
const FAMILY_DOT: Record<FamilyName, string> = {
  Bombachas: "var(--a-fam-1)",
  Camisetas: "var(--a-fam-2)",
  "Corpiños": "var(--a-fam-3)",
  "Trajes de baño": "var(--a-fam-4)",
};

function compactNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString("es-AR");
}

function shortDay(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Contraseña incorrecta");
        setLoading(false);
        return;
      }
      onSuccess();
    } catch {
      setError("No pudimos conectar con el servidor. Probá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="admin-root">
      <div className="admin-gate">
        <form className="admin-gate-card" onSubmit={submit}>
          <h1>Panel Admin</h1>
          <p>Métricas de uso de Mi Talle Juanitas.</p>
          <input
            className="admin-gate-input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button className="admin-gate-submit" type="submit" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
          {error && <p className="admin-gate-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}

function FunnelBar({ label, value, base }: { label: string; value: number; base: number }) {
  const pct = base > 0 ? Math.round((value / base) * 100) : 0;
  const widthPct = base > 0 ? Math.max((value / base) * 100, value > 0 ? 3 : 0) : 0;
  const labelFitsInside = widthPct > 22;
  return (
    <div className="admin-funnel-row">
      <span className="admin-funnel-label">{label}</span>
      <div className="admin-funnel-track">
        <div className="admin-funnel-bar" data-full={widthPct >= 99} style={{ width: `${widthPct}%` }}>
          {labelFitsInside && <span className="admin-funnel-value">{compactNumber(value)}</span>}
          {!labelFitsInside && <span className="admin-funnel-value outside">{compactNumber(value)}</span>}
        </div>
      </div>
      <span className="admin-funnel-pct">{pct}%</span>
    </div>
  );
}

function DailyTrend({ daily }: { daily: Stats["daily"] }) {
  const [asTable, setAsTable] = useState(false);
  const max = Math.max(1, ...daily.map((d) => d.counts.family_selected));
  const lastValue = daily.length ? daily[daily.length - 1].counts.family_selected : 0;

  return (
    <section className="admin-section">
      <div className="admin-trend-head">
        <h2 style={{ margin: 0 }}>Uso por día (familia elegida, últimos 14 días)</h2>
        <button className="admin-toggle" type="button" onClick={() => setAsTable((v) => !v)}>
          {asTable ? "Ver gráfico" : "Ver como tabla"}
        </button>
      </div>
      {asTable ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Día</th>
              <th>Eligió familia</th>
            </tr>
          </thead>
          <tbody>
            {daily.map((d) => (
              <tr key={d.day}>
                <td>{shortDay(d.day)}</td>
                <td>{d.counts.family_selected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="admin-trend">
          <div style={{ position: "relative" }}>
            {lastValue > 0 && <span className="admin-trend-last-label">{lastValue}</span>}
            <div className="admin-trend-bars">
              {daily.map((d) => {
                const v = d.counts.family_selected;
                const heightPct = Math.max((v / max) * 100, v > 0 ? 4 : 1);
                return (
                  <div className="admin-trend-col" key={d.day}>
                    <div className="admin-trend-col-hit" tabIndex={0} aria-label={`${shortDay(d.day)}: ${v}`}>
                      <span className="admin-trend-tooltip">
                        {shortDay(d.day)} · {v}
                      </span>
                    </div>
                    <div className="admin-trend-col-bar" style={{ height: `${heightPct}%` }} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="admin-trend-labels">
            <span>{shortDay(daily[0]?.day || "")}</span>
            <span>{shortDay(daily[daily.length - 1]?.day || "")}</span>
          </div>
        </div>
      )}
    </section>
  );
}

function Dashboard({ stats, onLogout }: { stats: Stats; onLogout: () => void }) {
  const cartErrors = stats.totals.cart_error;

  return (
    <div className="admin-root">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div>
            <h1 className="admin-title">Panel Admin</h1>
            <p className="admin-subtitle">Mi Talle Juanitas — métricas de uso</p>
          </div>
          <button className="admin-logout" type="button" onClick={onLogout}>
            Salir
          </button>
        </header>

        {!stats.enabled && (
          <div className="admin-banner">
            KV no está configurado todavía, así que las métricas están en cero. Conectá una base Upstash Redis desde el
            dashboard de Vercel (Storage → Create Database) para que empiecen a registrarse eventos reales.
          </div>
        )}

        <section className="admin-section">
          <h2>Resumen</h2>
          <div className="admin-tiles">
            {FUNNEL.map((f) => (
              <div className="admin-tile" key={f.key}>
                <p className="admin-tile-label">{f.label}</p>
                <p className="admin-tile-value">{compactNumber(stats.totals[f.key])}</p>
              </div>
            ))}
            <div className="admin-tile">
              <p className="admin-tile-label">Errores al armar carrito</p>
              <p className={`admin-tile-value ${cartErrors > 0 ? "critical" : ""}`}>{compactNumber(cartErrors)}</p>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <h2>Funnel de conversión</h2>
          <div className="admin-funnel">
            {FUNNEL.map((f) => (
              <FunnelBar key={f.key} label={f.label} value={stats.totals[f.key]} base={stats.totals.family_selected} />
            ))}
          </div>
        </section>

        <section className="admin-section">
          <h2>Por familia</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Familia</th>
                <th>Eligió</th>
                <th>Resolvió talle</th>
                <th>Vio recomendado</th>
                <th>Click carrito</th>
                <th>Checkout</th>
              </tr>
            </thead>
            <tbody>
              {FAMILIES.map((fam) => {
                const c = stats.byFamily[fam];
                return (
                  <tr key={fam}>
                    <td>
                      <span className="admin-fam-name">
                        <span className="admin-fam-dot" style={{ background: FAMILY_DOT[fam] }} />
                        {fam}
                      </span>
                    </td>
                    <td>{c.family_selected}</td>
                    <td>{c.size_resolved}</td>
                    <td>{c.product_recommended}</td>
                    <td>{c.add_to_cart_click}</td>
                    <td>{c.cart_success}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <DailyTrend daily={stats.daily} />
      </div>
    </div>
  );
}

export default function Admin() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadStats = useMemo(
    () => async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/stats");
        if (res.status === 401) {
          setNeedsLogin(true);
          setStats(null);
        } else if (res.ok) {
          setStats(await res.json());
          setNeedsLogin(false);
        }
      } catch {
        setNeedsLogin(true);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="admin-root">
        <div className="admin-loading">Cargando…</div>
      </div>
    );
  }

  if (needsLogin || !stats) {
    return <LoginGate onSuccess={loadStats} />;
  }

  return (
    <Dashboard
      stats={stats}
      onLogout={async () => {
        await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
        setNeedsLogin(true);
        setStats(null);
      }}
    />
  );
}
