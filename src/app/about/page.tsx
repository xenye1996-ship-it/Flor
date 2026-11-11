import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Sprig from "@/components/Sprig";
import { getSite } from "@/lib/content/store";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: `О нас — ${site.name}`,
    description: `${site.name} — букеты и композиции ручной сборки в Череповце.`,
  };
}

export default async function AboutPage() {
  const site = await getSite();
  const values = [
    {
      title: "Собираем сами",
      desc: "Без посредников и колл-центра — букеты собирает команда мастерской, а не сторонний исполнитель.",
    },
    {
      title: "Знаем город",
      desc: `Работаем в ${site.city}, поэтому доставляем точно и без лишних звонков «а как вас найти».`,
    },
    {
      title: "Показываем до отправки",
      desc: "Перед выездом курьера присылаем фото букета — можно спокойно согласовать детали.",
    },
  ];
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-5 pb-20 pt-14">
          <Reveal>
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-lavender-deep">
              О нас
            </p>
            <h1 className="mb-6 max-w-[20ch] text-balance text-[36px] leading-[1.1] text-plum">
              {site.name} — цветочная мастерская в Череповце
            </h1>
          </Reveal>

          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <Reveal>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image
                  src="/shop/entrance.jpg"
                  alt={`Вход в мастерскую ${site.name}, ${site.address}`}
                  fill
                  sizes="(max-width: 768px) 90vw, 480px"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mb-4 text-[15px] leading-relaxed text-ink-soft">
                Наша мастерская находится на {site.address.toLowerCase()},{" "}
                {site.city}. Собираем букеты сами, без конвейера, и
                стараемся, чтобы каждый доехал свежим.
              </p>
              <p className="text-[15px] leading-relaxed text-ink-soft">
                Не гонимся за самым большим каталогом — держим ассортимент,
                который можем контролировать от закупки до доставки.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="mt-16 rounded-2xl border border-line bg-surface p-6">
            <p className="mb-2 font-display text-[16px] text-ink">Команда</p>
            <p className="max-w-[64ch] text-[14px] leading-relaxed text-ink-soft">
              Букеты собирает команда флористов {site.name} — каждый заказ
              проходит вручную от закупки цветов до упаковки. Один из
              наших флористов, Наталья, оформляет праздничные корзины и
              композиции — клиенты не раз отмечали её работу в отзывах.
              Полный раздел с именами и специализацией мастеров
              пополняется — если хотите познакомиться с флористом лично
              перед крупным заказом, позвоните: {" "}
              <a href={site.phoneHref} className="text-lavender-deep hover:underline">
                {site.phone}
              </a>
              .
            </p>
          </Reveal>

          <div className="mt-20 grid gap-6 sm:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="rounded-2xl border border-line bg-surface p-5">
                  <p className="mb-2 font-display text-[16px] text-ink">
                    {v.title}
                  </p>
                  <p className="text-[13.5px] leading-relaxed text-ink-soft">
                    {v.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

        </section>

        <section className="mt-8 border-y border-line bg-surface">
          <div className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-16 md:flex-row md:items-center md:gap-14">
            <Reveal className="flex-1">
              <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-3xl">
                <Image
                  src="/shop/bouquet-outdoor.jpg"
                  alt={`Букет из мастерской ${site.name} у входа`}
                  fill
                  sizes="(max-width: 768px) 90vw, 420px"
                  className="object-cover object-center"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="flex-1">
              <Sprig className="mb-4 h-6 w-24" />
              <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-lavender-deep">
                Как нас найти
              </p>
              <h2 className="mb-4 font-display text-[26px] leading-snug text-plum sm:text-[30px]">
                {site.city}
                <br />
                {site.address}
              </h2>
              <p className="mb-6 max-w-[36ch] text-[14.5px] leading-relaxed text-ink-soft">
                Заходите в мастерскую или оформите доставку — свежие букеты
                собираем каждый день.
              </p>
              <a
                href={site.phoneHref}
                className="inline-flex rounded-full bg-lavender px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-lavender-deep"
              >
                {site.phone}
              </a>
              <div className="mt-5 flex flex-wrap gap-4 text-[13.5px]">
                <a
                  href={site.vkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-lavender-deep hover:underline"
                >
                  ВКонтакте
                </a>
                <a
                  href={site.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-lavender-deep hover:underline"
                >
                  WhatsApp
                </a>
                <a
                  href={site.telegramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-lavender-deep hover:underline"
                >
                  Telegram
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
