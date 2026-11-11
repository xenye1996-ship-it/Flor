"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { usePublicData } from "@/lib/public-data";
import { reachGoal, YM_GOALS } from "@/lib/metrika";

type Payment = "card" | "sbp" | "cash";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, total, clear } = useCart();
  const { products } = usePublicData();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [card, setCard] = useState("");
  const [payment, setPayment] = useState<Payment>("sbp");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError("Нужно согласие на обработку персональных данных, чтобы оформить заказ");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          name,
          phone,
          address,
          deliveryTime,
          card,
          payment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не получилось оформить заказ. Попробуйте ещё раз.");
        setSubmitting(false);
        return;
      }
      clear();
      reachGoal(YM_GOALS.orderCreated, {
        order_id: data.orderId,
        total: data.total,
      });
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl as string;
        return;
      }
      const track =
        (data.trackUrl as string) ||
        `/order/${encodeURIComponent(data.orderId)}?t=${encodeURIComponent(data.token)}`;
      router.push(
        `/checkout/success?order=${encodeURIComponent(data.orderId)}&total=${data.total}&track=${encodeURIComponent(track)}`,
      );
    } catch {
      setError("Не получилось связаться с сервером. Проверьте связь и попробуйте снова.");
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <section className="mx-auto max-w-2xl px-5 py-24 text-center">
            <p className="mb-4 font-display text-[20px] text-ink">
              В корзине пока пусто
            </p>
            <p className="mb-6 text-[14px] text-ink-soft">
              Добавьте букет из каталога, чтобы оформить заказ.
            </p>
            <Link
              href="/catalog"
              className="inline-block rounded-full bg-lavender px-6 py-3 text-[13.5px] font-semibold text-white hover:bg-lavender-deep"
            >
              Перейти в каталог
            </Link>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-5 pb-20 pt-12">
          <h1 className="mb-8 text-[28px] text-plum">Оформление заказа</h1>

          <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-8">
              {/* Step 1 */}
              <fieldset className="rounded-2xl border border-line bg-surface p-5">
                <legend className="flex items-center gap-2 px-1 font-display text-[16px] text-ink">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-[12px] text-plum">
                    1
                  </span>
                  Получатель и адрес
                </legend>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                    className="rounded-lg border border-line bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-lavender"
                  />
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Телефон"
                    type="tel"
                    className="rounded-lg border border-line bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-lavender"
                  />
                  <input
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Адрес доставки, Череповец"
                    className="rounded-lg border border-line bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-lavender sm:col-span-2"
                  />
                  <select
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="rounded-lg border border-line bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-lavender sm:col-span-2"
                  >
                    <option value="">Как можно скорее</option>
                    <option value="12:00–14:00">Сегодня, 12:00–14:00</option>
                    <option value="14:00–16:00">Сегодня, 14:00–16:00</option>
                    <option value="16:00–18:00">Сегодня, 16:00–18:00</option>
                    <option value="18:00–20:00">Сегодня, 18:00–20:00</option>
                    <option value="завтра">Завтра, в течение дня</option>
                  </select>
                </div>
              </fieldset>

              {/* Step 2 */}
              <fieldset className="rounded-2xl border border-line bg-surface p-5">
                <legend className="flex items-center gap-2 px-1 font-display text-[16px] text-ink">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-[12px] text-plum">
                    2
                  </span>
                  Открытка
                </legend>
                <textarea
                  value={card}
                  onChange={(e) => setCard(e.target.value)}
                  placeholder="Текст пожелания (необязательно) — впишем от руки"
                  rows={3}
                  className="mt-4 w-full resize-none rounded-lg border border-line bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-lavender"
                />
              </fieldset>

              {/* Step 3 */}
              <fieldset className="rounded-2xl border border-line bg-surface p-5">
                <legend className="flex items-center gap-2 px-1 font-display text-[16px] text-ink">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-[12px] text-plum">
                    3
                  </span>
                  Оплата
                </legend>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {(
                    [
                      { id: "sbp", label: "СБП по QR" },
                      { id: "card", label: "Картой онлайн" },
                      { id: "cash", label: "Наличными курьеру" },
                    ] as const
                  ).map((opt) => (
                    <label
                      key={opt.id}
                      className={`cursor-pointer rounded-lg border px-3.5 py-2.5 text-center text-[13.5px] transition-colors ${
                        payment === opt.id
                          ? "border-lavender bg-lavender text-white"
                          : "border-line text-ink-soft hover:bg-surface-2"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.id}
                        checked={payment === opt.id}
                        onChange={() => setPayment(opt.id)}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Step 4 / Summary */}
            <div className="h-fit rounded-2xl border border-line bg-surface p-6">
              <p className="mb-4 flex items-center gap-2 font-display text-[16px] text-ink">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-[12px] text-plum">
                  4
                </span>
                Подтверждение
              </p>
              <div className="mb-4 flex flex-col gap-2 border-b border-line pb-4 text-[13px] text-ink-soft">
                {lines.map((l) => {
                  const p = products.find((x) => x.slug === l.slug);
                  if (!p) return null;
                  return (
                    <div key={l.slug} className="flex justify-between gap-2">
                      <span className="truncate">
                        {p.name} × {l.qty}
                      </span>
                      <span className="shrink-0 tabular-nums">
                        {(p.price * l.qty).toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mb-5 flex items-center justify-between text-[16px] font-semibold text-ink">
                <span>Итого</span>
                <span className="tabular-nums text-plum">
                  {total.toLocaleString("ru-RU")} ₽
                </span>
              </div>
              <label className="mb-4 flex items-start gap-2.5 text-[12.5px] leading-snug text-ink-soft">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-lavender"
                />
                <span>
                  Согласен(на) на обработку персональных данных в
                  соответствии с{" "}
                  <Link href="/privacy" className="text-lavender-deep hover:underline">
                    политикой конфиденциальности
                  </Link>
                </span>
              </label>
              {error && (
                <p className="mb-3 rounded-lg bg-surface-2 px-3 py-2 text-[12.5px] text-lavender-deep">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-lavender px-6 py-3.5 text-[14.5px] font-semibold text-white transition-colors hover:bg-lavender-deep disabled:opacity-60"
              >
                {submitting ? "Отправляем…" : "Подтвердить заказ"}
              </button>
              <p className="mt-3 text-center text-[12px] text-ink-soft">
                Свяжемся для подтверждения в течение 15 минут
              </p>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
