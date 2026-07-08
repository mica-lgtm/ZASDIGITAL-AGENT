import productsJson from "./products.json" with { type: "json" };

export type Product = {
  id: string;
  handle: string;
  name: string;
  category: string;
  family: string;
  sourceCategory: string;
  url: string;
  categoryUrl: string;
  image: string;
  talles: string[];
  corpinioTalles: string[];
  colors: string[];
  variantKeys: { Color: string; Talle: string }[];
  price: string;
  promoPrice: string;
  // Stock en vivo por talle (clave = talle normalizado), en cualquier color.
  // Ausente cuando el dato viene del catálogo estático de fallback — en ese
  // caso se asume disponible.
  stockBySize?: Record<string, boolean>;
};

// Catálogo estático extraído del prototipo — se reemplaza por datos en vivo
// de Tienda Nube en la etapa de conexión con el catálogo real.
export const PRODUCTS: Product[] = productsJson as Product[];

export const LOGO_URL =
  "https://acdn-us.mitiendanube.com/stores/003/671/131/themes/common/logo-1151752068-1730904635-ab6821c06efc099ec87218d3183b85491730904636-480-0.webp";

export const FALLBACK_IMAGES: Record<string, string> = {
  Bombachas: "https://acdn-us.mitiendanube.com/stores/003/671/131/products/56-0d92a651426ef3200517533817924320-1024-1024.webp",
  "Corpiño": "https://acdn-us.mitiendanube.com/stores/003/671/131/products/63-7e2abd9858897d70d117761038597896-1024-1024.webp",
  Camiseta: "https://acdn-us.mitiendanube.com/stores/003/671/131/products/16-3b0dfa5020e8b5847217534618160837-1024-1024.webp",
  Conjunto: "https://acdn-us.mitiendanube.com/stores/003/671/131/products/7-8f974162a46cda6bdc17736888837508-1024-1024.webp",
  "Traje de Baño": "https://acdn-us.mitiendanube.com/stores/003/671/131/products/75-7d91311a65133f5c4b17600356866274-1024-1024.webp",
};

export type FamilyId = "Bombachas" | "Camisetas" | "Corpiños" | "Trajes de baño";

export const FAMILY_OPTIONS: { id: FamilyId; title: string; copy: string; image: string }[] = [
  { id: "Bombachas", title: "Bombachas", copy: "Bombachas, colaless, vedetinas y packs.", image: FALLBACK_IMAGES["Bombachas"] },
  { id: "Camisetas", title: "Camisetas", copy: "Camisetas de algodón y térmicas.", image: FALLBACK_IMAGES["Camiseta"] },
  { id: "Corpiños", title: "Corpiños", copy: "Taza soft y deportivos.", image: FALLBACK_IMAGES["Corpiño"] },
  { id: "Trajes de baño", title: "Trajes de baño", copy: "Bikinis, enterizas y bombachas de bikini.", image: FALLBACK_IMAGES["Traje de Baño"] },
];

type Range = [number, number];
type SizeRow = {
  talle: string;
  cintura?: Range;
  cadera?: Range;
  busto?: Range;
  corpinio?: string;
  pantalon?: string;
};

export const SIZE_GUIDES: Record<string, SizeRow[]> = {
  Bombachas: [
    { talle: "1", cintura: [65, 70], cadera: [90, 95] },
    { talle: "2", cintura: [70, 75], cadera: [95, 100] },
    { talle: "3", cintura: [75, 80], cadera: [100, 105] },
    { talle: "4", cintura: [80, 85], cadera: [105, 110] },
    { talle: "5", cintura: [85, 90], cadera: [110, 115] },
    { talle: "6", cintura: [90, 95], cadera: [115, 120] },
    { talle: "7", cintura: [95, 100], cadera: [120, 125] },
    { talle: "8", cintura: [100, 105], cadera: [125, 130] },
  ],
  BombachaUnicoGeneral: [{ talle: "ÚNICO", cintura: [86, 96], cadera: [110, 130], pantalon: "42-48" }],
  BombachaTiritaRegulable: [{ talle: "ÚNICO", cintura: [66, 90], cadera: [90, 116], pantalon: "36-44" }],
  CorpinioTazaSoft: [
    { talle: "85", busto: [80, 85] },
    { talle: "90", busto: [85, 90] },
    { talle: "95", busto: [90, 95] },
    { talle: "100", busto: [95, 100] },
    { talle: "105", busto: [100, 105] },
  ],
  CorpinioDeportivo: [
    { talle: "85", busto: [80, 85] },
    { talle: "90", busto: [85, 90] },
    { talle: "95", busto: [90, 95] },
    { talle: "100", busto: [95, 100] },
    { talle: "105", busto: [100, 105] },
    { talle: "110", busto: [105, 110] },
  ],
  Camiseta: [
    { talle: "1", busto: [80, 85], cadera: [85, 90] },
    { talle: "2", busto: [85, 90], cadera: [90, 95] },
    { talle: "3", busto: [90, 95], cadera: [95, 100] },
    { talle: "4", busto: [95, 100], cadera: [105, 110] },
    { talle: "5", busto: [100, 105], cadera: [115, 120] },
    { talle: "6", busto: [105, 110], cadera: [120, 125] },
  ],
  TrajeLupita: [
    { talle: "1", corpinio: "85", busto: [85, 89], cintura: [64, 68], cadera: [98, 102] },
    { talle: "2", corpinio: "90", busto: [90, 94], cintura: [70, 74], cadera: [102, 106] },
    { talle: "3", corpinio: "95", busto: [95, 99], cintura: [76, 80], cadera: [106, 110] },
    { talle: "4", corpinio: "100", busto: [100, 104], cintura: [82, 86], cadera: [110, 114] },
    { talle: "5", corpinio: "105", busto: [105, 109], cintura: [88, 92], cadera: [114, 118] },
    { talle: "6", corpinio: "110", busto: [110, 114], cintura: [94, 98], cadera: [120, 124] },
    { talle: "7", corpinio: "115", busto: [115, 119], cintura: [100, 104], cadera: [126, 130] },
    { talle: "8", corpinio: "120", busto: [120, 124], cintura: [106, 110], cadera: [132, 136] },
  ],
  TrajeZoeTaniaAitana: [
    { talle: "1", corpinio: "90", busto: [90, 94], cintura: [64, 68], cadera: [98, 102] },
    { talle: "2", corpinio: "95", busto: [95, 99], cintura: [70, 74], cadera: [102, 106] },
    { talle: "3", corpinio: "100", busto: [100, 104], cintura: [76, 80], cadera: [106, 110] },
    { talle: "4", corpinio: "105", busto: [105, 109], cintura: [82, 86], cadera: [110, 114] },
    { talle: "5", corpinio: "110", busto: [110, 115], cintura: [88, 92], cadera: [114, 118] },
  ],
  TrajeEnteriza: [
    { talle: "1", busto: [85, 89], cintura: [64, 68], cadera: [89, 94] },
    { talle: "2", busto: [90, 94], cintura: [70, 74], cadera: [95, 101] },
    { talle: "3", busto: [95, 99], cintura: [76, 80], cadera: [102, 107] },
    { talle: "4", busto: [100, 104], cintura: [82, 86], cadera: [108, 113] },
    { talle: "5", busto: [105, 109], cintura: [88, 92], cadera: [114, 119] },
    { talle: "6", busto: [110, 114], cintura: [94, 98], cadera: [120, 125] },
    { talle: "7", busto: [115, 119], cintura: [100, 104], cadera: [126, 131] },
  ],
};

export const CATEGORY_URLS: Record<string, string> = {
  Bombachas: "https://juanitas.ar/bombachas/",
  Camisetas: "https://juanitas.ar/camisetas/",
  "Corpiños": "https://juanitas.ar/corpinos/",
  "Trajes de baño": "https://juanitas.ar/trajes-de-bano/",
};

export const SUBTYPE_URLS: Record<string, string> = {
  "Corpiños|deportivo": "https://juanitas.ar/search/?q=Corpi%C3%B1o+deportivo",
  "Corpiños|tazaSoft": "https://juanitas.ar/search/?q=Taza+soft",
  "Camisetas|camiseta": "https://juanitas.ar/camisetas/",
  "Bombachas|tirita": "https://juanitas.ar/productos/colaless-corredera-pack-x3-1iknf/",
};

export const SUBTYPE_FEATURED_RECOMMENDATIONS: Record<string, string[]> = {
  "Bombachas|numerico": ["colaless-algodon-pack-x3", "vedetina-algodon-pack-x3", "colaless-estampada-pack-x3", "vedetina-labradas-pack-x3"],
  "Bombachas|unicoGeneral": ["bombacha-universal-algodon-pack-x3", "bombacha-especial-algodon-pack-x3"],
  "Bombachas|tirita": [
    "colaless-corredera-pack-x3-1iknf",
    "colaless-regulable-sport-basic-pack-x3-gjk54",
    "colaless-corredera-algodon-pack-x3-k0ea4",
    "colaless-corredera-estampada-pack-x3",
    "colaless-corredera-labradas-pack-x3",
  ],
  "Corpiños|tazaSoft": ["corpino-taza-soft-basico-algodon", "1-corpino-taza-soft-colaless-algodon-pack-x3"],
  "Corpiños|deportivo": ["corpino-deportivo-basico-pack-x3", "1-corpino-deportivo-colaless-pack-x3-doasa"],
  "Camisetas|camiseta": ["camiseta-termica-cuello-redondo-manga-larga", "camisetamangacorta", "camiseta-algodon-escote-en-v-manga-larga"],
  "Trajes de baño|lupita": ["bikini-lupitacolaless-rjihc", "corpino-lupita-tasa-soft-bikini-liso", "corpino-lupita-tasa-soft-bikini-estampado"],
  "Trajes de baño|zoeTaniaAitana": ["corpino-top-zoe-bikini-lisos", "corpino-torsado-tania-bikini-pack-x2", "bikini-aitana-colaless-gj28w"],
  "Trajes de baño|enteriza": ["entera-vedetina-carol-estampada", "entera-colaless-cata-lisas", "entera-vedetina-carol-lisa"],
};

// Overrides de imagen para handles puntuales (fotos curadas más representativas
// que la imagen por defecto del producto).
export const FEATURED_IMAGE_OVERRIDES: Record<string, string> = {
  "colaless-algodon-pack-x3": "https://acdn-us.mitiendanube.com/stores/003/671/131/products/pack-x3-bombachas-10-49c49b8721bb0fb3f617532109692975-1024-1024.webp",
  "vedetina-algodon-pack-x3": "https://acdn-us.mitiendanube.com/stores/003/671/131/products/pack-x3-bombachas-16-54d603aa6d74e8810217532703486772-1024-1024.webp",
  "colaless-estampada-pack-x3": "https://acdn-us.mitiendanube.com/stores/003/671/131/products/estampados-nube-13-fc436e1aae89b8d68a17688507471441-1024-1024.webp",
  "vedetina-labradas-pack-x3": "https://acdn-us.mitiendanube.com/stores/003/671/131/products/11-5592fda078fcd7338917544994640733-1024-1024.webp",
  "colaless-corredera-pack-x3-1iknf": "https://acdn-us.mitiendanube.com/stores/003/671/131/products/149-d572b88acd62b5351d17827619199718-1024-1024.webp",
  "colaless-regulable-sport-basic-pack-x3-gjk54": "https://acdn-us.mitiendanube.com/stores/003/671/131/products/1-1f0e6818cb77185cfa17623694155292-1024-1024.webp",
  "colaless-corredera-algodon-pack-x3-k0ea4": "https://acdn-us.mitiendanube.com/stores/003/671/131/products/_algodon-nube-17-3b2a02347bba07eafb17822395357598-1024-1024.webp",
  "colaless-corredera-estampada-pack-x3": "https://acdn-us.mitiendanube.com/stores/003/671/131/products/estampados-nube-4-2f1fb07be3f42b2ab717685621603907-1024-1024.webp",
  "colaless-corredera-labradas-pack-x3": "https://acdn-us.mitiendanube.com/stores/003/671/131/products/9-187827dbd4c087eba517628898138613-1024-1024.webp",
};
