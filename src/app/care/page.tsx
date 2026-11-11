import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Sprig from "@/components/Sprig";
import { getSite } from "@/lib/content/store";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: `Уход за цветами — ${site.name}`,
    description: "Как продлить жизнь букету: срез, вода, температура, свет.",
  };
}

const steps = [
  {
    title: "Обновите срез",
    desc: "Сразу после доставки подрежьте стебли под углом 45° острым ножом или секатором — на 2–3 см. Ножницы приминают ткань стебля и мешают ему пить воду.",
  },
  {
    title: "Уберите лишние листья",
    desc: "Всё, что окажется ниже уровня воды в вазе, снимите — иначе вода зацветёт за пару дней и букет завянет быстрее.",
  },
  {
    title: "Тёплая вода, не холодная",
    desc: "Цветы лучше усваивают воду комнатной температуры. Меняйте её каждые 2 дня, подрезая стебли заново.",
  },
  {
    title: "Подальше от батарей и солнца",
    desc: "Прямой солнечный свет и отопительные приборы ускоряют увядание — держите букет в прохладном месте без сквозняка.",
  },
  {
    title: "Не ставьте рядом с фруктами",
    desc: "Спелые фрукты выделяют этилен, от которого цветы вянут быстрее. Ваза и фруктовница — не соседи.",
  },
];

export default async function CarePage() {
  const site = await getSite();
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-5 pb-20 pt-14">
          <Reveal>
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-lavender-deep">
              Уход
            </p>
            <h1 className="mb-4 text-balance text-[34px] leading-[1.1] text-plum">
              Как продлить жизнь букету
            </h1>
            <p className="mb-12 max-w-[56ch] text-[15px] leading-relaxed text-ink-soft">
              Пять простых правил от наших флористов — следуя им, любой
              букет простоит на несколько дней дольше.
            </p>
          </Reveal>

          <div className="flex flex-col gap-0">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <div className="flex gap-5 border-t border-line py-6 first:border-t-0 first:pt-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 font-display text-[14px] text-plum">
                    {i + 1}
                  </span>
                  <div>
                    <p className="mb-1.5 font-display text-[17px] text-ink">
                      {s.title}
                    </p>
                    <p className="max-w-[58ch] text-[14px] leading-relaxed text-ink-soft">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-line bg-surface p-8 text-center">
            <Sprig className="h-8 w-28" />
            <p className="max-w-[46ch] text-[14px] leading-relaxed text-ink-soft">
              Остались вопросы по уходу за конкретным букетом? Позвоните —
              подскажем.
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
