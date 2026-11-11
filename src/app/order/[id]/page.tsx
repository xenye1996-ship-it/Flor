import { Suspense } from "react";
import OrderTrackClient from "./page-client";

export default function OrderTrackPage() {
  return (
    <Suspense fallback={<p className="p-8 text-ink-soft">Загрузка заказа…</p>}>
      <OrderTrackClient />
    </Suspense>
  );
}
