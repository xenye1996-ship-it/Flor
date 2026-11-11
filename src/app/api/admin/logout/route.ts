import { NextResponse } from "next/server";
import { SESSION_COOKIE, getAdminSession } from "@/lib/admin/auth";
import { appendAudit } from "@/lib/content/store";

export async function POST() {
  const session = await getAdminSession();
  if (session) {
    await appendAudit({
      actor: session.login,
      action: "logout",
      details: "Выход из админки",
    });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
