export type OrderStatus =
  | "new"
  | "awaiting_payment"
  | "paid"
  | "assembling"
  | "photo_pending"
  | "photo_approved"
  | "photo_revision"
  | "delivering"
  | "delivered"
  | "cancelled";

export type OrderLine = {
  slug: string;
  name: string;
  price: number;
  qty: number;
};

export type OrderPayment = {
  method: "card" | "cash" | "sbp";
  provider?: "tbank" | "manual";
  paymentId?: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  paidAt?: string;
  paymentUrl?: string;
};

export type OrderPhoto = {
  url: string;
  uploadedAt: string;
  decision?: "approved" | "revision";
  customerComment?: string;
  reviewedAt?: string;
};

export type OrderHistoryEntry = {
  at: string;
  status: OrderStatus;
  note?: string;
  actor: string;
};

export type Order = {
  id: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  customer: {
    name: string;
    phone: string;
    address: string;
    deliveryTime: string;
    card: string;
  };
  lines: OrderLine[];
  total: number;
  payment: OrderPayment;
  photo?: OrderPhoto;
  history: OrderHistoryEntry[];
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Новый",
  awaiting_payment: "Ждём оплату",
  paid: "Оплачен",
  assembling: "Собираем",
  photo_pending: "Ждём фото / подтверждение",
  photo_approved: "Фото подтверждено",
  photo_revision: "Правки по фото",
  delivering: "В доставке",
  delivered: "Доставлен",
  cancelled: "Отменён",
};
