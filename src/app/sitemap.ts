import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/content/store";

const siteUrl = "https://срмтест.биз.рус";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

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
