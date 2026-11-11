"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { usePublicData } from "@/lib/public-data";

type AccountOrder = {
  id: string;
  token: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  total: number;
  lines: { slug: string; name: string; price: number; qty: number }[];
  paymentStatus: string;
  paymentUrl?: string;
  hasPhoto: boolean;
  photoDecision: "approved" | "revision" | null;
  trackUrl: string;
};

const PHONE_KEY = "stem-account-phone";

export default function AccountClient() {
  const router = useRouter();
  const { add, clear } = useCart();
  const { site } = usePublicData();

  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<AccountOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const lookup = useCallback(async (value: string) => {
    setLoading(true);
    setError(null);
    setHint(null);
    try {
      const res = await fetch("/api/account/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOrders(null);
        setError(data.error || "Не удалось найти заказы");
        return;
      }
      setOrders(data.orders);
      try {
        localStorage.setItem(PHONE_KEY, value);
      } catch {
        /* ignore */
      }
      if (!data.orders.length) {
        setHint("По этому номеру заказов пока нет.");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PHONE_KEY);
      if (saved) {
        setPhone(saved);
        void lookup(saved);
      }
    } catch {
      /* ignore */
    }
  }, [lookup]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void lookup(phone);
  }

  function reorder(order: AccountOrder) {
    clear();
    for (const line of order.lines) {
      add(line.slug, line.qty);
    }
    setHint(`Товары из ${order.id} добавлены в корзину`);
    router.push("/cart");
  }

  function logout() {
    setOrders(null);
    setPhone("");
    setHint(null);
    try {
      localStorage.removeItem(PHONE_KEY);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-5 pb-20 pt-12">
          <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-lavender-deep">
            Личный кабинет
          </p>
          <h1 className="mb-3 text-[28px] text-plum">Мои заказы</h1>
          <p className="mb-8 max-w-[48ch] text-[14.5px] text-ink-soft">
            Заказы по номеру, который указывали при оформлении. Войти заново —{" "}
            <Link href="/login" className="font-semibold text-lavender-deep hover:underline">
              на странице входа
            </Link>
            .
          </p>

          <form
            onSubmit={onSubmit}
            className="mb-8 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-end"
          >
            <label className="block flex-1 text-[12px] text-ink-soft">
              Телефон
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 911 000-00-00"
                className="mt-1.5 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-[14px] text-ink outline-none focus:border-lavender"
                autoComplete="tel"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-lavender px-6 py-3 text-[13.5px] font-semibold text-white hover:bg-lavender-deep disabled:opacity-60"
            >
              {loading ? "Ищем…" : "Найти заказы"}
            </button>
            {orders && (
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-line px-5 py-3 text-[13px] hover:bg-bg"
              >
                Сменить номер
              </button>
            )}
          </form>

          {error && (
            <p className="mb-4 rounded-xl bg-pink/40 px-4 py-3 text-[13.5px] text-plum">
              {error}
            </p>
          )}
          {hint && (
            <p className="mb-4 rounded-xl bg-sage/20 px-4 py-3 text-[13.5px]">
              {hint}
            </p>
          )}

          {orders && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((o) => (
                <article
                  key={o.id}
                  className="rounded-2xl border border-line bg-surface p-5"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-[17px] text-plum">{o.id}</p>
                      <p className="text-[12.5px] text-ink-soft">
                        {new Date(o.createdAt).toLocaleString("ru-RU")} ·{" "}
                        {o.statusLabel}
                      </p>
                    </div>
                    <p className="text-[15px] font-semibold tabular-nums text-plum">
                      {o.total.toLocaleString("ru-RU")} ₽
                    </p>
                  </div>

                  <ul className="mb-4 space-y-1 text-[13px] text-ink-soft">
                    {o.lines.map((l) => (
                      <li key={l.slug}>
                        {l.name} × {l.qty}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={o.trackUrl}
                      className="rounded-full bg-plum px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90"
                    >
                      {o.hasPhoto && !o.photoDecision
                        ? "Открыть фото"
                        : "Статус заказа"}
                    </Link>
                    {o.paymentStatus === "pending" && o.paymentUrl && (
                      <a
                        href={o.paymentUrl}
                        className="rounded-full bg-lavender px-4 py-2 text-[13px] font-semibold text-white hover:bg-lavender-deep"
                      >
                        Оплатить
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => reorder(o)}
                      className="rounded-full border border-line px-4 py-2 text-[13px] hover:bg-bg"
                    >
                      Повторить заказ
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-12 rounded-2xl border border-line bg-surface p-5">
            <p className="mb-2 font-display text-[16px] text-plum">Связаться</p>
            <p className="text-[13.5px] text-ink-soft">
              {site.city}, {site.address}
            </p>
            <a
              href={site.phoneHref}
              className="mt-2 inline-block text-[14px] font-semibold text-lavender-deep hover:underline"
            >
              {site.phone}
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
