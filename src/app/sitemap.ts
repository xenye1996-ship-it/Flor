import type { MetadataRoute } from "next";
import { products } from "@/lib/products";

const siteUrl = "https://срмтест.биз.рус";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/catalog",
    "/about",
    "/care",
    "/delivery",
    "/cart",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes = products.map((p) => ({
    url: `${siteUrl}/catalog/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...productRoutes];
}
