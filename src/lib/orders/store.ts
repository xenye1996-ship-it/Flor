import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import type { Order, OrderHistoryEntry, OrderStatus } from "./types";

const file = path.join(process.cwd(), "data", "orders.json");

async function readAll(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

async function writeAll(orders: Order[]) {
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(orders, null, 2), "utf8");
  await fs.rename(tmp, file);
}

export function createOrderToken() {
  return randomBytes(18).toString("base64url");
}

export async function listOrders(): Promise<Order[]> {
  const orders = await readAll();
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Нормализация телефона: последние 10 цифр (без кода страны). */
export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

export async function listOrdersByPhone(phone: string): Promise<Order[]> {
  const key = normalizePhone(phone);
  if (key.length < 10) return [];
  const orders = await listOrders();
  return orders.filter(
    (o) => normalizePhone(o.customer.phone) === key,
  );
}

export async function getOrderById(id: string) {
  const orders = await readAll();
  return orders.find((o) => o.id === id) ?? null;
}

export async function getOrderByIdAndToken(id: string, token: string) {
  const order = await getOrderById(id);
  if (!order || order.token !== token) return null;
  return order;
}

export async function saveOrder(order: Order) {
  const orders = await readAll();
  const idx = orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) orders[idx] = order;
  else orders.unshift(order);
  await writeAll(orders);
  return order;
}

export async function createOrder(
  input: Omit<Order, "createdAt" | "updatedAt" | "history"> & {
    historyNote?: string;
  },
) {
  const now = new Date().toISOString();
  const history: OrderHistoryEntry[] = [
    {
      at: now,
      status: input.status,
      actor: "system",
      note: input.historyNote ?? "Заказ создан",
    },
  ];
  const order: Order = {
    ...input,
    createdAt: now,
    updatedAt: now,
    history,
  };
  await saveOrder(order);
  return order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  actor: string,
  note?: string,
) {
  const order = await getOrderById(id);
  if (!order) return null;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  order.history.unshift({
    at: order.updatedAt,
    status,
    actor,
    note,
  });
  await saveOrder(order);
  return order;
}

export async function patchOrder(
  id: string,
  patch: Partial<Order>,
  history?: OrderHistoryEntry,
) {
  const order = await getOrderById(id);
  if (!order) return null;
  const next: Order = {
    ...order,
    ...patch,
    id: order.id,
    token: order.token,
    updatedAt: new Date().toISOString(),
    history: history
      ? [history, ...order.history]
      : order.history,
  };
  await saveOrder(next);
  return next;
}
