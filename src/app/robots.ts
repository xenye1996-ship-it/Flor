import type { MetadataRoute } from "next";

const siteUrl = "https://срмтест.биз.рус";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
