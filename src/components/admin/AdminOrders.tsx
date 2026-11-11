"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/lib/orders/types";
import { ORDER_STATUS_LABELS } from "@/lib/orders/types";

const STATUS_OPTIONS = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [maxInfo, setMaxInfo] = useState<string>("");
  const [maxBusy, setMaxBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось загрузить заказы");
        return;
      }
      setOrders(data.orders || []);
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    void (async () => {
      try {
        const res = await fetch("/api/admin/max/capture");
        const data = await res.json();
        if (res.ok) {
          const u = data.config?.maxUserId;
          const c = data.config?.maxChatId;
          setMaxInfo(
            u || c
              ? `MAX: получатель ${u || c}`
              : "MAX: получатель ещё не привязан",
          );
        }
      } catch {
        /* ignore */
      }
    })();
  }, [load]);

  async function captureMax() {
    setMaxBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/max/capture", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось получить ID из Max");
        return;
      }
      setMessage(
        `Max подключён${data.pingOk ? " (тестовое сообщение отправлено)" : ""}: user=${data.config.maxUserId || "—"} chat=${data.config.maxChatId || "—"}`,
      );
      setMaxInfo(`MAX: получатель ${data.config.maxUserId || data.config.maxChatId}`);
    } catch {
      setError("Ошибка сети при запросе к Max");
    } finally {
      setMaxBusy(false);
    }
  }

  async function setStatus(id: string, status: OrderStatus) {
    setBusyId(id);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось обновить статус");
        return;
      }
      setMessage(`Статус обновлён: ${ORDER_STATUS_LABELS[status]}`);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function uploadPhoto(id: string, file: File) {
    setBusyId(id);
    setMessage(null);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const up = await fetch("/api/admin/upload", { method: "POST", body: form });
      const upData = await up.json();
      if (!up.ok) {
        setError(upData.error || "Ошибка загрузки фото");
        return;
      }
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, photoUrl: upData.url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось привязать фото");
        return;
      }
      setMessage("Фото отправлено клиенту на подтверждение");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-ink-soft">Загрузка заказов…</p>;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-ink-soft">{orders.length} заказ(ов)</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={load}
            className="rounded-full border border-line px-4 py-2 text-[13px] hover:bg-surface"
          >
            Обновить
          </button>
          <button
            type="button"
            disabled={maxBusy}
            onClick={captureMax}
            className="rounded-full bg-lavender px-4 py-2 text-[13px] font-semibold text-white hover:bg-lavender-deep disabled:opacity-60"
          >
            {maxBusy ? "Ждём Max…" : "Привязать Max"}
          </button>
        </div>
      </div>
      {maxInfo && (
        <p className="text-[12.5px] text-ink-soft">
          {maxInfo}. Автоматически: напишите боту{" "}
          <span className="text-ink">@id351801137464_bot</span> в Max
          (или «подключить» для смены получателя). Кнопка — запасной вариант.
        </p>
      )}

      {(message || error) && (
        <p
          className={`rounded-xl px-4 py-3 text-[13px] ${
            error ? "bg-pink/40 text-plum" : "bg-sage/20 text-ink"
          }`}
        >
          {error || message}
        </p>
      )}

      {orders.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center text-ink-soft">
          Заказов пока нет — появятся после оформления на сайте.
        </p>
      )}

      {orders.map((o) => {
        const track = `/order/${o.id}?t=${o.token}`;
        return (
          <article
            key={o.id}
            className="space-y-3 rounded-2xl border border-line bg-surface p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-[18px] text-plum">{o.id}</h2>
                <p className="text-[12.5px] text-ink-soft">
                  {new Date(o.createdAt).toLocaleString("ru-RU")} ·{" "}
                  {ORDER_STATUS_LABELS[o.status]}
                </p>
              </div>
              <p className="text-[16px] font-semibold text-plum tabular-nums">
                {o.total.toLocaleString("ru-RU")} ₽
              </p>
            </div>

            <p className="text-[13.5px]">
              {o.customer.name}, {o.customer.phone}
              <br />
              <span className="text-ink-soft">
                {o.customer.address}
                {o.customer.deliveryTime ? ` · ${o.customer.deliveryTime}` : ""}
              </span>
            </p>

            <ul className="text-[13px] text-ink-soft">
              {o.lines.map((l) => (
                <li key={l.slug}>
                  {l.name} × {l.qty} — {(l.price * l.qty).toLocaleString("ru-RU")} ₽
                </li>
              ))}
            </ul>

            <p className="text-[12.5px] text-ink-soft">
              Оплата: {o.payment.method} / {o.payment.status}
              {o.payment.provider === "tbank" ? " · Т‑Банк" : ""}
            </p>

            {o.photo?.url && (
              <div className="flex flex-wrap items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={o.photo.url}
                  alt="Фото заказа"
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div className="text-[12.5px] text-ink-soft">
                  {o.photo.decision === "approved" && "Клиент подтвердил"}
                  {o.photo.decision === "revision" && (
                    <>
                      Правки: {o.photo.customerComment || "без комментария"}
                    </>
                  )}
                  {!o.photo.decision && "Ожидаем ответ клиента"}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={o.status}
                disabled={busyId === o.id}
                onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                className="rounded-lg border border-line bg-bg px-3 py-2 text-[13px]"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>

              <label className="cursor-pointer rounded-full border border-line px-4 py-2 text-[13px] hover:bg-bg">
                {busyId === o.id ? "…" : "Загрузить фото клиенту"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={busyId === o.id}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadPhoto(o.id, file);
                    e.target.value = "";
                  }}
                />
              </label>

              <a
                href={track}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-line px-4 py-2 text-[13px] hover:bg-bg"
              >
                Ссылка клиента
              </a>
            </div>
          </article>
        );
      })}
    </section>
  );
}
