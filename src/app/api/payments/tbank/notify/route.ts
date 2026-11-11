import { NextResponse } from "next/server";
import { getOrderById, patchOrder } from "@/lib/orders/store";
import { verifyTbankNotification } from "@/lib/payments/tbank";
import { notifyOrderChannels } from "@/lib/notify/order";
import { publicSiteOrigin } from "@/lib/payments/tbank";

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }

  if (!verifyTbankNotification(payload)) {
    return new NextResponse("Invalid token", { status: 403 });
  }

  const orderId = String(payload.OrderId || "");
  const status = String(payload.Status || "");
  const success = String(payload.Success) === "true" || payload.Success === true;

  const order = await getOrderById(orderId);
  if (!order) {
    return new NextResponse("OK");
  }

  if (success && (status === "CONFIRMED" || status === "AUTHORIZED")) {
    if (order.payment.status !== "paid") {
      const updated = await patchOrder(
        orderId,
        {
          status: "paid",
          payment: {
            ...order.payment,
            status: "paid",
            paidAt: new Date().toISOString(),
            paymentId: String(payload.PaymentId || order.payment.paymentId || ""),
          },
        },
        {
          at: new Date().toISOString(),
          status: "paid",
          actor: "tbank",
          note: "Оплата подтверждена Т‑Банком",
        },
      );
      if (updated) {
        await notifyOrderChannels({
          orderId,
          total: updated.total,
          summary: `Оплачен заказ ${orderId} на ${updated.total} ₽\n${publicSiteOrigin()}/admin`,
        });
      }
    }
  }

  // Т‑Банк ждёт тело "OK"
  return new NextResponse("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
