import {
  SIZE_GUIDES,
  FALLBACK_IMAGES,
  FEATURED_IMAGE_OVERRIDES,
  SUBTYPE_FEATURED_RECOMMENDATIONS,
  CATEGORY_URLS,
  SUBTYPE_URLS,
  type FamilyId,
  type Product,
} from "../data/catalog";

export type Answers = Record<string, string>;
export type QuestionOption = { value: string; main: string; sub?: string };
export type Question = { id: string; title: string; help: string; options: QuestionOption[] };

export type ResultData = {
  display: string;
  note: string;
  tags: string[];
  talle: string | null;
  corpinio: string | null;
  camiseta: string | null;
  subtype: string;
  outOfRange: boolean;
};

type Range = [number, number];
type SizeRow = { talle: string; cintura?: Range; cadera?: Range; busto?: Range; corpinio?: string; pantalon?: string };

function rangeText(r?: Range): string {
  return r ? `${r[0]} a ${r[1]} cm` : "";
}

function makeOptionsFromGuide(guide: SizeRow[], key: "cintura" | "cadera" | "busto"): QuestionOption[] {
  return guide.filter((row) => row[key]).map((row, idx) => ({ value: String(idx), main: rangeText(row[key]), sub: "" }));
}

export function buildQuestions(family: FamilyId, answers: Answers): Question[] {
  const qs: Question[] = [];
  if (family === "Bombachas") {
    qs.push({
      id: "bombachaTipo",
      title: "¿Qué tipo de bombacha querés calcular?",
      help: "Elegí el modelo que estás mirando.",
      options: [
        { value: "numerico", main: "Bombachas con talle 1 al 8", sub: "Colaless, vedetinas, culottes y similares" },
        { value: "unicoGeneral", main: "Universal / Especial", sub: "Modelos de talle único" },
        { value: "tirita", main: "Less tirita regulable", sub: "Modelo regulable de talle único" },
      ],
    });
    if (!answers.bombachaTipo) return qs;
    if (answers.bombachaTipo === "numerico") {
      qs.push({
        id: "cadera",
        title: "¿Cuánto mide tu cadera?",
        help: "Medí la parte más ancha. En bombachas tomamos esta medida como referencia principal.",
        options: makeOptionsFromGuide(SIZE_GUIDES.Bombachas, "cadera"),
      });
      qs.push({
        id: "cintura",
        title: "¿Cuánto mide tu cintura?",
        help: "Elegí el rango que más se acerque a tu medida.",
        options: makeOptionsFromGuide(SIZE_GUIDES.Bombachas, "cintura"),
      });
    } else {
      const guide = answers.bombachaTipo === "tirita" ? SIZE_GUIDES.BombachaTiritaRegulable[0] : SIZE_GUIDES.BombachaUnicoGeneral[0];
      qs.push({
        id: "unicoFit",
        title: "¿Tus medidas entran en este rango?",
        help: `Cintura ${rangeText(guide.cintura)} · Cadera ${rangeText(guide.cadera)}`,
        options: [
          { value: "si", main: "Sí, entro en ese rango", sub: "Calcular talle único" },
          { value: "no", main: "No / no estoy segura", sub: "Prefiero ver otros modelos con más talles" },
        ],
      });
    }
  } else if (family === "Camisetas") {
    qs.push({ id: "busto", title: "¿Cuánto mide tu busto?", help: "Elegí el rango que más se acerque.", options: makeOptionsFromGuide(SIZE_GUIDES.Camiseta, "busto") });
    qs.push({ id: "cadera", title: "¿Cuánto mide tu cadera?", help: "Sirve para que la camiseta quede cómoda abajo.", options: makeOptionsFromGuide(SIZE_GUIDES.Camiseta, "cadera") });
  } else if (family === "Corpiños") {
    qs.push({
      id: "topTipo",
      title: "¿Qué tipo de corpiño querés calcular?",
      help: "Así usamos la tabla correcta.",
      options: [
        { value: "tazaSoft", main: "Corpiño taza soft", sub: "Tabla 85 a 105" },
        { value: "deportivo", main: "Corpiño deportivo", sub: "Tabla 85 a 110" },
      ],
    });
    if (!answers.topTipo) return qs;
    if (answers.topTipo === "tazaSoft") qs.push({ id: "busto", title: "¿Cuánto mide tu busto?", help: "Medí alrededor de la parte más sobresaliente.", options: makeOptionsFromGuide(SIZE_GUIDES.CorpinioTazaSoft, "busto") });
    if (answers.topTipo === "deportivo") qs.push({ id: "busto", title: "¿Cuánto mide tu busto?", help: "Medí alrededor de la parte más sobresaliente.", options: makeOptionsFromGuide(SIZE_GUIDES.CorpinioDeportivo, "busto") });
  } else if (family === "Trajes de baño") {
    qs.push({
      id: "trajeTipo",
      title: "¿Qué tipo de traje de baño querés calcular?",
      help: "No es un producto específico: es la tabla de calce correcta.",
      options: [
        { value: "lupita", main: "Bikini Lupita", sub: "Corpiño Lupita + bombacha" },
        { value: "zoeTaniaAitana", main: "Zoe / Tania / Aitana", sub: "Tops y bikinis de esa línea" },
        { value: "enteriza", main: "Enteriza", sub: "Malla entera" },
      ],
    });
    if (!answers.trajeTipo) return qs;
    const guide = answers.trajeTipo === "lupita" ? SIZE_GUIDES.TrajeLupita : answers.trajeTipo === "zoeTaniaAitana" ? SIZE_GUIDES.TrajeZoeTaniaAitana : SIZE_GUIDES.TrajeEnteriza;
    qs.push({ id: "busto", title: "¿Cuánto mide tu busto?", help: "Medí alrededor de la parte más sobresaliente.", options: makeOptionsFromGuide(guide, "busto") });
    qs.push({ id: "cintura", title: "¿Cuánto mide tu cintura?", help: "Medí la parte más angosta.", options: makeOptionsFromGuide(guide, "cintura") });
    qs.push({ id: "cadera", title: "¿Cuánto mide tu cadera?", help: "Medí la parte más ancha.", options: makeOptionsFromGuide(guide, "cadera") });
  }
  return qs;
}

function idxOf(answers: Answers, id: string): number {
  const v = Number(answers[id]);
  return Number.isFinite(v) ? v : 0;
}
function rowAt(guide: SizeRow[], answers: Answers, id: string): SizeRow {
  const i = idxOf(answers, id);
  return guide[Math.max(0, Math.min(i, guide.length - 1))] || guide[0];
}
function maxRow(guide: SizeRow[], answers: Answers, ids: string[]): SizeRow {
  const i = Math.max(...ids.map((id) => idxOf(answers, id)));
  return guide[Math.max(0, Math.min(i, guide.length - 1))] || guide[0];
}

export function calcResult(family: FamilyId, answers: Answers): ResultData {
  const result: ResultData = { display: "", note: "", tags: [], talle: null, corpinio: null, camiseta: null, subtype: "", outOfRange: false };

  if (family === "Bombachas") {
    result.subtype = answers.bombachaTipo || "numerico";
    if (result.subtype === "numerico") {
      const r = rowAt(SIZE_GUIDES.Bombachas, answers, "cadera");
      const c = rowAt(SIZE_GUIDES.Bombachas, answers, "cintura");
      const talleCadera = Number(r.talle);
      const talleCintura = Number(c.talle);
      const diff = Math.abs(talleCadera - talleCintura);
      let finalTalle: number;
      // Regla de reconciliación cintura/cadera (guia_talles_juanitas.md):
      // si difieren 0-2 talles, la cadera manda; si difieren 3 o más, se
      // promedia (redondeando hacia arriba) para no forzar un calce incómodo.
      if (diff >= 3) {
        finalTalle = Math.min(8, Math.max(1, Math.ceil((talleCadera + talleCintura) / 2)));
        result.note = "Tu cintura y tu cadera corresponden a talles bastante distintos, así que no nos guiamos solo por la cadera: te recomendamos un talle intermedio para un calce más equilibrado.";
      } else {
        finalTalle = talleCadera;
        result.note = "Para bombachas, tomamos la cadera como referencia principal, tal como indica la tabla de talles.";
      }
      result.talle = String(finalTalle);
      result.display = "Talle " + finalTalle;
      result.tags = [`Cadera ${rangeText(r.cadera)}`, `Cintura ${rangeText(c.cintura)}`];
    } else {
      const g = result.subtype === "tirita" ? SIZE_GUIDES.BombachaTiritaRegulable[0] : SIZE_GUIDES.BombachaUnicoGeneral[0];
      result.talle = "UNICO";
      result.display = "Talle único";
      result.outOfRange = answers.unicoFit === "no";
      result.note = result.outOfRange
        ? "Tus medidas no entran con seguridad en el rango de talle único de este modelo. Te conviene mirar modelos con talle 1 al 8."
        : "Tus medidas entran en el rango de talle único de este modelo.";
      result.tags = [`Cintura ${rangeText(g.cintura)}`, `Cadera ${rangeText(g.cadera)}`, `Pantalón ${g.pantalon}`];
    }
  } else if (family === "Camisetas") {
    result.subtype = "camiseta";
    const r = maxRow(SIZE_GUIDES.Camiseta, answers, ["busto", "cadera"]);
    result.talle = r.talle;
    result.camiseta = r.talle;
    result.display = "Camiseta talle " + r.talle;
    result.note = "Resultado calculado con la tabla oficial de camisetas.";
    result.tags = [`Busto ${rangeText(r.busto)}`, `Cadera ${rangeText(r.cadera)}`];
  } else if (family === "Corpiños") {
    result.subtype = answers.topTipo || "tazaSoft";
    if (result.subtype === "tazaSoft") {
      const r = rowAt(SIZE_GUIDES.CorpinioTazaSoft, answers, "busto");
      result.corpinio = r.talle;
      result.display = "Corpiño " + r.talle;
      result.note = "Resultado calculado con la tabla oficial de corpiño taza soft.";
      result.tags = [`Busto ${rangeText(r.busto)}`];
    } else if (result.subtype === "deportivo") {
      const r = rowAt(SIZE_GUIDES.CorpinioDeportivo, answers, "busto");
      result.corpinio = r.talle;
      result.display = "Corpiño deportivo " + r.talle;
      result.note = "Resultado calculado con la tabla oficial de corpiño deportivo adulto.";
      result.tags = [`Busto ${rangeText(r.busto)}`];
    }
  } else if (family === "Trajes de baño") {
    result.subtype = answers.trajeTipo || "lupita";
    if (result.subtype === "enteriza") {
      const r = maxRow(SIZE_GUIDES.TrajeEnteriza, answers, ["busto", "cintura", "cadera"]);
      result.talle = r.talle;
      result.display = "Enteriza talle " + r.talle;
      result.note = "Resultado calculado con la tabla oficial de enterizas.";
      result.tags = [`Busto ${rangeText(r.busto)}`, `Cintura ${rangeText(r.cintura)}`, `Cadera ${rangeText(r.cadera)}`];
    } else {
      const guide = result.subtype === "zoeTaniaAitana" ? SIZE_GUIDES.TrajeZoeTaniaAitana : SIZE_GUIDES.TrajeLupita;
      const top = rowAt(guide, answers, "busto");
      const bottom = maxRow(guide, answers, ["cintura", "cadera"]);
      result.corpinio = top.corpinio ?? null;
      result.talle = bottom.talle;
      result.display = `Corpiño ${top.corpinio} · Bombacha talle ${bottom.talle}`;
      result.note = result.subtype === "lupita" ? "Resultado calculado con la tabla oficial de Corpiño Lupita + bombacha." : "Resultado calculado con la tabla oficial de Top Zoe / Tania / Aitana.";
      result.tags = [`Busto ${rangeText(top.busto)}`, `Cintura ${rangeText(bottom.cintura)}`, `Cadera ${rangeText(bottom.cadera)}`];
    }
  }
  return result;
}

function normalize(s: string): string {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
}
function normalizeSize(x: string): string {
  return normalize(x).replace(/^TALLE\s+/, "");
}
function hasSize(list: string[] | undefined, size: string | null): boolean {
  if (!size) return false;
  return (list || []).some((x) => normalizeSize(x) === normalizeSize(size));
}
export function money(v?: string): string {
  if (!v) return "";
  const n = Number(String(v).replace(/,/g, ""));
  if (!isFinite(n) || n <= 0) return "";
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

function productBelongsToCurrentFamily(p: Product, family: FamilyId): boolean {
  if (family === "Camisetas") return p.family === "Corpiños y camisetas" && p.category === "Camiseta";
  if (family === "Corpiños") return p.family === "Corpiños y camisetas" && p.category === "Corpiño";
  return p.family === family;
}

function productMatchesResult(p: Product, family: FamilyId, result: ResultData): boolean {
  if (!productBelongsToCurrentFamily(p, family) || result.outOfRange) return false;
  const h = normalize(p.handle + " " + p.name);
  const isUnico = hasSize(p.talles, "UNICO") || hasSize(p.talles, "ÚNICO");
  if (family === "Bombachas") {
    if (result.subtype === "unicoGeneral") return isUnico && /(UNIVERSAL|ESPECIAL)/.test(h);
    if (result.subtype === "tirita") return isUnico && /(TIRITA|REGULABLE|CORREDERA)/.test(h);
    return hasSize(p.talles, result.talle) && !isUnico;
  }
  if (family === "Camisetas") return hasSize(p.talles, result.talle);
  if (family === "Corpiños") {
    if (result.subtype === "tazaSoft") return /TAZA SOFT/.test(h) && (hasSize(p.corpinioTalles, result.corpinio) || hasSize(p.talles, result.corpinio));
    if (result.subtype === "deportivo") return /DEPORTIVO/.test(h) && (hasSize(p.corpinioTalles, result.corpinio) || hasSize(p.talles, result.corpinio));
    return false;
  }
  if (family === "Trajes de baño") {
    if (result.subtype === "enteriza") return /ENTERA|ENTERIZA/.test(h) && hasSize(p.talles, result.talle);
    if (result.subtype === "lupita") return /LUPITA/.test(h) && (hasSize(p.talles, result.talle) || hasSize(p.corpinioTalles, result.corpinio));
    if (result.subtype === "zoeTaniaAitana") return /(ZOE|TANIA|AITANA)/.test(h) && (hasSize(p.talles, result.talle) || hasSize(p.corpinioTalles, result.corpinio));
    return false;
  }
  return false;
}

function familyProducts(products: Product[], family: FamilyId): Product[] {
  return products.filter((p) => productBelongsToCurrentFamily(p, family));
}

export function imageForFamily(family: FamilyId): string {
  if (family === "Bombachas") return FALLBACK_IMAGES["Bombachas"];
  if (family === "Camisetas") return FALLBACK_IMAGES["Camiseta"];
  if (family === "Corpiños") return FALLBACK_IMAGES["Corpiño"];
  if (family === "Trajes de baño") return FALLBACK_IMAGES["Traje de Baño"];
  return FALLBACK_IMAGES["Bombachas"];
}

export function imageFor(p: Product | null | undefined, family: FamilyId): string {
  if (p && FEATURED_IMAGE_OVERRIDES[p.handle]) return FEATURED_IMAGE_OVERRIDES[p.handle];
  if (p && p.image) return p.image;
  return imageForFamily(family);
}

function featuredFamilyProducts(products: Product[], family: FamilyId, result: ResultData): Product[] {
  const subtypeKey = family + "|" + (result.subtype || "");
  const handles = SUBTYPE_FEATURED_RECOMMENDATIONS[subtypeKey] || [];
  const picked = handles
    .map((handle) => {
      const base = products.find((p) => p.handle === handle);
      if (!base) return null;
      const image = FEATURED_IMAGE_OVERRIDES[handle];
      return image ? { ...base, image } : base;
    })
    .filter((p): p is Product => !!p);
  const exact = picked.filter((p) => productMatchesResult(p, family, result));
  return exact.length ? exact : picked.filter((p) => productBelongsToCurrentFamily(p, family) && !result.outOfRange);
}

function isTiroAltoProduct(p: Product): boolean {
  return /TIRO ALTO/.test(normalize((p.handle || "") + " " + (p.name || "") + " " + (p.sourceCategory || "")));
}
function isPackX3Product(p: Product): boolean {
  return /PACK\s*X?\s*3/.test(normalize((p.handle || "") + " " + (p.name || "")));
}
function isTiroBajoProduct(p: Product): boolean {
  const h = normalize((p.handle || "") + " " + (p.name || "") + " " + (p.sourceCategory || ""));
  return !isTiroAltoProduct(p) && /(COLALESS|VEDETINA|CULOTTELESS|CULOTTE|TIRO BAJO)/.test(h) && !/(UNIVERSAL|ESPECIAL|TIRITA|REGULABLE|CORREDERA|PACK X12|PACK X6)/.test(h);
}
function orderedProductsByHandle(products: Product[], handles: string[]): Product[] {
  return handles.map((h) => products.find((p) => p.handle === h)).filter((p): p is Product => !!p);
}

export function recommendations(products: Product[], family: FamilyId, result: ResultData): Product[] {
  if (result.outOfRange) return [];
  const featured = featuredFamilyProducts(products, family, result);
  const exact = familyProducts(products, family).filter((p) => productMatchesResult(p, family, result));
  let base = featured.length ? featured : exact.length ? exact : familyProducts(products, family);
  const talleNum = Number(normalizeSize(result.talle || ""));
  if (family === "Bombachas" && result.subtype === "numerico" && Number.isFinite(talleNum)) {
    if (talleNum >= 3) {
      const priority = orderedProductsByHandle(products, [
        "colaless-tiro-alto-algodon-pack-x3",
        "colaless-tiro-alto-estampada-pack-x3",
        "colaless-tiro-alto-labradas-pack-x3",
        "colaless-tiro-alto-algodon-con-refuerzo-pack-x3",
        "colaless-tiro-alto-con-refuerzo-estampado-pack-x3",
        "colaless-tiro-alto-labradas-con-refuerzo-pack-x3",
      ]);
      const priorityExact = priority.filter((p) => isTiroAltoProduct(p) && isPackX3Product(p) && productMatchesResult(p, family, result));
      const restExact = familyProducts(products, family).filter((p) => isTiroAltoProduct(p) && isPackX3Product(p) && productMatchesResult(p, family, result));
      base = [...priorityExact, ...restExact];
    } else {
      const priority = orderedProductsByHandle(products, ["colaless-algodon-pack-x3", "vedetina-algodon-pack-x3", "colaless-estampada-pack-x3", "vedetina-labradas-pack-x3"]);
      const priorityExact = priority.filter((p) => isTiroBajoProduct(p) && isPackX3Product(p) && productMatchesResult(p, family, result));
      const restExact = familyProducts(products, family).filter((p) => isTiroBajoProduct(p) && isPackX3Product(p) && productMatchesResult(p, family, result));
      base = [...priorityExact, ...restExact];
    }
  }
  const seen = new Set<string>();
  return base
    .filter((p) => {
      const key = (p.url || p.handle || "") + "|" + p.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 4);
}

export function primaryResultProduct(products: Product[], family: FamilyId, result: ResultData, items: Product[]): Product | null {
  if (family === "Bombachas" && result.subtype === "tirita") {
    return (
      products.find((p) => p.handle === "colaless-corredera-pack-x3-1iknf") ||
      products.find((p) => /TIRITA|REGULABLE|CORREDERA/.test(normalize((p.handle || "") + " " + (p.name || "") + " " + (p.sourceCategory || "")))) ||
      null
    );
  }
  return items.length ? items[0] : null;
}

export function resultHref(family: FamilyId, result: ResultData): string {
  const key = family + "|" + (result.subtype || "");
  return SUBTYPE_URLS[key] || CATEGORY_URLS[family] || "https://juanitas.ar/";
}
