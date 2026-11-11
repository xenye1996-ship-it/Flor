import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/content/store";
import { notifyOrderChannels } from "@/lib/notify/order";
import {
  createOrder,
  createOrderToken,
} from "@/lib/orders/store";
import type { OrderStatus } from "@/lib/orders/types";
import {
  isTbankConfigured,
  publicSiteOrigin,
  tbankInit,
} from "@/lib/payments/tbank";

type OrderLineIn = { slug: string; qty: number };

type OrderPayload = {
  lines: OrderLineIn[];
  name: string;
  phone: string;
  address: string;
  deliveryTime: string;
  card: string;
  payment: "card" | "cash" | "sbp";
};

export async function POST(request: Request) {
  let body: OrderPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  if (!body.name?.trim() || !body.phone?.trim() || !body.address?.trim()) {
    return NextResponse.json(
      { error: "Заполните имя, телефон и адрес доставки" },
      { status: 400 },
    );
  }
  if (!body.lines?.length) {
    return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
  }

  const items = (
    await Promise.all(
      body.lines.map(async (l) => {
        const product = await getProductBySlug(l.slug);
        return product
          ? {
              slug: product.slug,
              name: product.name,
              price: product.price,
              qty: l.qty,
            }
          : null;
      }),
    )
  ).filter(
    (x): x is { slug: string; name: string; price: number; qty: number } =>
      x !== null,
  );

  if (!items.length) {
    return NextResponse.json({ error: "Товары не найдены" }, { status: 400 });
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const orderId = `STEM-${Date.now().toString(36).toUpperCase()}`;
  const token = createOrderToken();
  const wantOnline =
    (body.payment === "card" || body.payment === "sbp") && isTbankConfigured();

  const status: OrderStatus = wantOnline ? "awaiting_payment" : "new";

  let paymentUrl: string | undefined;
  let paymentId: string | undefined;

  if (wantOnline) {
    const origin = publicSiteOrigin();
    const init = await tbankInit({
      orderId,
      amountRub: total,
      description: `Заказ ${orderId} — STEM`,
      successUrl: `${origin}/order/${orderId}?t=${token}&paid=1`,
      failUrl: `${origin}/order/${orderId}?t=${token}&paid=0`,
      notificationUrl: `${origin}/api/payments/tbank/notify`,
      customerPhone: body.phone,
    });
    if (!init.Success || !init.PaymentURL) {
      return NextResponse.json(
        {
          error:
            init.Message ||
            init.Details ||
            "Не удалось создать платёж. Попробуйте другой способ оплаты.",
        },
        { status: 502 },
      );
    }
    paymentUrl = init.PaymentURL;
    paymentId = String(init.PaymentId ?? "");
  }

  const order = await createOrder({
    id: orderId,
    token,
    status,
    customer: {
      name: body.name.trim(),
      phone: body.phone.trim(),
      address: body.address.trim(),
      deliveryTime: body.deliveryTime || "",
      card: body.card || "",
    },
    lines: items,
    total,
    payment: {
      method: body.payment,
      provider: wantOnline ? "tbank" : "manual",
      paymentId,
      paymentUrl,
      status: wantOnline ? "pending" : "pending",
    },
    historyNote: wantOnline
      ? "Заказ создан, ожидаем оплату"
      : "Заказ создан как заявка",
  });

  const summary = [
    `Новый заказ ${order.id}`,
    ...order.lines.map(
      (i) => `• ${i.name} × ${i.qty} — ${i.price * i.qty} ₽`,
    ),
    `Итого: ${order.total} ₽`,
    `Клиент: ${order.customer.name}, ${order.customer.phone}`,
    `Адрес: ${order.customer.address}`,
    `Время доставки: ${order.customer.deliveryTime || "не указано"}`,
    `Открытка: ${order.customer.card || "без открытки"}`,
    `Оплата: ${order.payment.method}${wantOnline ? " (онлайн Т‑Банк)" : ""}`,
    `Ссылка клиента: ${publicSiteOrigin()}/order/${order.id}?t=${order.token}`,
  ].join("\n");

  await notifyOrderChannels({
    orderId: order.id,
    total: order.total,
    summary,
  });

  return NextResponse.json({
    orderId: order.id,
    total: order.total,
    token: order.token,
    status: order.status,
    paymentUrl,
    trackUrl: `/order/${order.id}?t=${order.token}`,
  });
}
