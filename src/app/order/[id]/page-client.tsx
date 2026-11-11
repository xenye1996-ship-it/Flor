"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { reachGoal, YM_GOALS } from "@/lib/metrika";

type OrderView = {
  id: string;
  status: string;
  statusLabel: string;
  total: number;
  lines: { name: string; price: number; qty: number }[];
  customer: { name: string; deliveryTime: string; address: string };
  payment: { method: string; status: string; paymentUrl?: string };
  photo: {
    url: string;
    decision?: "approved" | "revision";
    customerComment?: string;
  } | null;
};

export default function OrderTrackPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const token = search.get("t") || "";
  const paidFlag = search.get("paid");

  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!params.id || !token) {
      setError("Ссылка неполная. Откройте её из сообщения о заказе.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/order/${params.id}?t=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Заказ не найден");
        setOrder(null);
      } else {
        setOrder(data);
        setError(null);
      }
    } catch {
      setError("Не удалось загрузить заказ");
    } finally {
      setLoading(false);
    }
  }, [params.id, token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (paidFlag === "1") {
      reachGoal(YM_GOALS.paymentSuccess, { order_id: params.id });
    }
  }, [paidFlag, params.id]);

  async function decide(decision: "approved" | "revision") {
    if (!order) return;
    setSending(true);
    setDoneMsg(null);
    try {
      const res = await fetch(
        `/api/order/${order.id}?t=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision, comment }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не получилось отправить ответ");
      } else {
        reachGoal(
          decision === "approved"
            ? YM_GOALS.photoApproved
            : YM_GOALS.photoRevision,
          { order_id: order.id },
        );
        setDoneMsg(
          decision === "approved"
            ? "Спасибо! Букет подтверждён, собираем к доставке."
            : "Передали флористу ваши пожелания.",
        );
        await load();
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setSending(false);
    }
  }

  const canReviewPhoto =
    Boolean(order?.photo?.url) &&
    !order?.photo?.decision &&
    order?.status === "photo_pending";

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-5 pb-20 pt-12">
          <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-lavender-deep">
            Ваш заказ
          </p>
          <h1 className="mb-6 text-[28px] text-plum">
            {order ? order.id : "Статус заказа"}
          </h1>

          {paidFlag === "1" && (
            <p className="mb-4 rounded-xl bg-sage/20 px-4 py-3 text-[13.5px]">
              Оплата прошла успешно. Статус обновится в течение минуты.
            </p>
          )}
          {paidFlag === "0" && (
            <p className="mb-4 rounded-xl bg-pink/40 px-4 py-3 text-[13.5px] text-plum">
              Оплата не завершена. Можно попробовать снова по ссылке ниже.
            </p>
          )}

          {loading && <p className="text-ink-soft">Загрузка…</p>}
          {error && (
            <p className="rounded-xl bg-pink/40 px-4 py-3 text-[13.5px] text-plum">
              {error}
            </p>
          )}
          {doneMsg && (
            <p className="mb-4 rounded-xl bg-sage/20 px-4 py-3 text-[13.5px]">
              {doneMsg}
            </p>
          )}

          {order && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-line bg-surface p-5">
                <p className="mb-1 text-[12px] text-ink-soft">Статус</p>
                <p className="font-display text-[20px] text-plum">
                  {order.statusLabel}
                </p>
                {order.status === "photo_pending" && (
                  <p className="mt-2 text-[13.5px] text-ink-soft">
                    Ждём ваше решение по фото букета перед отправкой.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-line bg-surface p-5">
                <p className="mb-3 text-[13px] font-semibold text-ink">Состав</p>
                <ul className="mb-4 space-y-1.5 text-[13.5px] text-ink-soft">
                  {order.lines.map((l) => (
                    <li key={l.name} className="flex justify-between gap-3">
                      <span>
                        {l.name} × {l.qty}
                      </span>
                      <span className="tabular-nums">
                        {(l.price * l.qty).toLocaleString("ru-RU")} ₽
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between border-t border-line pt-3 text-[15px] font-semibold">
                  <span>Итого</span>
                  <span className="text-plum">
                    {order.total.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <p className="mt-3 text-[12.5px] text-ink-soft">
                  Доставка: {order.customer.address}
                  {order.customer.deliveryTime
                    ? ` · ${order.customer.deliveryTime}`
                    : ""}
                </p>
              </div>

              {order.payment.status === "pending" && order.payment.paymentUrl && (
                <a
                  href={order.payment.paymentUrl}
                  className="block rounded-full bg-lavender px-6 py-3.5 text-center text-[14.5px] font-semibold text-white hover:bg-lavender-deep"
                >
                  Оплатить онлайн
                </a>
              )}

              {order.photo?.url && (
                <div className="rounded-2xl border border-line bg-surface p-5">
                  <p className="mb-3 text-[13px] font-semibold text-ink">
                    Фото перед отправкой
                  </p>
                  <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-xl bg-surface-2">
                    <Image
                      src={order.photo.url}
                      alt="Фото букета"
                      fill
                      className="object-cover"
                      sizes="560px"
                    />
                  </div>
                  {order.photo.decision === "approved" && (
                    <p className="text-[13.5px] text-ink-soft">
                      Вы подтвердили это фото.
                    </p>
                  )}
                  {order.photo.decision === "revision" && (
                    <p className="text-[13.5px] text-ink-soft">
                      Запрос на правки отправлен
                      {order.photo.customerComment
                        ? `: «${order.photo.customerComment}»`
                        : "."}
                    </p>
                  )}
                  {canReviewPhoto && (
                    <div className="space-y-3">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        placeholder="Если нужно что-то поправить — напишите здесь"
                        className="w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-[13.5px] outline-none focus:border-lavender"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={sending}
                          onClick={() => decide("approved")}
                          className="rounded-full bg-plum px-5 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-60"
                        >
                          Всё ок, отправляйте
                        </button>
                        <button
                          type="button"
                          disabled={sending}
                          onClick={() => decide("revision")}
                          className="rounded-full border border-line px-5 py-2.5 text-[13.5px] font-semibold disabled:opacity-60"
                        >
                          Попросить правки
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!order.photo && order.status !== "cancelled" && (
                <p className="text-[13.5px] text-ink-soft">
                  Когда букет будет собран, здесь появится фото — вы сможете
                  подтвердить его или попросить правки до выезда курьера.
                </p>
              )}

              <Link
                href="/catalog"
                className="inline-block text-[13.5px] font-semibold text-lavender-deep hover:underline"
              >
                ← В каталог
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
