import { useMemo, useState } from "react";
import "../juanitas.css";
import { FAMILY_OPTIONS, LOGO_URL, type FamilyId } from "../data/catalog";
import {
  buildQuestions,
  calcResult,
  imageFor,
  imageForFamily,
  money,
  primaryResultProduct,
  recommendations,
  resultHref,
  type Answers,
} from "../lib/juanitas-logic";

type Screen = "home" | "question" | "result";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [family, setFamily] = useState<FamilyId | "">("");
  const [answers, setAnswers] = useState<Answers>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showError, setShowError] = useState(false);

  const questions = useMemo(() => (family ? buildQuestions(family, answers) : []), [family, answers]);
  const currentQuestion = questions[questionIndex];

  const result = useMemo(() => (screen === "result" && family ? calcResult(family, answers) : null), [screen, family, answers]);
  const items = useMemo(() => (result && family ? recommendations(family, result) : []), [result, family]);
  const primaryProduct = result && family ? primaryResultProduct(family, result, items) : null;

  function chooseFamily(id: FamilyId) {
    setFamily(id);
    setAnswers({});
    setQuestionIndex(0);
    setShowError(false);
    setScreen("question");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
  }

  const progressTotal = questions.length || 1;
  const progressN = questionIndex + 1;
  const progressPct = Math.round((progressN / progressTotal) * 100);

  return (
    <div className="juanitas juanitas-body">
      <div className="app">
        <header className="topbar">
          <div className="logoBox" aria-label="Juanitas">
            <img src={LOGO_URL} alt="Juanitas" />
          </div>
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
                <div className="result-actions">
                  <a className="buy-btn" href={resultHref(family, result)} target="_blank" rel="noopener noreferrer">
                    Ver productos en la tienda
                  </a>
                  <button className="ghost-btn" type="button" onClick={restart}>
                    Empezar de nuevo
                  </button>
                </div>
                {items.length > 0 && (
                  <div className="product-recos">
                    <h3 className="reco-title">Productos para mirar con tu talle</h3>
                    <div className="reco-grid">
                      {items.map((p) => (
                        <article className="reco-card" key={p.id}>
                          <img
                            src={imageFor(p, family)}
                            alt={p.name}
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = imageForFamily(family);
                            }}
                          />
                          <div className="reco-info">
                            <strong>{p.name}</strong>
                            <span>{money(p.promoPrice) || money(p.price) || "Ver precio"}</span>
                            <a href={p.url} target="_blank" rel="noopener noreferrer">
                              Ver producto
                            </a>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </section>
          )}
        </main>

        {screen !== "home" && (
          <nav className="nav-bottom show">
            <button className="pink-btn" type="button" onClick={restart}>
              Volver al inicio
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
