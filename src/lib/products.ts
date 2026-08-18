export type Occasion =
  | "date"
  | "sorry"
  | "mom"
  | "birthday"
  | "just-because";

export type Review = {
  author: string;
  rating: number;
  text: string;
  date: string;
};

export type Product = {
  slug: string;
  name: string;
  line: string;
  price: number;
  oldPrice?: number;
  composition: string;
  description: string;
  careTip: string;
  size: string;
  vaseLife: string;
  includes: string[];
  tags: string[];
  occasions: Occasion[];
  /** Real customer reviews only — leave empty until genuine feedback comes in. */
  reviews: Review[];
  tone: "lavender" | "pink" | "mixed";
};

export const occasionLabels: Record<Occasion, string> = {
  date: "На свидание",
  sorry: "Извиниться",
  mom: "Маме",
  birthday: "На день рождения",
  "just-because": "Просто так",
};

export const products: Product[] = [
  {
    slug: "sotsvetie-lavanda",
    name: "«Соцветие»",
    line: "Монобукет гортензии",
    price: 2400,
    composition: "3 крупные шапки гортензии, крафт, лента",
    description:
      "Три крупные шапки гортензии в чистом виде — букет, который держится на объёме, а не на количестве стеблей. Хорошо смотрится и в подарок, и просто для дома. Доставка по Череповцу.",
    careTip:
      "Перед тем как поставить в вазу, обновите срез под углом 45° и на несколько секунд опустите цветок целиком в тёплую воду — гортензия пьёт и лепестками тоже.",
    size: "≈ 30–35 см в диаметре",
    vaseLife: "7–10 дней при регулярной смене воды",
    includes: ["Крафт-упаковка", "Лента", "Открытка с текстом — бесплатно"],
    tags: ["Гортензии", "Хит"],
    occasions: ["just-because", "birthday"],
    reviews: [],
    tone: "lavender",
  },
  {
    slug: "dymka",
    name: "«Дымка»",
    line: "Гортензия и роза",
    price: 3490,
    oldPrice: 3900,
    composition: "7 роз, 3 шапки гортензии, эвкалипт",
    description:
      "Гортензия добавляет объём, розы — акцент, эвкалипт — лёгкий аромат и зелень между соцветиями. Самый универсальный букет: подходит и для романтики, и для благодарности. Доставка по Череповцу.",
    careTip:
      "Розы в этом букете лучше подрезать раз в 2–3 дня — так весь букет, включая гортензию, простоит дольше.",
    size: "≈ 35–40 см в диаметре",
    vaseLife: "6–8 дней при регулярной смене воды",
    includes: ["Упаковка в плёнку и крафт", "Лента", "Открытка с текстом — бесплатно"],
    tags: ["Гортензии", "На подарок"],
    occasions: ["date", "birthday", "sorry"],
    reviews: [],
    tone: "mixed",
  },
  {
    slug: "kompakt",
    name: "«Компакт»",
    line: "Бюджетный букет",
    price: 1200,
    composition: "Кустовая хризантема, зелень",
    description:
      "Небольшой, но живой букет без гортензии — для случаев, когда важен жест, а не масштаб. Хорошо работает как «просто так» или дополнение к подарку. Доставка по Череповцу.",
    careTip:
      "Хризантема стоит долго сама по себе — меняйте воду раз в 2 дня, и букет продержится до трёх недель.",
    size: "≈ 20–25 см в диаметре",
    vaseLife: "14–21 день — хризантема стоит дольше большинства цветов",
    includes: ["Упаковка в крафт", "Лента"],
    tags: ["До 2000 ₽"],
    occasions: ["just-because", "sorry"],
    reviews: [],
    tone: "pink",
  },
  {
    slug: "korobka",
    name: "«Коробка»",
    line: "Гортензия в шляпной коробке",
    price: 4200,
    composition: "Гортензия, сезонные цветы, шляпная коробка",
    description:
      "Композиция в шляпной коробке не мнётся при доставке и не требует вазы — можно сразу поставить на стол. Гортензия занимает центр, сезонные цветы — по кругу. Доставка по Череповцу.",
    careTip:
      "В коробке есть влажная губка — доливайте немного воды каждый день, композиция простоит дольше вазы.",
    size: "Коробка ⌀ 25 см, высота 20 см",
    vaseLife: "5–7 дней при регулярном поливе губки",
    includes: ["Шляпная коробка", "Флористическая губка", "Открытка с текстом — бесплатно"],
    tags: ["Гортензии", "Премиум"],
    occasions: ["mom", "birthday"],
    reviews: [],
    tone: "mixed",
  },
];

export const filters = [
  "Все",
  "Гортензии",
  "До 2000 ₽",
  "На свидание",
  "Извиниться",
  "Маме",
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}
