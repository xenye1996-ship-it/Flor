import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { getSite } from "@/lib/content/store";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: `Доставка и оплата — ${site.name}`,
    description:
      "Условия доставки по Череповцу, способы оплаты, ответы на частые вопросы.",
  };
}

const faq = [
  {
    q: "Сколько стоит доставка?",
    a: "Бесплатно при заказе от 2 500 ₽. Дешевле — доставка от 250 ₽ в зависимости от района.",
  },
  {
    q: "Как быстро привезут букет?",
    a: "От 90 минут по городу. При заказе на конкретное время — доставим в выбранный часовой интервал.",
  },
  {
    q: "Можно оплатить картой?",
    a: "Да — СБП по QR-коду, картой онлайн при оформлении заказа или наличными курьеру.",
  },
  {
    q: "Доставляете за город?",
    a: "Да, обсудим стоимость и сроки индивидуально — напишите или позвоните перед заказом.",
  },
];

export default async function DeliveryPage() {
  const site = await getSite();
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-5 pb-20 pt-14">
          <Reveal>
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-lavender-deep">
              Условия
            </p>
            <h1 className="mb-10 text-balance text-[34px] leading-[1.1] text-plum">
              Доставка и оплата
            </h1>
          </Reveal>

          <Reveal className="mb-12 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="mb-1 font-display text-[20px] text-plum">
                от 90 минут
              </p>
              <p className="text-[13px] text-ink-soft">По Череповцу, без выходных</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="mb-1 font-display text-[20px] text-plum">
                от 2 500 ₽
              </p>
              <p className="text-[13px] text-ink-soft">Бесплатная доставка от этой суммы</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="mb-1 font-display text-[20px] text-plum">
                СБП / карта / нал
              </p>
              <p className="text-[13px] text-ink-soft">Оплата любым удобным способом</p>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="mb-6 text-[22px] text-plum">Частые вопросы</h2>
          </Reveal>
          <div className="flex flex-col">
            {faq.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.05}>
                <details className="group border-t border-line py-4 first:border-t-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-[14.5px] font-medium text-ink">
                    {f.q}
                    <span className="ml-4 shrink-0 text-ink-soft transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 max-w-[58ch] text-[13.5px] leading-relaxed text-ink-soft">
                    {f.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16 rounded-2xl border border-line bg-surface p-6 text-center">
            <p className="mb-1 text-[13.5px] text-ink-soft">
              Мастерская: {site.city}, {site.address}
            </p>
            <a
              href={site.phoneHref}
              className="text-[15px] font-semibold text-lavender-deep hover:underline"
            >
              {site.phone}
            </a>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
