import { promises as fs } from "fs";
import path from "path";
import type {
  AuditEntry,
  LandingContent,
  PhotosContent,
  Product,
  ReviewsContent,
  SiteInfo,
} from "./types";

const dataDir = path.join(process.cwd(), "data");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(dataDir, file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  const target = path.join(dataDir, file);
  const tmp = `${target}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, target);
}

export async function getSite(): Promise<SiteInfo> {
  return readJson<SiteInfo>("site.json", {
    name: "STEM",
    tagline: "",
    city: "",
    address: "",
    phone: "",
    phoneHref: "",
    whatsappHref: "",
    telegramHref: "",
    vkHref: "",
    couponNote: "",
  });
}

export async function saveSite(site: SiteInfo) {
  await writeJson("site.json", site);
}

export async function getProducts(): Promise<Product[]> {
  return readJson<Product[]>("products.json", []);
}

export async function saveProducts(products: Product[]) {
  await writeJson("products.json", products);
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function getLanding(): Promise<LandingContent> {
  return readJson<LandingContent>("landing.json", {
    eyebrow: "",
    headline: "",
    subhead: "",
    ctaPrimary: "",
    ctaSecondary: "",
    usps: [],
    marquee: [],
    hitsTitle: "",
    quote: "",
    careTitle: "",
    careText: "",
    careCta: "Читать",
    careHref: "/care",
  });
}

export async function saveLanding(landing: LandingContent) {
  await writeJson("landing.json", landing);
}

export async function getPhotos(): Promise<PhotosContent> {
  return readJson<PhotosContent>("photos.json", {
    hero: "",
    story: "",
    gallery: "",
    shop: "",
    products: {},
  });
}

export async function savePhotos(photos: PhotosContent) {
  await writeJson("photos.json", photos);
}

export async function getReviews(): Promise<ReviewsContent> {
  return readJson<ReviewsContent>("reviews.json", { average: 0, items: [] });
}

export async function saveReviews(reviews: ReviewsContent) {
  await writeJson("reviews.json", reviews);
}

export async function getAudit(limit = 100): Promise<AuditEntry[]> {
  const all = await readJson<AuditEntry[]>("audit.json", []);
  return all.slice(0, limit);
}

export async function appendAudit(
  entry: Omit<AuditEntry, "id" | "at"> & { at?: string },
) {
  const all = await readJson<AuditEntry[]>("audit.json", []);
  const full: AuditEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: entry.at ?? new Date().toISOString(),
    actor: entry.actor,
    action: entry.action,
    details: entry.details,
  };
  all.unshift(full);
  await writeJson("audit.json", all.slice(0, 500));
  return full;
}

export async function saveUpload(fileName: string, bytes: Buffer) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const unique = `${Date.now()}-${safe}`;
  await fs.writeFile(path.join(uploadsDir, unique), bytes);
  return `/uploads/${unique}`;
}
