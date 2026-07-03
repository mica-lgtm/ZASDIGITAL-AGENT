import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

// ─── ASSETS ──────────────────────────────────────────────────────────────────

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663489253832/GCNEfmb632ab7e3kLMogtf/simona_hero_bg-gSwKLDuL9uBpMGpRgbPyqf.webp";

// Cupón "look completo": se aplica automáticamente como discount en el draft
// order al comprar (ver /api/cart) — la clienta no tiene que ingresar nada.
const COUPON_CODE = "LOOKCOMPLETO";
const DISCOUNT_PERCENT = 15;

// ─── STATIC UI DATA ──────────────────────────────────────────────────────────

const OCCASIONS = [
  {
    id: "casual",
    label: "Día casual",
    sub: "Salidas y actividades cotidianas",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663489253832/GCNEfmb632ab7e3kLMogtf/simona_casual_card-agapjfK4g8LJxGyRBt33S5.webp",
  },
  {
    id: "oficina",
    label: "Trabajo / Oficina",
    sub: "Looks profesionales y prolijos",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663489253832/GCNEfmb632ab7e3kLMogtf/simona_office_card-NngjnDLLBdaegFD8sxdn5A.webp",
  },
  {
    id: "noche",
    label: "Salida de noche",
    sub: "Eventos, cenas y ocasiones especiales",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663489253832/GCNEfmb632ab7e3kLMogtf/simona_night_card-AhEiPNAPcxAc6aryPKhdxG.webp",
  },
];

const STYLES = [
  { id: "clasico", label: "Clásico", sub: "Atemporal y sofisticado" },
  { id: "trendy", label: "Trendy", sub: "Moderno y con actitud" },
  { id: "relaxed", label: "Relaxed", sub: "Cómodo y descontracturado" },
];

const TALLES = ["XS", "S", "M", "L", "XL"];

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Product = { name: string; price: string; img: string; url: string };
type Look = { name: string; heroImg: string; products: Product[] };
type Catalog = Record<string, Look>;

// ─── URL PARAMS — deep link support ─────────────────────────────────────────

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const look = params.get("look") || "";
  const talle = params.get("talle") || "";
  if (look && talle) {
    const parts = look.split("-");
    // look keys are: {occasion}-{style} where occasion has no "-"
    const occasion = parts[0] || "";
    const style = parts.slice(1).join("-");
    return { occasion, style, talle, lookKey: look, fromUrl: true };
  }
  return { occasion: "", style: "", talle: "", lookKey: "", fromUrl: false };
}

// ─── CATALOG HOOK ────────────────────────────────────────────────────────────

function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => {
        if (!r.ok) throw new Error("catalog error");
        return r.json();
      })
      .then((d) => setCatalog(d.looks))
      .catch(() => setError(true));
  }, []);

  return { catalog, error };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function sumPrices(products: Product[]): number {
  return products.reduce((acc, p) => acc + parseInt(p.price.replace(/\D/g, ""), 10), 0);
}

function calcTotal(products: Product[]): string {
  return `$${sumPrices(products).toLocaleString("es-AR")}`;
}

function calcDiscountedTotal(products: Product[]): string {
  const discounted = Math.round(sumPrices(products) * (1 - DISCOUNT_PERCENT / 100));
  return `$${discounted.toLocaleString("es-AR")}`;
}

// Resuelve el look a mostrar: si el pedido (ocasión+estilo) no tiene productos
// disponibles, busca otro estilo dentro de la misma ocasión y, si tampoco hay,
// cualquier otro look disponible en el catálogo. Nunca deja al usuario frente
// a un "look no disponible": siempre muestra algo con productos reales.
function pickAvailableLookKey(catalog: Catalog, occasion: string, style: string): string {
  const keys = Object.keys(catalog);
  if (keys.length === 0) return "";

  const hasProducts = (key: string) => (catalog[key]?.products.length ?? 0) > 0;
  const primary = occasion && style ? `${occasion}-${style}` : "";

  if (primary && hasProducts(primary)) return primary;

  if (occasion) {
    for (const s of STYLES) {
      const key = `${occasion}-${s.id}`;
      if (key !== primary && hasProducts(key)) return key;
    }
  }

  for (const key of keys) {
    if (hasProducts(key)) return key;
  }

  return (primary && catalog[primary]) ? primary : keys[0];
}

// ─── SWIPEABLE CARD STACK ────────────────────────────────────────────────────

type CardItem = { id: string; label: string; sub: string; img?: string };

function SwipeCards({
  items,
  onSelect,
  type,
}: {
  items: CardItem[];
  onSelect: (id: string) => void;
  type: "image" | "text";
}) {
  const [current, setCurrent] = useState(0);
  const dragX = useMotionValue(0);
  const rotate = useTransform(dragX, [-200, 200], [-18, 18]);
  const opacity = useTransform(dragX, [-150, 0, 150], [0.6, 1, 0.6]);
  const dragRef = useRef(false);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      const threshold = 80;
      if (Math.abs(info.offset.x) > threshold) {
        const dir = info.offset.x > 0 ? 1 : -1;
        const idx = dir > 0 ? current : (current + 1) % items.length;
        const item = items[idx % items.length];
        onSelect(item.id);
        dragRef.current = true;
      }
    },
    [current, items, onSelect]
  );

  const handleTap = useCallback(
    (id: string) => {
      if (!dragRef.current) {
        onSelect(id);
      }
      dragRef.current = false;
    },
    [onSelect]
  );

  const visibleItems = items.slice(0, 3);

  if (type === "image") {
    return (
      <div className="relative w-full flex flex-col items-center">
        <p className="text-[10px] font-['Inter',sans-serif] tracking-[3px] uppercase text-white/30 mb-6">
          Tocá para elegir
        </p>

        <div className="relative w-full max-w-xs mx-auto" style={{ height: "420px" }}>
          {visibleItems.map((item, i) => {
            const isTop = i === 0;
            const offset = i * 8;
            const scale = 1 - i * 0.04;

            return (
              <motion.div
                key={item.id}
                className="absolute inset-x-0 mx-auto cursor-pointer"
                style={{
                  width: "100%",
                  maxWidth: "280px",
                  height: "400px",
                  top: offset,
                  left: "50%",
                  x: isTop ? dragX : 0,
                  rotate: isTop ? rotate : 0,
                  opacity: isTop ? opacity : 1 - i * 0.15,
                  scale,
                  zIndex: 10 - i,
                  translateX: "-50%",
                }}
                drag={isTop ? "x" : false}
                dragConstraints={{ left: -300, right: 300 }}
                dragElastic={0.7}
                onDragEnd={isTop ? handleDragEnd : undefined}
                onTap={isTop ? () => handleTap(item.id) : undefined}
                whileTap={isTop ? { scale: 0.97 } : {}}
              >
                <div className="w-full h-full overflow-hidden relative">
                  <img
                    src={item.img}
                    alt={item.label}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-xl font-bold text-white leading-tight">{item.label}</p>
                    <p className="text-xs font-['Inter',sans-serif] font-light text-white/60 mt-1">{item.sub}</p>
                  </div>
                  {isTop && (
                    <>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-2xl select-none">‹</div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-2xl select-none">›</div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex gap-2 mt-6">
          {items.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current % items.length ? "w-6 bg-[#C4A882]" : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3 mt-6 w-full max-w-xs">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="flex-1 py-2.5 border border-white/15 hover:border-[#C4A882]/50 text-white/50 hover:text-white text-[11px] font-['Inter',sans-serif] font-medium tracking-widest uppercase transition-all duration-150 active:scale-95"
            >
              {item.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs mx-auto flex flex-col gap-3">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="group flex items-center justify-between px-6 py-5 border border-white/10 hover:border-[#C4A882]/50 hover:bg-white/5 transition-all duration-200 active:scale-[0.98]"
        >
          <div className="text-left">
            <p className="text-base font-bold text-white">{item.label}</p>
            <p className="text-xs font-['Inter',sans-serif] font-light text-white/40 mt-0.5">{item.sub}</p>
          </div>
          <span className="text-white/20 group-hover:text-[#C4A882] transition-colors">→</span>
        </button>
      ))}
    </div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const pct = Math.min(((step - 1) / 3) * 100, 100);
  return (
    <div className="w-full h-px bg-white/10">
      <motion.div
        className="h-full bg-[#8B6347]"
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

// ─── COUPON BADGE ────────────────────────────────────────────────────────────
// El cupón se aplica solo (discount automático en el draft order de /api/cart)
// al tocar "Comprar el look" — esto es solo informativo, no hay nada que copiar.

function CouponBadge() {
  return (
    <div className="w-full border border-dashed border-[#C4A882]/40 bg-[#C4A882]/5 text-[#C4A882] font-['Inter',sans-serif] text-xs py-3 text-center flex items-center justify-center gap-2">
      <span>✦</span>
      <span className="tracking-[2px] uppercase font-semibold">Cupón {COUPON_CODE} aplicado</span>
      <span className="text-white/40">· {DISCOUNT_PERCENT}% off ya incluido</span>
    </div>
  );
}

// ─── SHARE BUTTON ────────────────────────────────────────────────────────────

function ShareButton({ lookKey, talle }: { lookKey: string; talle: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.search = `?look=${lookKey}&talle=${talle}`;
    url.hash = "";
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // fallback: select text
    });
  };

  return (
    <button
      onClick={handleShare}
      className="w-full border border-white/10 hover:border-[#C4A882]/30 text-white/35 hover:text-[#C4A882] font-['Inter',sans-serif] font-medium text-xs tracking-[2px] uppercase py-3 text-center transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
    >
      {copied ? (
        <>
          <span className="text-[#C4A882]">✓</span>
          <span className="text-[#C4A882]">Link copiado</span>
        </>
      ) : (
        <>
          <span>⎘</span>
          <span>Compartir este look</span>
        </>
      )}
    </button>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function Home() {
  const urlParams = getUrlParams();

  const [step, setStep] = useState(urlParams.fromUrl ? 4 : 0);
  const [occasion, setOccasion] = useState(urlParams.occasion);
  const [style, setStyle] = useState(urlParams.style);
  const [talle, setTalle] = useState(urlParams.talle);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartRedirecting, setCartRedirecting] = useState(false);
  const [cartError, setCartError] = useState("");
  const [cartWarning, setCartWarning] = useState("");

  const { catalog, error: catalogError } = useCatalog();

  const lookKey = catalog ? pickAvailableLookKey(catalog, occasion, style) : "";
  const look = catalog && lookKey ? (catalog[lookKey] ?? null) : null;
  const resolvedOccasion = lookKey ? lookKey.split("-")[0] : occasion;

  // Update URL when look is set (for sharable links)
  useEffect(() => {
    if (step === 4 && lookKey && talle) {
      const url = new URL(window.location.href);
      url.search = `?look=${lookKey}&talle=${talle}`;
      window.history.replaceState({}, "", url.toString());
    }
  }, [step, lookKey, talle]);

  const handleOccasion = (id: string) => { setOccasion(id); setTimeout(() => setStep(2), 250); };
  const handleStyle = (id: string) => { setStyle(id); setTimeout(() => setStep(3), 250); };
  const handleTalle = (t: string) => { setTalle(t); setTimeout(() => setStep(4), 250); };

  const reset = () => {
    setStep(0);
    setOccasion("");
    setStyle("");
    setTalle("");
    setCartError("");
    setCartWarning("");
    setCartLoading(false);
    setCartRedirecting(false);
    // Clear URL params
    window.history.replaceState({}, "", window.location.pathname);
  };

  const handleBuyLook = async () => {
    if (!lookKey || !talle || cartLoading || cartRedirecting) return;
    setCartLoading(true);
    setCartError("");
    setCartWarning("");

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookKey, talle }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCartError(data.error || "No se pudo crear el carrito");
        setCartLoading(false);
        return;
      }

      if (data.warning) {
        // Mantener el botón deshabilitado durante el redirect
        setCartLoading(false);
        setCartRedirecting(true);
        setCartWarning(data.warning);
        setTimeout(() => { window.location.href = data.checkout_url; }, 2000);
      } else {
        window.location.href = data.checkout_url;
      }
    } catch {
      setCartError("Error de conexión. Intentá de nuevo.");
      setCartLoading(false);
    }
  };

  const slideVariants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
  };

  return (
    <div className="relative min-h-screen bg-[#0F0D0C] overflow-hidden font-['Playfair_Display',serif]">
      {/* BG */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{ backgroundImage: `url(${HERO_BG})`, opacity: step === 0 ? 0.5 : 0.12 }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-6 pb-0">
        <a href="https://www.simonashop.com.ar" target="_blank" rel="noopener noreferrer" className="flex flex-col leading-none">
          <span className="font-bold text-white text-[11px] tracking-[3px]">SI</span>
          <span className="font-bold text-white text-[11px] tracking-[3px]">MO</span>
          <span className="font-bold text-white text-[11px] tracking-[3px]">NA</span>
        </a>

        {step > 0 && step < 4 && (
          <div className="flex items-center gap-1.5">
            {["Ocasión", "Estilo", "Talle"].map((label, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i < step - 1 ? "bg-[#8B6347]" : i === step - 1 ? "bg-[#C4A882] scale-125" : "bg-white/20"}`} />
                <span className={`text-[9px] font-['Inter',sans-serif] font-medium tracking-widest uppercase transition-colors ${i === step - 1 ? "text-[#C4A882]" : "text-white/25"}`}>{label}</span>
                {i < 2 && <div className="w-4 h-px bg-white/10" />}
              </div>
            ))}
          </div>
        )}

        <a
          href="https://www.simonashop.com.ar/otono-invierno/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-['Inter',sans-serif] font-medium tracking-[2px] uppercase text-white/40 hover:text-[#C4A882] transition-colors"
        >
          Colección
        </a>
      </header>

      {/* PROGRESS */}
      {step > 0 && step < 4 && (
        <div className="relative z-10 px-6 mt-4">
          <ProgressBar step={step} />
        </div>
      )}

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8 min-h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">

          {/* INTRO */}
          {step === 0 && (
            <motion.div key="intro" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="text-center max-w-sm mx-auto w-full">
              <p className="text-[10px] font-['Inter',sans-serif] font-semibold tracking-[5px] uppercase text-[#8B6347] mb-5">Otoño · Invierno 2026</p>
              <h1 className="text-5xl font-bold text-white leading-[1.1] mb-4">
                Encontrá tu<br />
                <em className="italic text-[#C4A882]">look perfecto</em>
              </h1>
              <p className="text-sm font-['Inter',sans-serif] font-light text-white/45 mb-10 leading-relaxed">
                3 preguntas. Un outfit completo.<br />Productos reales de la colección.
              </p>
              <button
                onClick={() => setStep(1)}
                className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-[#8B6347] hover:bg-[#7a5540] active:scale-[0.97] text-white font-['Inter',sans-serif] font-semibold text-sm tracking-[3px] uppercase py-4 transition-all duration-200"
              >
                Empezar →
              </button>
            </motion.div>
          )}

          {/* OCASIÓN */}
          {step === 1 && (
            <motion.div key="ocasion" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-sm mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white">¿Para qué ocasión?</h2>
                <p className="text-xs font-['Inter',sans-serif] font-light text-white/35 mt-1.5">Deslizá o tocá para elegir</p>
              </div>
              <SwipeCards items={OCCASIONS} onSelect={handleOccasion} type="image" />
            </motion.div>
          )}

          {/* ESTILO */}
          {step === 2 && (
            <motion.div key="estilo" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-sm mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white">¿Cuál es tu estilo?</h2>
                <p className="text-xs font-['Inter',sans-serif] font-light text-white/35 mt-1.5">Elegí la estética que mejor te representa</p>
              </div>
              <SwipeCards items={STYLES} onSelect={handleStyle} type="text" />
              <button onClick={() => setStep(1)} className="mt-6 mx-auto block text-[10px] font-['Inter',sans-serif] font-medium tracking-[2px] uppercase text-white/25 hover:text-white/50 transition-colors">
                ← Volver
              </button>
            </motion.div>
          )}

          {/* TALLE */}
          {step === 3 && (
            <motion.div key="talle" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-sm mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-white">¿Cuál es tu talle?</h2>
                <p className="text-xs font-['Inter',sans-serif] font-light text-white/35 mt-1.5">Para mostrarte las prendas disponibles</p>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                {TALLES.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTalle(t)}
                    className={`w-16 h-16 text-lg font-bold border transition-all duration-200 active:scale-[0.93] ${
                      talle === t ? "border-[#C4A882] bg-[#8B6347] text-white" : "border-white/20 text-white/55 hover:border-white/50 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="mt-8 mx-auto block text-[10px] font-['Inter',sans-serif] font-medium tracking-[2px] uppercase text-white/25 hover:text-white/50 transition-colors">
                ← Volver
              </button>
            </motion.div>
          )}

          {/* RESULTADO */}
          {step === 4 && (
            <motion.div key="result" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-sm mx-auto">

              {/* Error de catálogo */}
              {!look && catalogError ? (
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <p className="text-white/50 font-['Inter',sans-serif] text-sm">No pudimos cargar el catálogo.</p>
                  <button
                    onClick={reset}
                    className="text-[10px] font-['Inter',sans-serif] tracking-[2px] uppercase text-[#C4A882] hover:text-white transition-colors"
                  >
                    ← Intentar de nuevo
                  </button>
                </div>

              ) : !look ? (
                <div className="flex flex-col items-center gap-4 py-12">
                  <div className="w-8 h-8 border-2 border-[#C4A882] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-['Inter',sans-serif] text-white/30 tracking-widest uppercase">Armando tu look…</p>
                </div>

              ) : (
                <>
                  {/* Look hero */}
                  <div className="relative w-full overflow-hidden mb-4" style={{ height: "280px" }}>
                    <img src={look.heroImg} alt={look.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="text-[9px] font-['Inter',sans-serif] font-semibold tracking-[3px] uppercase text-[#C4A882] bg-black/40 px-2 py-1">
                        {OCCASIONS.find(o => o.id === resolvedOccasion)?.label} · Talle {talle}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="text-[9px] font-['Inter',sans-serif] font-bold tracking-[2px] uppercase text-white bg-[#8B6347] px-2 py-1">
                        Look completo 15% off
                      </span>
                    </div>
                    <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-['Inter',sans-serif] font-semibold tracking-[3px] uppercase text-[#C4A882] mb-1">Tu look</p>
                        <p className="text-2xl font-bold text-white">{look.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-['Inter',sans-serif] text-white/50 mb-0.5">Total</p>
                        <p className="text-xs font-['Inter',sans-serif] text-white/40 line-through">{calcTotal(look.products)}</p>
                        <p className="text-xl font-bold text-[#C4A882]">{calcDiscountedTotal(look.products)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Products list */}
                  <div className="flex flex-col gap-2 mb-4">
                    {look.products.map((p, i) => (
                      <motion.a
                        key={i}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08 + 0.15, duration: 0.3 } }}
                        className="group flex items-center gap-3 bg-white/5 hover:bg-white/8 border border-white/8 hover:border-[#C4A882]/30 p-3 transition-all duration-200 active:scale-[0.98]"
                      >
                        <div className="w-14 h-14 overflow-hidden flex-shrink-0 bg-white/5">
                          <img
                            src={p.img}
                            alt={p.name}
                            loading="eager"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = look.heroImg; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                          <p className="text-xs font-['Inter',sans-serif] font-light text-[#C4A882]">{p.price}</p>
                        </div>
                        <span className="text-white/25 group-hover:text-[#C4A882] transition-colors text-sm flex-shrink-0">→</span>
                      </motion.a>
                    ))}
                  </div>

                  {/* CTAs */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.3 } }}
                    className="flex flex-col gap-2"
                  >
                    {/* OOS warning — arriba del botón cuando hay redirect en progreso */}
                    {cartWarning && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2 bg-[#C4A882]/10 border border-[#C4A882]/20 px-3 py-2.5 mb-1"
                      >
                        {cartRedirecting && (
                          <span className="w-3 h-3 mt-0.5 border border-[#C4A882] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        )}
                        <p className="text-[11px] font-['Inter',sans-serif] text-[#C4A882] leading-relaxed">
                          {cartWarning}
                          {cartRedirecting && <span className="text-[#C4A882]/60"> Redirigiendo…</span>}
                        </p>
                      </motion.div>
                    )}

                    {/* Primary: comprar el look completo */}
                    <button
                      onClick={handleBuyLook}
                      disabled={cartLoading || cartRedirecting}
                      className="w-full bg-[#8B6347] hover:bg-[#7a5540] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] text-white font-['Inter',sans-serif] font-semibold text-sm tracking-[3px] uppercase py-4 text-center transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {cartLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>Armando carrito…</span>
                        </>
                      ) : cartRedirecting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>Redirigiendo…</span>
                        </>
                      ) : (
                        "Comprar el look →"
                      )}
                    </button>

                    {cartError && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[11px] font-['Inter',sans-serif] text-red-400/80 text-center px-2"
                      >
                        {cartError}
                      </motion.p>
                    )}

                    {/* Cupón: se aplica automáticamente al comprar, esto es solo informativo */}
                    <CouponBadge />

                    {/* Secondary: ver colección */}
                    <a
                      href="https://www.simonashop.com.ar/otono-invierno/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full border border-white/12 hover:border-[#C4A882]/30 text-white/40 hover:text-white/70 font-['Inter',sans-serif] font-medium text-xs tracking-[2px] uppercase py-3 text-center transition-all duration-200 active:scale-[0.98]"
                    >
                      Ver colección completa
                    </a>

                    {/* Share look */}
                    {lookKey && talle && <ShareButton lookKey={lookKey} talle={talle} />}

                    <button
                      onClick={reset}
                      className="w-full border border-white/8 hover:border-white/20 text-white/25 hover:text-white/50 font-['Inter',sans-serif] font-medium text-xs tracking-[2px] uppercase py-3 transition-all duration-200 active:scale-[0.98]"
                    >
                      Armar otro look
                    </button>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 text-center pb-5">
        <p className="text-[9px] font-['Inter',sans-serif] font-light tracking-[2px] text-white/15">
          © 2026 Simona · Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
}
