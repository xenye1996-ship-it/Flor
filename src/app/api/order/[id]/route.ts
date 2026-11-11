import { NextResponse } from "next/server";
import { getOrderByIdAndToken, patchOrder } from "@/lib/orders/store";
import { ORDER_STATUS_LABELS } from "@/lib/orders/types";
import { notifyOrderChannels } from "@/lib/notify/order";
import { publicSiteOrigin } from "@/lib/payments/tbank";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("t") || "";
  const order = await getOrderByIdAndToken(id, token);
  if (!order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    status: order.status,
    statusLabel: ORDER_STATUS_LABELS[order.status],
    createdAt: order.createdAt,
    total: order.total,
    lines: order.lines,
    customer: {
      name: order.customer.name,
      deliveryTime: order.customer.deliveryTime,
      address: order.customer.address,
    },
    payment: {
      method: order.payment.method,
      status: order.payment.status,
      paymentUrl: order.payment.paymentUrl,
    },
    photo: order.photo
      ? {
          url: order.photo.url,
          decision: order.photo.decision,
          customerComment: order.photo.customerComment,
        }
      : null,
  });
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("t") || "";
  const order = await getOrderByIdAndToken(id, token);
  if (!order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  let body: { decision: "approved" | "revision"; comment?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  if (!order.photo?.url) {
    return NextResponse.json(
      { error: "Фото ещё не загружено" },
      { status: 400 },
    );
  }
  if (body.decision !== "approved" && body.decision !== "revision") {
    return NextResponse.json({ error: "Некорректное решение" }, { status: 400 });
  }
  if (body.decision === "revision" && !body.comment?.trim()) {
    return NextResponse.json(
      { error: "Напишите, что поправить в букете" },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const nextStatus =
    body.decision === "approved" ? "photo_approved" : "photo_revision";

  const updated = await patchOrder(
    order.id,
    {
      status: nextStatus,
      photo: {
        ...order.photo,
        decision: body.decision,
        customerComment: body.comment?.trim() || "",
        reviewedAt: now,
      },
    },
    {
      at: now,
      status: nextStatus,
      actor: "customer",
      note:
        body.decision === "approved"
          ? "Клиент подтвердил фото"
          : `Клиент просит правки: ${body.comment?.trim()}`,
    },
  );

  await notifyOrderChannels({
    orderId: order.id,
    total: order.total,
    summary:
      body.decision === "approved"
        ? `Клиент подтвердил фото по заказу ${order.id}`
        : `Правки по фото ${order.id}: ${body.comment?.trim()}\n${publicSiteOrigin()}/admin`,
  });

  return NextResponse.json({
    ok: true,
    status: updated?.status,
    statusLabel: updated ? ORDER_STATUS_LABELS[updated.status] : "",
  });
}
