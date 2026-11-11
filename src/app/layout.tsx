import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { PublicDataProvider } from "@/lib/public-data";
import YandexMetrika from "@/components/YandexMetrika";
import {
  getPhotos,
  getProducts,
  getReviews,
  getSite,
} from "@/lib/content/store";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["cyrillic", "latin"],
  weight: ["500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = "https://срмтест.биз.рус";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const title = `${site.name} — доставка цветов в ${site.city}`;
  const description =
    "Букеты и композиции ручной сборки. Доставка по Череповцу, открытка в подарок, фото букета перед отправкой.";
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: site.name,
      locale: "ru_RU",
      type: "website",
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [site, products, photos, reviews] = await Promise.all([
    getSite(),
    getProducts(),
    getPhotos(),
    getReviews(),
  ]);

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "FloristShop",
    name: site.name,
    telephone: site.phone,
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: site.city,
      addressCountry: "RU",
    },
    areaServed: site.city,
  };

  return (
    <html
      lang="ru"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <YandexMetrika />
        <PublicDataProvider value={{ site, products, photos, reviews }}>
          <CartProvider>{children}</CartProvider>
        </PublicDataProvider>
      </body>
    </html>
  );
}
