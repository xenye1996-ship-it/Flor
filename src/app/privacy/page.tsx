import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSite } from "@/lib/content/store";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: `Политика конфиденциальности — ${site.name}`,
    robots: { index: false },
  };
}

export default async function PrivacyPage() {
  const site = await getSite();
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-5 pb-20 pt-14">
          <h1 className="mb-2 text-[28px] text-plum">
            Политика конфиденциальности
          </h1>
          <p className="mb-10 text-[13px] text-ink-soft">
            Действует в отношении сайта {site.name}, {site.city}
          </p>

          <div className="flex flex-col gap-6 text-[14px] leading-relaxed text-ink-soft">
            <div>
              <p className="mb-1.5 font-display text-[16px] text-ink">
                1. Кто обрабатывает данные
              </p>
              <p>
                Оператором персональных данных является {site.name}
                {" "}({site.city}, {site.address}, {site.phone}). Настоящая
                политика определяет порядок обработки персональных данных
                посетителей и покупателей сайта в соответствии с
                Федеральным законом № 152-ФЗ «О персональных данных».
              </p>
            </div>

            <div>
              <p className="mb-1.5 font-display text-[16px] text-ink">
                2. Какие данные собираются
              </p>
              <p>
                При оформлении заказа мы получаем: имя, номер телефона,
                адрес доставки, а при необходимости — текст открытки к
                букету. При использовании формы обратной связи или заказа
                обратного звонка — имя и телефон.
              </p>
            </div>

            <div>
              <p className="mb-1.5 font-display text-[16px] text-ink">
                3. Зачем нужны данные
              </p>
              <p>
                Данные используются исключительно для оформления и
                доставки заказа: связи с покупателем, подтверждения деталей
                заказа, передачи адреса курьеру. Данные не передаются
                третьим лицам, кроме случаев, необходимых для доставки
                (например, курьерской службе).
              </p>
            </div>

            <div>
              <p className="mb-1.5 font-display text-[16px] text-ink">
                4. Хранение и защита
              </p>
              <p>
                Данные хранятся столько, сколько необходимо для исполнения
                заказа и последующей отчётности, и защищены от
                несанкционированного доступа организационными и
                техническими средствами.
              </p>
            </div>

            <div>
              <p className="mb-1.5 font-display text-[16px] text-ink">
                5. Файлы cookie
              </p>
              <p>
                Сайт использует технически необходимые cookie для работы
                корзины покупок — они хранят состав корзины в вашем
                браузере и не передаются на сервер до оформления заказа.
              </p>
            </div>

            <div>
              <p className="mb-1.5 font-display text-[16px] text-ink">
                6. Ваши права
              </p>
              <p>
                Вы можете в любой момент запросить удаление или уточнение
                своих данных, позвонив по номеру {site.phone}.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
