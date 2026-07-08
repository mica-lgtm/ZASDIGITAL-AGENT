import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

// ─── ASSETS ──────────────────────────────────────────────────────────────────

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663489253832/GCNEfmb632ab7e3kLMogtf/simona_hero_bg-gSwKLDuL9uBpMGpRgbPyqf.webp";

const COUPON_CODE = "LOOKCOMPLETO";
const DISCOUNT_PERCENT = 15;

const BORDO = "#7A1B34";
const BORDO_LIGHT = "#C24C6B";

// Simulated social proof — determinístico por look, plausible para OI 2026
const LOOK_SOCIAL_COUNTS: Record<string, number> = {
  "casual-clasico": 63,
  "casual-trendy": 47,
  "casual-relaxed": 38,
  "oficina-clasico": 51,
  "oficina-trendy": 44,
  "oficina-relaxed": 29,
  "noche-clasico": 31,
  "noche-trendy": 52,
  "noche-relaxed": 27,
};

// Mapeo handle → categoría (espejo del backend — para filtrar prendas en los pasos de talle)
const PRODUCT_CATEGORIES: Record<string, "arriba" | "abajo"> = {
  "jean-imola": "abajo",
  "camisa-brisa-bsasy": "arriba",
  "remera-teddy-beige-1kg9x": "arriba",
  "campera-anada-chocolate-2gonp": "arriba",
  "mocasines-alba-chocolate-uibiv": "abajo",
  "jean-cordillera-1pnxy": "abajo",
  "camisa-carolina": "arriba",
  "trench-barro-verde-jznwa": "arriba",
  "texana-saison-t6iwy": "abajo",
  "remera-basica-blanco": "arriba",
  "blazer-mendoza-negro-bolan": "arriba",
  "zapatilla-adele-tiza": "abajo",
  "sweater-acacia-negro-1h39g": "arriba",
  "saco-angelica-gris-17v2j": "arriba",
  "pantalon-terra-blanco-1ekgn": "abajo",
  "camisa-cultura-celeste-n5r3f": "arriba",
  "campera-nero-camel-1ssjz": "arriba",
  "sweater-lotea-gris-1fusl": "arriba",
  "texana-saison-chocolate-7z1z5": "abajo",
  "pantalon-algarrobo-n0g4u": "abajo",
  "camisa-clasica-blanco": "arriba",
  "campera-nero-bordo-1ils5": "arriba",
  "falda-lias-chocolate-1vv8n": "abajo",
  "musculosa-origen-negro-14bvm": "arriba",
  "blazer-print-1y7oj": "arriba",
  "texana-bianca-chocolate": "abajo",
  "sweater-cava-crudo-nx9sp": "arriba",
  "saco-altura-beige-vt0ev": "arriba",
};

// Talles Simona → talle numérico AR
const TALLE_GUIDE = [
  { talle: "XS", ar: "36" },
  { talle: "S", ar: "38" },
  { talle: "M", ar: "40" },
  { talle: "L", ar: "42" },
  { talle: "XL", ar: "44" },
];

// ─── STATIC UI DATA ──────────────────────────────────────────────────────────

const OCCASIONS = [
  {
    id: "casual",
    label: "Día casual",
    sub: "Salidas y actividades cotidianas",
    img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc03706-3190420bf6de92665f17794621717209-1024-1024.jpg",
  },
  {
    id: "oficina",
    label: "Trabajo / Oficina",
    sub: "Looks profesionales y prolijos",
    img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc03324-42c8c7646d6bf1e79317792794021234-1024-1024.jpg",
  },
  {
    id: "noche",
    label: "Salida de noche",
    sub: "Eventos, cenas y ocasiones especiales",
    img: "https://acdn-us.mitiendanube.com/stores/601/496/products/img_3360-f9eacf7c3ebede179617703845884191-1024-1024.jpg",
  },
];

const STYLES = [
  { id: "clasico", label: "Clásico", sub: "Atemporal y sofisticado" },
  { id: "trendy", label: "Trendy", sub: "Moderno y con actitud" },
  { id: "relaxed", label: "Relaxed", sub: "Cómodo y descontracturado" },
];

const TALLES = ["XS", "S", "M", "L", "XL"];

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Product = { handle: string; name: string; price: string; img: string; url: string };
type Look = { name: string; heroImg: string; products: Product[] };
type Catalog = Record<string, Look>;
type CouponInfo = { token: string; issuedAt: number; windowMs: number };

// ─── COUPON PERSISTENCE ──────────────────────────────────────────────────────

const COUPON_STORAGE_KEY = "simona_lookfinder_coupon";

function loadStoredCoupon(): CouponInfo | null {
  try {
    const raw = localStorage.getItem(COUPON_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.issuedAt || !parsed?.windowMs) return null;
    return parsed;
  } catch {
    return null;
  }
}

function storeCoupon(info: CouponInfo) {
  try {
    localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(info));
  } catch {
    // localStorage no disponible — no es crítico
  }
}

// ─── URL PARAMS ──────────────────────────────────────────────────────────────

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const look = params.get("look") || "";
  const talleA = params.get("talleA") || params.get("talle") || "";
  const talleB = params.get("talleB") || params.get("talle") || "";
  if (look && talleA && talleB) {
    const parts = look.split("-");
    const occasion = parts[0] || "";
    const style = parts.slice(1).join("-");
    return { occasion, style, talleArriba: talleA, talleAbajo: talleB, lookKey: look, fromUrl: true };
  }
  return { occasion: "", style: "", talleArriba: "", talleAbajo: "", lookKey: "", fromUrl: false };
}

// ─── CATALOG HOOK ────────────────────────────────────────────────────────────

function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState(false);
  const [coupon, setCoupon] = useState<CouponInfo | null>(null);

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => {
        if (!r.ok) throw new Error("catalog error");
        return r.json();
      })
      .then((d) => {
        setCatalog(d.looks);
        if (d.coupon) {
          const stored = loadStoredCoupon();
          const storedStillValid = !!stored && Date.now() - stored.issuedAt <= stored.windowMs;
          if (storedStillValid && stored) {
            setCoupon(stored);
          } else {
            const fresh: CouponInfo = { token: d.coupon.token, issuedAt: d.coupon.issuedAt, windowMs: d.coupon.windowMs };
            storeCoupon(fresh);
            setCoupon(fresh);
          }
        }
      })
      .catch(() => setError(true));
  }, []);

  return { catalog, error, coupon };
}

// ─── COUNTDOWN ───────────────────────────────────────────────────────────────

function useCountdown(deadlineMs: number | null): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (deadlineMs == null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadlineMs]);

  if (deadlineMs == null) return null;
  return Math.max(0, deadlineMs - now);
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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

// ─── TRUST BAR ───────────────────────────────────────────────────────────────

function TrustBar() {
  return (
    <div className="w-full flex items-center justify-center gap-0 py-3 border-y border-white/8">
      {["Envío a todo el país", "Cambios 30 días", "Pago seguro"].map((text, i) => (
        <span key={i} className="flex items-center gap-0">
          {i > 0 && (
            <span className="mx-3 text-[#8B6347]/50 text-[8px] leading-none">✦</span>
          )}
          <span className="text-[9px] font-['Inter',sans-serif] tracking-[1.5px] uppercase text-white/28">
            {text}
          </span>
        </span>
      ))}
    </div>
  );
}

// ─── SIZE GUIDE ──────────────────────────────────────────────────────────────

function SizeGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="text-center mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-[10px] font-['Inter',sans-serif] font-medium tracking-[2px] uppercase text-white/25 hover:text-[#C4A882] transition-colors"
      >
        {open ? "Cerrar guía ↑" : "Guía de talles ↓"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="size-guide-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 border border-white/10 px-4 py-3 max-w-xs mx-auto">
              <div className="grid grid-cols-5 gap-1 text-center">
                {TALLE_GUIDE.map(({ talle, ar }) => (
                  <div key={talle} className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-white">{talle}</span>
                    <span className="text-[10px] font-['Inter',sans-serif] text-white/35">T.{ar}</span>
                  </div>
                ))}
              </div>
              <div className="w-full h-px bg-white/8 my-2" />
              <p className="text-[9px] font-['Inter',sans-serif] text-white/20 text-center tracking-[1px] uppercase">
                Talle numérico argentino
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
  const pct = Math.min(((step - 1) / 4) * 100, 100);
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

function CouponBadge({ remainingMs }: { remainingMs: number | null }) {
  if (remainingMs == null) return null;
  const expired = remainingMs <= 0;

  if (expired) {
    return (
      <div className="w-full border border-dashed border-white/15 bg-white/5 text-white/40 font-['Inter',sans-serif] text-xs py-3 text-center flex items-center justify-center gap-2">
        <span className="tracking-[2px] uppercase font-semibold">Cupón {COUPON_CODE} vencido</span>
      </div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: [0.85, 1, 0.85] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      style={{ backgroundColor: BORDO }}
      className="w-full pl-3 pr-3 py-2 flex items-center justify-between gap-2"
    >
      <span className="text-[10px] font-['Inter',sans-serif] text-white tracking-[0.5px]">
        <span>✦</span> Tu cupón vence en
      </span>
      <span className="text-xs font-bold tabular-nums text-white flex-shrink-0">{formatCountdown(remainingMs)}</span>
    </motion.div>
  );
}

// ─── SHARE BUTTON ────────────────────────────────────────────────────────────

function ShareButton({ lookKey, talleArriba, talleAbajo }: { lookKey: string; talleArriba: string; talleAbajo: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.search = `?look=${lookKey}&talleA=${talleArriba}&talleB=${talleAbajo}`;
    url.hash = "";
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
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

  const [step, setStep] = useState(urlParams.fromUrl ? 5 : 0);
  const [occasion, setOccasion] = useState(urlParams.occasion);
  const [style, setStyle] = useState(urlParams.style);
  const [talleArriba, setTalleArriba] = useState(urlParams.talleArriba);
  const [talleAbajo, setTalleAbajo] = useState(urlParams.talleAbajo);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartRedirecting, setCartRedirecting] = useState(false);
  const [cartError, setCartError] = useState("");
  const [cartWarning, setCartWarning] = useState("");

  const { catalog, error: catalogError, coupon } = useCatalog();

  const lookKey = catalog ? pickAvailableLookKey(catalog, occasion, style) : "";
  const look = catalog && lookKey ? (catalog[lookKey] ?? null) : null;
  const resolvedOccasion = lookKey ? lookKey.split("-")[0] : occasion;

  const couponDeadline = coupon ? coupon.issuedAt + coupon.windowMs : null;
  const couponRemainingMs = useCountdown(couponDeadline);
  const couponActive = couponRemainingMs != null && couponRemainingMs > 0;

  const socialCount = LOOK_SOCIAL_COUNTS[lookKey] ?? 34;

  useEffect(() => {
    if (step === 5 && lookKey && talleArriba && talleAbajo) {
      const url = new URL(window.location.href);
      url.search = `?look=${lookKey}&talleA=${talleArriba}&talleB=${talleAbajo}`;
      window.history.replaceState({}, "", url.toString());
    }
  }, [step, lookKey, talleArriba, talleAbajo]);

  const handleOccasion = (id: string) => { setOccasion(id); setTimeout(() => setStep(2), 250); };
  const handleStyle = (id: string) => { setStyle(id); setTimeout(() => setStep(3), 250); };
  const handleTalleArriba = (t: string) => { setTalleArriba(t); setTimeout(() => setStep(4), 250); };
  const handleTalleAbajo = (t: string) => { setTalleAbajo(t); setTimeout(() => setStep(5), 250); };

  const reset = () => {
    setStep(0);
    setOccasion("");
    setStyle("");
    setTalleArriba("");
    setTalleAbajo("");
    setCartError("");
    setCartWarning("");
    setCartLoading(false);
    setCartRedirecting(false);
    window.history.replaceState({}, "", window.location.pathname);
  };

  const handleBuyLook = async () => {
    if (!lookKey || !talleArriba || !talleAbajo || cartLoading || cartRedirecting) return;
    setCartLoading(true);
    setCartError("");
    setCartWarning("");

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookKey, talleArriba, talleAbajo, couponToken: coupon?.token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCartError(data.error || "No se pudo crear el carrito");
        setCartLoading(false);
        return;
      }

      if (data.warning) {
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

        {step > 0 && step < 5 && (
          <div className="flex items-center gap-1">
            {["Ocasión", "Estilo", "Arriba", "Abajo"].map((label, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i < step - 1 ? "bg-[#8B6347]" : i === step - 1 ? "bg-[#C4A882] scale-125" : "bg-white/20"}`} />
                <span className={`text-[8px] font-['Inter',sans-serif] font-medium tracking-wider uppercase transition-colors ${i === step - 1 ? "text-[#C4A882]" : "text-white/25"}`}>{label}</span>
                {i < 3 && <div className="w-3 h-px bg-white/10" />}
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
      {step > 0 && step < 5 && (
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
              <p className="text-sm font-['Inter',sans-serif] font-light text-white/45 mb-4 leading-relaxed">
                4 preguntas. Un outfit completo.<br />Productos reales de la colección.
              </p>

              {/* Social proof */}
              <p className="text-[10px] font-['Inter',sans-serif] tracking-[2px] uppercase text-white/30 mb-8">
                <span className="text-[#8B6347]">✦</span> +200 looks armados esta temporada
              </p>

              <button
                onClick={() => setStep(1)}
                className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-[#8B6347] hover:bg-[#7a5540] active:scale-[0.97] text-white font-['Inter',sans-serif] font-semibold text-sm tracking-[3px] uppercase py-4 transition-all duration-200"
              >
                Empezar →
              </button>

              {/* Coupon teaser */}
              <p className="text-[10px] font-['Inter',sans-serif] tracking-[1.5px] uppercase mt-4" style={{ color: BORDO_LIGHT }}>
                ✦ {DISCOUNT_PERCENT}% off al comprar el look completo
              </p>
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

          {/* TALLE ARRIBA */}
          {step === 3 && (
            <motion.div key="talle-arriba" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-sm mx-auto">
              <div className="text-center mb-6">
                <p className="text-[10px] font-['Inter',sans-serif] font-semibold tracking-[3px] uppercase text-[#8B6347] mb-2">Parte de arriba</p>
                <h2 className="text-2xl font-bold text-white">¿Cuál es tu talle de arriba?</h2>
                <SizeGuide />
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                {TALLES.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTalleArriba(t)}
                    className={`w-16 h-16 text-lg font-bold border transition-all duration-200 active:scale-[0.93] ${
                      talleArriba === t ? "border-[#C4A882] bg-[#8B6347] text-white" : "border-white/20 text-white/55 hover:border-white/50 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {/* Prendas de arriba del look — contexto para la clienta */}
              {look && (() => {
                const arribaProds = look.products.filter(p => (PRODUCT_CATEGORIES[p.handle] ?? "arriba") === "arriba");
                if (!arribaProds.length) return null;
                return (
                  <div className="mt-6">
                    <p className="text-[9px] font-['Inter',sans-serif] tracking-[2px] uppercase text-white/25 text-center mb-3">Para estas prendas</p>
                    <div className="flex flex-col gap-1.5">
                      {arribaProds.map((p, i) => (
                        <div key={i} className="flex items-center gap-2.5 bg-white/4 border border-white/8 px-3 py-2">
                          <img src={p.img} alt={p.name} className="w-9 h-9 object-cover flex-shrink-0" />
                          <span className="text-xs font-['Inter',sans-serif] text-white/55 truncate">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <button onClick={() => setStep(2)} className="mt-6 mx-auto block text-[10px] font-['Inter',sans-serif] font-medium tracking-[2px] uppercase text-white/25 hover:text-white/50 transition-colors">
                ← Volver
              </button>
            </motion.div>
          )}

          {/* TALLE ABAJO */}
          {step === 4 && (
            <motion.div key="talle-abajo" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-sm mx-auto">
              <div className="text-center mb-6">
                <p className="text-[10px] font-['Inter',sans-serif] font-semibold tracking-[3px] uppercase text-[#8B6347] mb-2">Parte de abajo</p>
                <h2 className="text-2xl font-bold text-white">¿Cuál es tu talle de abajo?</h2>
                <SizeGuide />
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                {TALLES.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTalleAbajo(t)}
                    className={`w-16 h-16 text-lg font-bold border transition-all duration-200 active:scale-[0.93] ${
                      talleAbajo === t ? "border-[#C4A882] bg-[#8B6347] text-white" : "border-white/20 text-white/55 hover:border-white/50 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {/* Prendas de abajo del look — contexto para la clienta */}
              {look && (() => {
                const abajoProds = look.products.filter(p => PRODUCT_CATEGORIES[p.handle] === "abajo");
                if (!abajoProds.length) return null;
                return (
                  <div className="mt-6">
                    <p className="text-[9px] font-['Inter',sans-serif] tracking-[2px] uppercase text-white/25 text-center mb-3">Para estas prendas</p>
                    <div className="flex flex-col gap-1.5">
                      {abajoProds.map((p, i) => (
                        <div key={i} className="flex items-center gap-2.5 bg-white/4 border border-white/8 px-3 py-2">
                          <img src={p.img} alt={p.name} className="w-9 h-9 object-cover flex-shrink-0" />
                          <span className="text-xs font-['Inter',sans-serif] text-white/55 truncate">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <button onClick={() => setStep(3)} className="mt-6 mx-auto block text-[10px] font-['Inter',sans-serif] font-medium tracking-[2px] uppercase text-white/25 hover:text-white/50 transition-colors">
                ← Volver
              </button>
            </motion.div>
          )}

          {/* RESULTADO */}
          {step === 5 && (
            <motion.div key="result" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-sm mx-auto">

              {!look && catalogError ? (
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <p className="text-white/50 font-['Inter',sans-serif] text-sm">No pudimos cargar el catálogo.</p>
                  <button onClick={reset} className="text-[10px] font-['Inter',sans-serif] tracking-[2px] uppercase text-[#C4A882] hover:text-white transition-colors">
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
                  <div className="relative w-full overflow-hidden mb-3" style={{ height: "280px" }}>
                    <img src={look.heroImg} alt={look.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="text-[9px] font-['Inter',sans-serif] font-semibold tracking-[3px] uppercase text-[#C4A882] bg-black/40 px-2 py-1">
                        {OCCASIONS.find(o => o.id === resolvedOccasion)?.label} · {talleArriba}/{talleAbajo}
                      </span>
                    </div>
                    {couponActive && (
                      <div className="absolute top-4 right-4">
                        <motion.span
                          animate={{ scale: [1, 1.06, 1] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                          style={{ backgroundColor: BORDO, boxShadow: `0 0 14px ${BORDO}90` }}
                          className="inline-block text-[9px] font-['Inter',sans-serif] font-bold tracking-[2px] uppercase text-white px-2 py-1"
                        >
                          Look completo {DISCOUNT_PERCENT}% off
                        </motion.span>
                      </div>
                    )}
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="flex items-end justify-between mb-1">
                        <div>
                          <p className="text-[10px] font-['Inter',sans-serif] font-semibold tracking-[3px] uppercase text-[#C4A882] mb-1">Tu look</p>
                          <p className="text-2xl font-bold text-white">{look.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-['Inter',sans-serif] text-white/50 mb-0.5">{look.products.length} prendas</p>
                          {couponActive ? (
                            <>
                              <p className="text-xs font-['Inter',sans-serif] text-white/40 line-through">{calcTotal(look.products)}</p>
                              <p className="text-xl font-bold" style={{ color: BORDO_LIGHT }}>{calcDiscountedTotal(look.products)}</p>
                            </>
                          ) : (
                            <p className="text-xl font-bold text-white">{calcTotal(look.products)}</p>
                          )}
                        </div>
                      </div>
                      {/* Social proof in hero */}
                      <p className="text-[9px] font-['Inter',sans-serif] text-white/30 tracking-[1px]">
                        <span className="text-[#8B6347]">✦</span> {socialCount} clientas eligieron este look
                      </p>
                    </div>
                  </div>

                  {/* Products list */}
                  <div className="flex flex-col gap-2 mb-3">
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
                        <span className="flex-shrink-0 whitespace-nowrap text-[9px] font-['Inter',sans-serif] font-semibold tracking-[1.5px] uppercase text-white/50 group-hover:text-[#C4A882] border border-white/15 group-hover:border-[#C4A882]/40 px-2.5 py-1.5 transition-colors">
                          Ver producto
                        </span>
                      </motion.a>
                    ))}
                  </div>

                  {/* CTAs */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.3 } }}
                    className="flex flex-col gap-2"
                  >
                    {/* OOS warning */}
                    {cartWarning && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2 bg-[#C4A882]/10 border border-[#C4A882]/20 px-3 py-2.5"
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

                    {/* Coupon badge ARRIBA del CTA — la urgencia empuja al botón */}
                    <CouponBadge remainingMs={couponRemainingMs} />

                    {/* Primary CTA */}
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
                      ) : couponActive ? (
                        `Quiero el look con ${DISCOUNT_PERCENT}% off →`
                      ) : (
                        "Quiero este look →"
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

                    {/* Trust bar — reduce anxiety inmediatamente después del CTA */}
                    <TrustBar />

                    {/* Secondary CTAs */}
                    <a
                      href="https://www.simonashop.com.ar/otono-invierno/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full border border-white/12 hover:border-[#C4A882]/30 text-white/40 hover:text-white/70 font-['Inter',sans-serif] font-medium text-xs tracking-[2px] uppercase py-3 text-center transition-all duration-200 active:scale-[0.98]"
                    >
                      Ver colección completa
                    </a>

                    {lookKey && talleArriba && talleAbajo && <ShareButton lookKey={lookKey} talleArriba={talleArriba} talleAbajo={talleAbajo} />}

                    <button
                      onClick={reset}
                      className="w-full text-white/18 hover:text-white/35 font-['Inter',sans-serif] font-medium text-xs tracking-[2px] uppercase py-2 transition-all duration-200 active:scale-[0.98]"
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
