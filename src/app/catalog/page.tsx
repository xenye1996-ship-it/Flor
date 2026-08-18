import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Sprig from "@/components/Sprig";
import Reveal from "@/components/Reveal";
import { products, type Product } from "@/lib/products";
import { site } from "@/lib/site";

const title = `Каталог букетов с доставкой в ${site.city} — ${site.name}`;
const description = `Купить букет с доставкой в ${site.city}: гортензии, композиции в коробке, букеты до 2000 ₽. Фильтры по поводу и цене.`;

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
};

const filterChips = [
  { label: "Все", key: "all" },
  { label: "Гортензии", key: "hydrangeas" },
  { label: "До 2000 ₽", key: "budget" },
  { label: "На свидание", key: "date" },
  { label: "Извиниться", key: "sorry" },
  { label: "Маме", key: "mom" },
] as const;

function matchesFilter(product: Product, key: string) {
  switch (key) {
    case "hydrangeas":
      return product.tags.includes("Гортензии");
    case "budget":
      return product.price <= 2000;
    case "date":
      return product.occasions.includes("date");
    case "sorry":
      return product.occasions.includes("sorry");
    case "mom":
      return product.occasions.includes("mom");
    default:
      return true;
  }
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const { f } = await searchParams;
  const activeKey = f && filterChips.some((c) => c.key === f) ? f : "all";
  const filtered = products.filter((p) => matchesFilter(p, activeKey));

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-14">
          <Reveal className="relative mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-lavender-deep">
                Каталог
              </p>
              <h1 className="text-[34px] text-plum">Все букеты</h1>
            </div>
            <Sprig className="hidden h-10 w-32 sm:block" />
          </Reveal>

          <Reveal delay={0.08} className="mb-10 flex flex-wrap gap-2">
            {filterChips.map((c) => {
              const active = c.key === activeKey;
              return (
                <Link
                  key={c.key}
                  href={c.key === "all" ? "/catalog" : `/catalog?f=${c.key}`}
                  className={`rounded-full border px-4 py-1.5 text-[12.5px] transition-colors ${
                    active
                      ? "border-lavender bg-lavender text-white"
                      : "border-line text-ink-soft hover:bg-surface-2"
                  }`}
                >
                  {c.label}
                </Link>
              );
            })}
          </Reveal>

          {filtered.length === 0 ? (
            <Reveal className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-8 py-16 text-center">
              <Sprig className="h-8 w-28 opacity-80" />
              <p className="font-display text-[19px] text-ink">
                По этому фильтру пока пусто
              </p>
              <p className="mb-2 text-[14px] text-ink-soft">
                Посмотрите весь каталог — там точно найдётся букет по вкусу.
              </p>
              <Link
                href="/catalog"
                className="inline-block rounded-full bg-lavender px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-lavender-deep"
              >
                Показать все букеты
              </Link>
            </Reveal>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.06}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
