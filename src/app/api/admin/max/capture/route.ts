import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { appendAudit } from "@/lib/content/store";
import {
  captureMaxRecipientFromUpdates,
  getMaxNotifyConfig,
} from "@/lib/notify/max";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const config = await getMaxNotifyConfig();
  return NextResponse.json({
    config,
    botUsername: "id351801137464_bot",
  });
}

export async function POST() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await captureMaxRecipientFromUpdates();
  if (result.ok) {
    await appendAudit({
      actor: session.login,
      action: "max_capture",
      details: `MAX получатель: user=${result.config.maxUserId || "—"} chat=${result.config.maxChatId || "—"}`,
    });
  }
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
