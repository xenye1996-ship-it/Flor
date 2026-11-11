import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { appendAudit } from "@/lib/content/store";
import { listOrders, getOrderById, patchOrder } from "@/lib/orders/store";
import type { OrderStatus } from "@/lib/orders/types";
import { ORDER_STATUS_LABELS } from "@/lib/orders/types";
import { revalidatePath } from "next/cache";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await listOrders();
  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    id: string;
    status?: OrderStatus;
    note?: string;
    photoUrl?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const order = await getOrderById(body.id);
  if (!order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  if (body.photoUrl) {
    const now = new Date().toISOString();
    const updated = await patchOrder(
      order.id,
      {
        status: "photo_pending",
        photo: {
          url: body.photoUrl,
          uploadedAt: now,
          decision: undefined,
          customerComment: undefined,
          reviewedAt: undefined,
        },
      },
      {
        at: now,
        status: "photo_pending",
        actor: session.login,
        note: "Загружено фото перед отправкой",
      },
    );
    await appendAudit({
      actor: session.login,
      action: "order_photo",
      details: `Фото к заказу ${order.id}`,
    });
    revalidatePath("/admin");
    return NextResponse.json({ order: updated });
  }

  if (body.status) {
    if (!(body.status in ORDER_STATUS_LABELS)) {
      return NextResponse.json({ error: "Неизвестный статус" }, { status: 400 });
    }
    const now = new Date().toISOString();
    const updated = await patchOrder(
      order.id,
      { status: body.status },
      {
        at: now,
        status: body.status,
        actor: session.login,
        note: body.note || `Статус: ${ORDER_STATUS_LABELS[body.status]}`,
      },
    );
    await appendAudit({
      actor: session.login,
      action: "order_status",
      details: `${order.id} → ${ORDER_STATUS_LABELS[body.status]}`,
    });
    revalidatePath("/admin");
    return NextResponse.json({ order: updated });
  }

  return NextResponse.json({ error: "Нечего обновлять" }, { status: 400 });
}
