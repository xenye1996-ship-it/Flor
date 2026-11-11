export const YM_GOALS = {
  cartOpen: "cart_open",
  orderCreated: "order_created",
  paymentSuccess: "payment_success",
  photoApproved: "photo_approved",
  photoRevision: "photo_revision",
} as const;

export type YmGoal = (typeof YM_GOALS)[keyof typeof YM_GOALS];

declare global {
  interface Window {
    ym?: (
      id: number,
      method: string,
      ...args: unknown[]
    ) => void;
  }
}

export function getYmId() {
  const raw = process.env.NEXT_PUBLIC_YM_ID;
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function reachGoal(goal: YmGoal, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const id = getYmId();
  if (!id || typeof window.ym !== "function") return;
  try {
    if (params) window.ym(id, "reachGoal", goal, params);
    else window.ym(id, "reachGoal", goal);
  } catch {
    // метрика не должна ломать UX
  }
}
