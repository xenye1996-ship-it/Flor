import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import AddToCartButton from "@/components/AddToCartButton";
import Reveal from "@/components/Reveal";
import Sprig from "@/components/Sprig";
import { occasionLabels } from "@/lib/products";
import {
  getPhotos,
  getProductBySlug,
  getProducts,
  getSite,
} from "@/lib/content/store";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [product, site, photos] = await Promise.all([
    getProductBySlug(slug),
    getSite(),
    getPhotos(),
  ]);
  if (!product) return {};
  const title = `${product.name} — купить с доставкой в ${site.city} — ${site.name}`;
  const photo = photos.products[product.slug];
  return {
    title,
    description: product.description,
    openGraph: {
      title,
      description: product.description,
      images: photo ? [{ url: photo }] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, products, photos, site] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
    getPhotos(),
    getSite(),
  ]);
  if (!product) notFound();

  const similar = products
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);

  const mainPhoto = photos.products[product.slug] || photos.hero;
  const thumbs = [mainPhoto, photos.gallery, photos.story, mainPhoto];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} — ${product.line}`,
    description: product.description,
    image: mainPhoto,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "RUB",
      availability: "https://schema.org/InStock",
      areaServed: site.city,
      url: `https://срмтест.биз.рус/catalog/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-10">
          <nav className="mb-6 text-[12.5px] text-ink-soft">
            <Link href="/catalog" className="hover:text-ink">
              Каталог
            </Link>{" "}
            / <span className="text-ink">{product.name}</span>
          </nav>

          <div className="grid gap-10 md:grid-cols-2">
            {/* Gallery */}
            <Reveal>
              <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl border border-line bg-surface-2">
                <Image
                  src={mainPhoto}
                  alt={`${product.name} — ${product.line}`}
                  fill
                  sizes="(max-width: 768px) 90vw, 480px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {thumbs.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-lg border border-line opacity-75 transition-opacity hover:opacity-100"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Details */}
            <Reveal delay={0.1}>
              <div className="mb-2 flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-ink-soft"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="mb-1 text-[28px] text-plum">{product.name}</h1>
              <p className="mb-4 text-[15px] text-ink-soft">{product.line}</p>

              <div className="mb-5 flex items-baseline gap-3">
                <span className="text-[24px] font-semibold text-plum">
                  {product.price.toLocaleString("ru-RU")} ₽
                </span>
                {product.oldPrice && (
                  <span className="text-[15px] text-ink-soft line-through">
                    {product.oldPrice.toLocaleString("ru-RU")} ₽
                  </span>
                )}
              </div>

              <p className="mb-5 max-w-[52ch] text-[14.5px] leading-relaxed text-ink-soft">
                {product.description}
              </p>

              <div className="mb-6 rounded-xl border border-line bg-surface p-4 text-[13.5px] text-ink-soft">
                <span className="font-semibold text-ink">Состав: </span>
                {product.composition}
              </div>

              <dl className="mb-6 grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <dt className="text-ink-soft">Размер</dt>
                  <dd className="text-ink">{product.size}</dd>
                </div>
                <div>
                  <dt className="text-ink-soft">Простоит</dt>
                  <dd className="text-ink">{product.vaseLife}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="mb-1 text-ink-soft">В комплекте</dt>
                  <dd className="text-ink">{product.includes.join(" · ")}</dd>
                </div>
              </dl>

              <div className="mb-6 flex flex-wrap gap-2">
                {product.occasions.map((o) => (
                  <span
                    key={o}
                    className="rounded-full border border-line px-3 py-1 text-[12px] text-ink-soft"
                  >
                    {occasionLabels[o]}
                  </span>
                ))}
              </div>

              <AddToCartButton slug={product.slug} />

              <div className="mt-6 flex items-start gap-3 rounded-xl bg-surface-2 p-4">
                <span className="text-[16px]">🌸</span>
                <p className="text-[13px] leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">Совет по уходу: </span>
                  {product.careTip}
                </p>
              </div>
            </Reveal>
          </div>

          {/* Reviews */}
          <div className="mt-16 border-t border-line pt-10">
            <Reveal>
              <Sprig className="mb-4 h-6 w-20" />
              <h2 className="mb-6 text-[22px] text-plum">Отзывы</h2>
            </Reveal>
            {product.reviews.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {product.reviews.map((r, i) => (
                  <Reveal key={r.author + r.date} delay={i * 0.08}>
                    <div className="rounded-xl border border-line bg-surface p-4">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[13.5px] font-semibold text-ink">
                          {r.author}
                        </span>
                        <span className="text-[12px] text-lavender-deep">
                          {"★".repeat(r.rating)}
                          {"☆".repeat(5 - r.rating)}
                        </span>
                      </div>
                      <p className="text-[13px] leading-relaxed text-ink-soft">
                        {r.text}
                      </p>
                      <p className="mt-2 text-[11.5px] text-ink-soft/70">
                        {r.date}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal className="rounded-xl border border-dashed border-line bg-surface px-6 py-8 text-center">
                <p className="mb-2 text-[14px] text-ink-soft">
                  Отзывов об этом букете пока нет — закажите и станьте
                  первым, кто его оставит.
                </p>
                <a
                  href={site.vkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-semibold text-lavender-deep hover:underline"
                >
                  Почитать отзывы о других заказах во ВКонтакте →
                </a>
              </Reveal>
            )}
          </div>

          {/* Similar */}
          <div className="mt-16 border-t border-line pt-10">
            <Reveal>
              <h2 className="mb-6 text-[22px] text-plum">Похожие букеты</h2>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {similar.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.06}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
