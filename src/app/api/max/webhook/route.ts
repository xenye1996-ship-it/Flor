import { NextResponse } from "next/server";
import { processMaxUpdates, type MaxUpdate } from "@/lib/notify/max";

export async function POST(request: Request) {
  let body: MaxUpdate | { updates?: MaxUpdate[] };
  try {
    body = await request.json();
  } catch {
    return new NextResponse("bad request", { status: 400 });
  }

  const updates = Array.isArray((body as { updates?: MaxUpdate[] }).updates)
    ? ((body as { updates: MaxUpdate[] }).updates)
    : [body as MaxUpdate];

  try {
    await processMaxUpdates(updates.filter(Boolean));
  } catch (e) {
    console.error("[max webhook]", e);
  }

  // Max ждёт 200 быстро
  return new NextResponse("OK", { status: 200 });
}
