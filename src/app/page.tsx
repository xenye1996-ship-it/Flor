import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sprig from "@/components/Sprig";
import Reveal from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import { CameraIcon, ClockIcon, ShieldIcon, CardIcon } from "@/components/Icons";
import { products } from "@/lib/products";
import { heroPhoto } from "@/lib/photos";
import { site } from "@/lib/site";
import { publicReviews, publicReviewsAverage } from "@/lib/reviews";

const usps = [
  { icon: CameraIcon, title: "Фото перед отправкой", desc: "Покажем букет до того, как курьер выедет" },
  { icon: ClockIcon, title: "От 90 минут", desc: "Доставка по Череповцу без выходных" },
  { icon: ShieldIcon, title: "Гарантия замены", desc: "Не понравилось — заменим или вернём деньги" },
  { icon: CardIcon, title: "Открытка в подарок", desc: "Впишем ваши слова от руки" },
];

const marqueeItems = [
  "Свежесть каждый день",
  "Фото букета перед отправкой",
  "Доставка от 90 минут",
  "Открытка в подарок",
  `${site.couponNote} на первый заказ`,
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* ---------- Hero ---------- */}
        <section className="relative overflow-hidden">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-5 pb-20 pt-16 sm:pt-24 md:flex-row md:gap-10">
            <Reveal className="flex-1">
              <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-plum">
                Доставка цветов · Череповец
              </p>
              <h1 className="mb-5 max-w-[16ch] text-balance text-[40px] leading-[1.08] text-plum sm:text-[54px]">
                Букеты, собранные так, будто их дарят не спеша
              </h1>
              <p className="mb-8 max-w-[42ch] text-[16px] leading-relaxed text-ink-soft">
                Свежие цветы, спокойные сочетания и внимание к мелочам —
                с фото букета перед отправкой и открыткой от руки.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/catalog"
                  className="rounded-full bg-lavender px-6 py-3.5 text-[14.5px] font-semibold text-white transition-colors hover:bg-lavender-deep"
                >
                  Смотреть каталог
                </Link>
                <Link
                  href="/catalog?f=budget"
                  className="rounded-full border border-line px-6 py-3.5 text-[14.5px] font-semibold text-ink transition-colors hover:bg-surface-2"
                >
                  Букеты до 2000 ₽
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.15} className="relative flex-1">
              <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-20px_rgba(160,95,78,0.35)] sm:mx-auto">
                <Image
                  src={heroPhoto}
                  alt="Букет свежих цветов в мягких пастельных тонах"
                  fill
                  priority
                  sizes="(max-width: 640px) 90vw, 420px"
                  className="object-cover"
                />
              </div>
              <a
                href={site.vkHref}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-line bg-surface/90 px-5 py-3 shadow-lg backdrop-blur transition-colors hover:bg-surface sm:block"
              >
                <p className="text-[12px] text-ink-soft">Рейтинг во ВКонтакте</p>
                <p className="font-display text-[15px] text-plum">
                  ★ {publicReviewsAverage.toFixed(1)} · {publicReviews.length} отзыва
                </p>
              </a>
            </Reveal>
          </div>

          {/* Marquee */}
          <div className="overflow-hidden border-y border-line bg-surface/70 py-3">
            <div className="flex w-max animate-marquee gap-10 text-[12.5px] font-medium uppercase tracking-[0.08em] text-ink-soft">
              {[...marqueeItems, ...marqueeItems].map((item, i) => (
                <span key={i} className="flex items-center gap-10 shrink-0">
                  {item}
                  <span className="text-lavender-deep">✦</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- USP ---------- */}
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {usps.map((u, i) => (
              <Reveal key={u.title} delay={i * 0.08}>
                <u.icon className="mb-3 h-6 w-6 text-lavender-deep" />
                <p className="mb-1 font-display text-[16px] text-ink">
                  {u.title}
                </p>
                <p className="text-[12.5px] leading-snug text-ink-soft">
                  {u.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Catalog teaser ---------- */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[28px] text-plum">Хиты недели</h2>
            <Link
              href="/catalog"
              className="text-[13.5px] font-semibold text-lavender-deep hover:underline"
            >
              Весь каталог →
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {products.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Reviews ---------- */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="mb-2 text-[28px] text-plum">Отзывы покупателей</h2>
              <p className="max-w-[50ch] text-[14px] text-ink-soft">
                Реальные отзывы из нашей группы ВКонтакте.
              </p>
            </div>
            <a
              href={site.vkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13.5px] font-semibold text-lavender-deep hover:underline"
            >
              Все отзывы во ВКонтакте →
            </a>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-3">
            {publicReviews.map((r, i) => (
              <Reveal key={r.author} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-line bg-surface p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[13.5px] font-semibold text-ink">
                      {r.author}
                    </span>
                    <span className="text-[12px] text-lavender-deep">
                      {"★".repeat(r.rating)}
                    </span>
                  </div>
                  <p className="text-[13.5px] leading-relaxed text-ink-soft">
                    {r.text}
                  </p>
                  <p className="mt-3 text-[11.5px] text-ink-soft/70">{r.date}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Florist story ---------- */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-5 py-20 md:flex-row">
            <Reveal className="flex-1">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
                <Image
                  src="/shop/entrance.jpg"
                  alt={`Вход в мастерскую ${site.name}, ${site.city}`}
                  fill
                  sizes="(max-width: 768px) 90vw, 480px"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="flex-1">
              <Sprig className="mb-4 h-6 w-24" />
              <p className="font-display text-[22px] leading-snug text-plum sm:text-[25px]">
                «Собираем каждый букет сами — и отвечаем за него лично.
                Не гонимся за объёмом, работаем на то, чтобы он доехал
                свежим и простоял подольше».
              </p>
              <Link
                href="/about"
                className="mt-6 inline-block text-[13.5px] font-semibold text-lavender-deep hover:underline"
              >
                Узнать больше о нас →
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ---------- Care CTA ---------- */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <Reveal className="flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-pink/15 to-sage/10 p-8 sm:flex-row sm:items-center sm:p-10">
            <div>
              <h2 className="mb-2 text-[22px] text-plum">
                Как продлить жизнь букету
              </h2>
              <p className="max-w-[52ch] text-[14px] text-ink-soft">
                Короткая инструкция от наших флористов — чтобы цветы
                простояли на неделю дольше.
              </p>
            </div>
            <Link
              href="/care"
              className="shrink-0 rounded-full bg-plum px-6 py-3 text-[13.5px] font-semibold text-white hover:opacity-90"
            >
              Читать
            </Link>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
