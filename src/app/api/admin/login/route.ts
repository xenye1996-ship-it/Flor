import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  MAX_AGE_SEC,
  createSessionToken,
  getAdminCredentials,
} from "@/lib/admin/auth";
import { appendAudit } from "@/lib/content/store";

export async function POST(request: Request) {
  let body: { login?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const creds = getAdminCredentials();
  if (
    body.login !== creds.login ||
    body.password !== creds.password
  ) {
    await appendAudit({
      actor: body.login || "unknown",
      action: "login_failed",
      details: "Неверный логин или пароль",
    });
    return NextResponse.json(
      { error: "Неверный логин или пароль" },
      { status: 401 },
    );
  }

  const token = createSessionToken(creds.login);
  await appendAudit({
    actor: creds.login,
    action: "login",
    details: "Вход в админку",
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
  return res;
}
