import { useEffect, useMemo, useRef, useState } from "react";
import "../juanitas.css";
import { FAMILY_OPTIONS, LOGO_URL, PRODUCTS as STATIC_PRODUCTS, type FamilyId, type Product } from "../data/catalog";
import {
  buildQuestions,
  calcResult,
  imageFor,
  imageForFamily,
  money,
  primaryResultProduct,
  recommendations,
  resultHref,
  sizeValueForCart,
  type Answers,
} from "../lib/juanitas-logic";
import { track } from "../lib/track";

type Screen = "home" | "question" | "result";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [family, setFamily] = useState<FamilyId | "">("");
  const [answers, setAnswers] = useState<Answers>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showError, setShowError] = useState(false);
  // Arranca con el catálogo estático (curado) para que la app funcione al
  // instante, y lo reemplaza por datos en vivo (precio/imagen/publicado real
  // de Tienda Nube) apenas responde /api/catalog. Si la API falla, se queda
  // con el estático — nunca rompe la experiencia.
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/catalog")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("catalog fetch failed"))))
      .then((data: { products: Product[] }) => {
        if (!cancelled && Array.isArray(data.products) && data.products.length) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.warn("No se pudo cargar el catálogo en vivo, uso el estático:", err));
    return () => {
      cancelled = true;
    };
  }, []);

  const questions = useMemo(() => (family ? buildQuestions(family, answers) : []), [family, answers]);
  const currentQuestion = questions[questionIndex];

  const result = useMemo(() => (screen === "result" && family ? calcResult(family, answers) : null), [screen, family, answers]);
  const items = useMemo(() => (result && family ? recommendations(products, family, result) : []), [result, family, products]);
  const primaryProduct = result && family ? primaryResultProduct(products, family, result, items) : null;
  const cartSizeValue = result && family ? sizeValueForCart(family, result) : null;

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const needsColorChoice = (primaryProduct?.colors?.length ?? 0) > 1;
  const canAddToCart = !!primaryProduct && !!cartSizeValue && (!needsColorChoice || !!selectedColor);

  // Evita contar el mismo resultado/recomendación dos veces por re-renders
  // (ej. al elegir color) dentro de la misma sesión de preguntas.
  const trackedResultKey = useRef<string | null>(null);
  const trackedProductKey = useRef<string | null>(null);

  useEffect(() => {
    if (screen !== "result" || !result || !family) return;
    const key = `${family}|${result.display}|${result.outOfRange}`;
    if (trackedResultKey.current === key) return;
    trackedResultKey.current = key;
    track("size_resolved", family);
  }, [screen, result, family]);

  useEffect(() => {
    if (!primaryProduct || !family) return;
    const key = `${family}|${primaryProduct.handle}`;
    if (trackedProductKey.current === key) return;
    trackedProductKey.current = key;
    track("product_recommended", family);
  }, [primaryProduct, family]);

  function chooseFamily(id: FamilyId) {
    setFamily(id);
    setAnswers({});
    setQuestionIndex(0);
    setShowError(false);
    setSelectedColor(null);
    setCartError(null);
    setScreen("question");
    window.scrollTo({ top: 0, behavior: "smooth" });
    track("family_selected", id);
  }

  function chooseAnswer(questionId: string, value: string) {
    const nextAnswers = { ...answers, [questionId]: value };
    setAnswers(nextAnswers);
    setShowError(false);
    if (!family) return;

    const nextQuestions = buildQuestions(family, nextAnswers);
    setTimeout(() => {
      if (questionIndex < nextQuestions.length - 1) {
        setQuestionIndex((i) => i + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setScreen("result");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 160);
  }

  function restart() {
    setFamily("");
    setAnswers({});
    setQuestionIndex(0);
    setScreen("home");
    setSelectedColor(null);
    setCartError(null);
    trackedResultKey.current = null;
    trackedProductKey.current = null;
  }

  async function handleAddToCart() {
    if (!primaryProduct || !cartSizeValue || cartLoading) return;
    track("add_to_cart_click", family || undefined);
    setCartLoading(true);
    setCartError(null);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: primaryProduct.handle, size: cartSizeValue, color: selectedColor || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCartError(data.error || "No pudimos armar el carrito. Probá de nuevo.");
        setCartLoading(false);
        track("cart_error", family || undefined);
        return;
      }
      track("cart_success", family || undefined);
      window.location.href = data.checkout_url;
    } catch {
      setCartError("No pudimos conectar con la tienda. Probá de nuevo.");
      setCartLoading(false);
      track("cart_error", family || undefined);
    }
  }

  const progressTotal = questions.length || 1;
  const progressN = questionIndex + 1;
  const progressPct = Math.round((progressN / progressTotal) * 100);

  return (
    <div className="juanitas juanitas-body">
      <div className="app">
        <header className="topbar">
          {screen !== "home" ? (
            <button className="back-link" type="button" onClick={restart}>
              ← Inicio
            </button>
          ) : (
            <div className="logoBox" aria-label="Juanitas">
              <img src={LOGO_URL} alt="Juanitas" />
            </div>
          )}
          <div className="top-pill">Mi Talle Juanitas</div>
        </header>

        <main>
          {/* ── HOME ────────────────────────────────────────────────── */}
          <section className={`screen ${screen === "home" ? "active" : ""}`}>
            <article className="hero">
              <div className="hero-media">
                <img src="https://acdn-us.mitiendanube.com/stores/003/671/131/products/56-0d92a651426ef3200517533817924320-1024-1024.webp" alt="Productos Juanitas" loading="eager" />
                <div className="hero-stack">
                  <img src="https://acdn-us.mitiendanube.com/stores/003/671/131/products/63-7e2abd9858897d70d117761038597896-1024-1024.webp" alt="Corpiños Juanitas" loading="eager" />
                  <img src="https://acdn-us.mitiendanube.com/stores/003/671/131/products/75-7d91311a65133f5c4b17600356866274-1024-1024.webp" alt="Trajes de baño Juanitas" loading="eager" />
                </div>
              </div>
              <div className="hero-body">
                <p className="eyebrow">Probador de talles</p>
                <h1>Encontrá tu talle Juanitas</h1>
                <p className="copy">Respondé con tus medidas y te mostramos el talle recomendado para comprar con más seguridad.</p>
                <div className="benefits">
                  <span className="benefit">Sin vueltas</span>
                  <span className="benefit">Con tus medidas</span>
                  <span className="benefit">En 1 minuto</span>
                </div>
              </div>
            </article>

            <div className="section-head home-choices">
              <p className="eyebrow">Elegí una opción</p>
              <h2>¿Qué estás buscando?</h2>
              <p className="copy">No tenés que elegir un producto todavía. Primero encontramos tu talle.</p>
            </div>

            <div className="family-grid">
              {FAMILY_OPTIONS.map((f) => (
                <button key={f.id} className="family-card" type="button" onClick={() => chooseFamily(f.id)}>
                  <img src={f.image} alt={f.title} />
                  <span className="family-info">
                    <strong>{f.title}</strong>
                    <span>{f.copy}</span>
                    <em className="arrow">Empezar →</em>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* ── QUESTION ────────────────────────────────────────────── */}
          <section className={`screen ${screen === "question" ? "active" : ""}`}>
            <div className="progressWrap">
              <div className="progressTop">
                <span>Pregunta {progressN} de {progressTotal}</span>
                <span>{progressPct}%</span>
              </div>
              <div className="bar">
                <span style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            {currentQuestion && (
              <article className="card question-card">
                <div>
                  <p className="eyebrow">{family}</p>
                  <h2 className="q-title">{currentQuestion.title}</h2>
                  <p className="q-help">{currentQuestion.help}</p>
                </div>
                <div className="options">
                  {currentQuestion.options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`option-btn ${answers[currentQuestion.id] === opt.value ? "selected" : ""}`}
                      onClick={() => chooseAnswer(currentQuestion.id, opt.value)}
                    >
                      <span>
                        <strong>{opt.main}</strong>
                        {opt.sub && <small>{opt.sub}</small>}
                      </span>
                      <span className="radio" />
                    </button>
                  ))}
                </div>
                <div className="measure-tip">Tip: si estás entre dos medidas, elegí la más grande.</div>
              </article>
            )}
            <div className={`error ${showError ? "show" : ""}`}>Elegí una opción para seguir.</div>
          </section>

          {/* ── RESULT ──────────────────────────────────────────────── */}
          {screen === "result" && result && family && (
            <section className="screen active">
              <p className="eyebrow">Tu resultado</p>
              <div className="result-media">
                <img src={primaryProduct ? imageFor(primaryProduct, family) : imageForFamily(family)} alt="Productos Juanitas" />
              </div>
              <article className="card">
                <h2>Talle recomendado para vos</h2>
                <div className="result-size">{result.display}</div>
                <div className="result-product">
                  {primaryProduct && result.subtype === "tirita" ? "Less tirita regulable" : "Resultado según tus medidas"}
                </div>
                <p className="copy">{result.note}</p>
                <div className="tagrow">
                  {result.tags.map((t, i) => (
                    <span className="tag" key={i}>{t}</span>
                  ))}
                </div>
                <div className="notice">
                  {result.outOfRange
                    ? "Para comprar con más seguridad, mirá modelos con curva de talles o consultanos antes de elegir."
                    : result.subtype === "tirita"
                    ? "Este resultado corresponde al modelo Less tirita regulable. Revisá colores y disponibilidad en la tienda."
                    : "Ahora podés elegir el modelo que más te guste y revisar la disponibilidad del talle en la tienda."}
                </div>
                {items.length > 0 && primaryProduct && (
                  <div className="product-recos">
                    <h3 className="reco-title">Tu producto recomendado</h3>
                    <article className="reco-card-primary">
                      <img
                        src={imageFor(primaryProduct, family)}
                        alt={primaryProduct.name}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = imageForFamily(family);
                        }}
                      />
                      <div className="reco-primary-info">
                        <span className="reco-primary-price">{money(primaryProduct.promoPrice) || money(primaryProduct.price) || "Ver precio"}</span>
                        <strong>{primaryProduct.name}</strong>
                        {cartSizeValue ? (
                          <>
                            {needsColorChoice && (
                              <div className="color-chips">
                                {primaryProduct.colors.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    className={`color-chip ${selectedColor === c ? "selected" : ""}`}
                                    onClick={() => setSelectedColor(c)}
                                    title={c}
                                  >
                                    {c.length > 22 ? c.slice(0, 22) + "…" : c}
                                  </button>
                                ))}
                              </div>
                            )}
                            <button className="buy-btn" type="button" disabled={!canAddToCart || cartLoading} onClick={handleAddToCart}>
                              {cartLoading ? "Armando carrito…" : needsColorChoice && !selectedColor ? "Elegí un color/tramado" : "¡LO QUIERO AHORA!"}
                            </button>
                            {cartError && <p className="cart-error">{cartError}</p>}
                          </>
                        ) : (
                          <a className="buy-btn" href={primaryProduct.url} target="_blank" rel="noopener noreferrer">
                            Este talle está disponible →
                          </a>
                        )}
                      </div>
                    </article>
                    {items.length > 1 && (
                      <>
                        <p className="copy reco-alt-label">¿Preferís otro color o tramado? Mismo talle, distinta tela/estampado.</p>
                        <div className="reco-alt-row">
                          {items
                            .filter((p) => p.id !== primaryProduct.id)
                            .map((p) => (
                              <a
                                className="reco-alt"
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                key={p.id}
                                title={p.name}
                              >
                                <img
                                  src={imageFor(p, family)}
                                  alt={p.name}
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = imageForFamily(family);
                                  }}
                                />
                              </a>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                <div className="result-actions">
                  <a className="ghost-btn" href={resultHref(family, result)} target="_blank" rel="noopener noreferrer">
                    Ver productos en la tienda
                  </a>
                  <button className="ghost-btn" type="button" onClick={restart}>
                    Empezar de nuevo
                  </button>
                </div>
              </article>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
