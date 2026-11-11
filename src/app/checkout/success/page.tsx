import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sprig from "@/components/Sprig";
import { getSite } from "@/lib/content/store";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; total?: string; track?: string }>;
}) {
  const { order, total, track } = await searchParams;
  const site = await getSite();

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-5 py-24 text-center">
          <Sprig className="mx-auto mb-6 h-8 w-28" />
          <h1 className="mb-3 text-[28px] text-plum">Заказ принят</h1>
          {order && (
            <p className="mb-1 text-[14px] text-ink-soft">
              Номер заказа: <span className="text-ink">{order}</span>
            </p>
          )}
          {total && (
            <p className="mb-6 text-[14px] text-ink-soft">
              Сумма:{" "}
              <span className="text-ink">
                {Number(total).toLocaleString("ru-RU")} ₽
              </span>
            </p>
          )}
          <p className="mx-auto mb-8 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-soft">
            Сохраните ссылку на заказ — там будет статус, оплата и фото букета
            перед отправкой. Мы также свяжемся по телефону. Вопросы:{" "}
            <a href={site.phoneHref} className="text-lavender-deep hover:underline">
              {site.phone}
            </a>
            .
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {track && (
              <Link
                href={track}
                className="inline-block rounded-full bg-lavender px-6 py-3 text-[13.5px] font-semibold text-white hover:bg-lavender-deep"
              >
                Открыть заказ
              </Link>
            )}
            <Link
              href="/catalog"
              className="inline-block rounded-full border border-line px-6 py-3 text-[13.5px] font-semibold hover:bg-surface"
            >
              В каталог
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
