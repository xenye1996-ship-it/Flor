import { createHash } from "crypto";

const API = "https://securepay.tinkoff.ru/v2";

export function isTbankConfigured() {
  return Boolean(
    process.env.TBANK_TERMINAL_KEY && process.env.TBANK_PASSWORD,
  );
}

function terminalKey() {
  return process.env.TBANK_TERMINAL_KEY || "";
}

function password() {
  return process.env.TBANK_PASSWORD || "";
}

/** Токен Т‑Банка: SHA-256 от конкатенации значений полей (кроме Receipt/DATA) + Password, ключи по алфавиту. */
export function buildTbankToken(params: Record<string, unknown>) {
  const copy: Record<string, unknown> = { ...params, Password: password() };
  delete copy.Token;
  delete copy.Receipt;
  delete copy.DATA;
  const keys = Object.keys(copy).sort();
  const concat = keys.map((k) => String(copy[k])).join("");
  return createHash("sha256").update(concat).digest("hex");
}

export type TbankInitResult = {
  Success: boolean;
  ErrorCode: string;
  Message?: string;
  Details?: string;
  PaymentId?: string | number;
  PaymentURL?: string;
  Status?: string;
};

export async function tbankInit(input: {
  orderId: string;
  amountRub: number;
  description: string;
  successUrl: string;
  failUrl: string;
  notificationUrl: string;
  customerEmail?: string;
  customerPhone?: string;
}): Promise<TbankInitResult> {
  const body: Record<string, unknown> = {
    TerminalKey: terminalKey(),
    Amount: Math.round(input.amountRub * 100),
    OrderId: input.orderId,
    Description: input.description.slice(0, 250),
    SuccessURL: input.successUrl,
    FailURL: input.failUrl,
    NotificationURL: input.notificationUrl,
  };
  body.Token = buildTbankToken(body);

  const res = await fetch(`${API}/Init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as TbankInitResult;
}

export function verifyTbankNotification(payload: Record<string, unknown>) {
  const token = String(payload.Token || "");
  const expected = buildTbankToken(payload);
  return token.toLowerCase() === expected.toLowerCase();
}

export function publicSiteOrigin() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "http://localhost:3001"
  );
}
