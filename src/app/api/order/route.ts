import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/products";

type OrderLine = { slug: string; qty: number };

type OrderPayload = {
  lines: OrderLine[];
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

  const items = body.lines
    .map((l) => {
      const product = getProductBySlug(l.slug);
      return product ? { name: product.name, price: product.price, qty: l.qty } : null;
    })
    .filter((x): x is { name: string; price: number; qty: number } => x !== null);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const orderId = `STEM-${Date.now().toString(36).toUpperCase()}`;

  const summary = [
    `Новый заказ ${orderId}`,
    ...items.map((i) => `• ${i.name} × ${i.qty} — ${i.price * i.qty} ₽`),
    `Итого: ${total} ₽`,
    `Клиент: ${body.name}, ${body.phone}`,
    `Адрес: ${body.address}`,
    `Время доставки: ${body.deliveryTime || "не указано"}`,
    `Открытка: ${body.card || "без открытки"}`,
    `Оплата: ${body.payment}`,
  ].join("\n");

  // Forward the order to a Telegram chat when configured. Until TELEGRAM_BOT_TOKEN
  // and TELEGRAM_CHAT_ID are set in the project's environment variables, orders
  // are simply logged — wire up a real bot token to start receiving them live.
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (botToken && chatId) {
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: summary }),
      });
    } catch {
      // Delivery to Telegram failing shouldn't block order confirmation.
    }
  } else {
    console.log(summary);
  }

  return NextResponse.json({ orderId, total });
}
