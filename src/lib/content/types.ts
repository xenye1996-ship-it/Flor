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
  reviews: Review[];
  tone: "lavender" | "pink" | "mixed";
};

export type SiteInfo = {
  name: string;
  tagline: string;
  city: string;
  address: string;
  phone: string;
  phoneHref: string;
  whatsappHref: string;
  telegramHref: string;
  vkHref: string;
  couponNote: string;
};

export type UspIcon = "camera" | "clock" | "card";

export type LandingContent = {
  eyebrow: string;
  headline: string;
  subhead: string;
  ctaPrimary: string;
  ctaSecondary: string;
  usps: { icon: UspIcon; title: string; desc: string }[];
  marquee: string[];
  hitsTitle: string;
  quote: string;
  careTitle: string;
  careText: string;
  careCta: string;
  careHref: string;
};

export type PhotosContent = {
  hero: string;
  story: string;
  gallery: string;
  shop: string;
  products: Record<string, string>;
};

export type ReviewsContent = {
  average: number;
  items: Review[];
};

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  action: string;
  details?: string;
};
