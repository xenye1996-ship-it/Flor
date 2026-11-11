import { NextResponse } from "next/server";
import {
  listOrdersByPhone,
  normalizePhone,
} from "@/lib/orders/store";
import { ORDER_STATUS_LABELS } from "@/lib/orders/types";

export async function POST(request: Request) {
  let body: { phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const phone = (body.phone || "").trim();
  if (normalizePhone(phone).length < 10) {
    return NextResponse.json(
      { error: "Введите телефон полностью, например +7 911 544-03-50" },
      { status: 400 },
    );
  }

  const orders = await listOrdersByPhone(phone);

  return NextResponse.json({
    phone: normalizePhone(phone),
    orders: orders.map((o) => ({
      id: o.id,
      token: o.token,
      status: o.status,
      statusLabel: ORDER_STATUS_LABELS[o.status],
      createdAt: o.createdAt,
      total: o.total,
      lines: o.lines,
      paymentStatus: o.payment.status,
      paymentUrl: o.payment.paymentUrl,
      hasPhoto: Boolean(o.photo?.url),
      photoDecision: o.photo?.decision ?? null,
      trackUrl: `/order/${o.id}?t=${o.token}`,
    })),
  });
}
