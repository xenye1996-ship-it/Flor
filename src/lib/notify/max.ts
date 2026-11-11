import { promises as fs } from "fs";
import path from "path";
import { maxApiFetch } from "./max-fetch";

export type MaxNotifyConfig = {
  maxUserId: string;
  maxChatId: string;
};

const file = path.join(process.cwd(), "data", "notify.json");
let pollerStarted = false;
let lastMarker: number | undefined;

export async function getMaxNotifyConfig(): Promise<MaxNotifyConfig> {
  try {
    const raw = await fs.readFile(file, "utf8");
    const data = JSON.parse(raw) as Partial<MaxNotifyConfig>;
    return {
      maxUserId: String(data.maxUserId || process.env.MAX_USER_ID || ""),
      maxChatId: String(data.maxChatId || process.env.MAX_CHAT_ID || ""),
    };
  } catch {
    return {
      maxUserId: process.env.MAX_USER_ID || "",
      maxChatId: process.env.MAX_CHAT_ID || "",
    };
  }
}

export async function saveMaxNotifyConfig(patch: Partial<MaxNotifyConfig>) {
  const current = await getMaxNotifyConfig();
  const next = { ...current, ...patch };
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
  await fs.rename(tmp, file);
  return next;
}

export function maxBotToken() {
  return process.env.MAX_BOT_TOKEN || "";
}

export type MaxUpdate = {
  update_type?: string;
  timestamp?: number;
  user?: { user_id?: number; userId?: number; name?: string };
  message?: {
    sender?: { user_id?: number; userId?: number; name?: string };
    recipient?: { chat_id?: number; chatId?: number; user_id?: number };
    body?: { text?: string };
  };
  chat_id?: number;
  chatId?: number;
};

function pickUserId(u: MaxUpdate): string | null {
  const fromUser = u.user?.user_id ?? u.user?.userId;
  const fromSender = u.message?.sender?.user_id ?? u.message?.sender?.userId;
  const id = fromUser ?? fromSender;
  return id != null ? String(id) : null;
}

function pickChatId(u: MaxUpdate): string | null {
  const id =
    u.chat_id ??
    u.chatId ??
    u.message?.recipient?.chat_id ??
    u.message?.recipient?.chatId;
  return id != null ? String(id) : null;
}

function messageText(u: MaxUpdate) {
  return (u.message?.body?.text || "").trim().toLowerCase();
}

async function sendMaxText(opts: {
  token: string;
  userId?: string;
  chatId?: string;
  text: string;
}) {
  if (!opts.userId && !opts.chatId) return false;
  const qs = opts.userId
    ? `user_id=${encodeURIComponent(opts.userId)}`
    : `chat_id=${encodeURIComponent(opts.chatId!)}`;
  const res = await maxApiFetch(`https://platform-api2.max.ru/messages?${qs}`, {
    method: "POST",
    headers: {
      Authorization: opts.token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: opts.text }),
  });
  return res.ok;
}

/** Обработка апдейтов: автопривязка получателя уведомлений. */
export async function processMaxUpdates(updates: MaxUpdate[]) {
  const token = maxBotToken();
  if (!token || !updates.length) {
    return { bound: false as const, reason: "empty" as const };
  }

  const cfg = await getMaxNotifyConfig();
  let boundUser = cfg.maxUserId;
  let boundChat = cfg.maxChatId;
  let changed = false;
  let welcomedUser: string | null = null;

  for (const u of updates) {
    const type = u.update_type || "";
    if (
      type !== "message_created" &&
      type !== "bot_started" &&
      type !== "bot_added"
    ) {
      continue;
    }

    const userId = pickUserId(u);
    const chatId = pickChatId(u);
    const text = messageText(u);
    const forceRebind =
      text.includes("подключить") ||
      text === "/start" ||
      text === "start";

    if (!userId && !chatId) continue;

    const empty = !boundUser && !boundChat;
    if (empty || forceRebind) {
      // Для лички предпочитаем user_id
      if (userId) {
        boundUser = userId;
        boundChat = "";
      } else if (chatId) {
        boundChat = chatId;
        boundUser = "";
      }
      changed = true;
      welcomedUser = userId || chatId;
    } else if (userId && userId === boundUser) {
      // уже привязанный пользователь написал — коротко ответим
      await sendMaxText({
        token,
        userId,
        text: "STEM: уведомления уже включены. Новые заказы будут приходить сюда.",
      });
    }
  }

  if (!changed || !welcomedUser) {
    return {
      bound: Boolean(boundUser || boundChat),
      reason: "unchanged" as const,
      config: cfg,
    };
  }

  const saved = await saveMaxNotifyConfig({
    maxUserId: boundUser,
    maxChatId: boundChat,
  });

  await sendMaxText({
    token,
    userId: saved.maxUserId || undefined,
    chatId: saved.maxChatId || undefined,
    text: "STEM: готово. Этот чат будет автоматически получать уведомления о новых заказах с сайта.",
  });

  console.log(
    `[max] автопривязка получателя user=${saved.maxUserId || "—"} chat=${saved.maxChatId || "—"}`,
  );

  return { bound: true as const, reason: "saved" as const, config: saved };
}

export async function pollMaxUpdatesOnce(timeoutSec = 5) {
  const token = maxBotToken();
  if (!token) {
    return { ok: false as const, error: "MAX_BOT_TOKEN не задан" };
  }

  const qs = new URLSearchParams({
    limit: "100",
    timeout: String(timeoutSec),
  });
  if (lastMarker != null) qs.set("marker", String(lastMarker));

  const res = await maxApiFetch(`https://platform-api2.max.ru/updates?${qs}`, {
    headers: { Authorization: token },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return {
      ok: false as const,
      error: `MAX updates ${res.status}: ${body.slice(0, 200)}`,
    };
  }

  const data = (await res.json()) as { updates?: MaxUpdate[]; marker?: number };
  if (typeof data.marker === "number") lastMarker = data.marker;
  const updates = data.updates || [];
  const processed = await processMaxUpdates(updates);
  return { ok: true as const, updatesCount: updates.length, processed };
}

/** Ручной захват (кнопка в админке) — то же авто, но с понятным ответом. */
export async function captureMaxRecipientFromUpdates() {
  const result = await pollMaxUpdatesOnce(8);
  if (!result.ok) return result;

  if (!result.updatesCount) {
    return {
      ok: false as const,
      waiting: true as const,
      error:
        "Пока нет событий. Напишите боту @id351801137464_bot в Max любое сообщение — привязка произойдёт сама.",
    };
  }

  const cfg = await getMaxNotifyConfig();
  if (!cfg.maxUserId && !cfg.maxChatId) {
    return {
      ok: false as const,
      error:
        "События есть, но получатель не определён. Напишите боту /start ещё раз.",
    };
  }

  return {
    ok: true as const,
    config: cfg,
    pingOk: true,
    updatesCount: result.updatesCount,
  };
}

/** Фоновый long-poll при работающем next dev / node-сервере. */
export function startMaxAutoPoller() {
  if (pollerStarted) return;
  if (!maxBotToken()) return;
  if (process.env.MAX_AUTO_POLL === "0") return;
  pollerStarted = true;

  const tick = async () => {
    try {
      await pollMaxUpdatesOnce(25);
    } catch (e) {
      console.error("[max] poll error", e);
    } finally {
      // сразу следующий long-poll
      setTimeout(tick, 500);
    }
  };

  console.log("[max] автопривязка включена (long polling)");
  void tick();
}

/** Регистрация webhook, если сайт на публичном HTTPS. */
export async function ensureMaxWebhookSubscription() {
  const token = maxBotToken();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "";
  if (!token || !origin.startsWith("https://")) return { skipped: true as const };

  const url = `${origin.replace(/\/$/, "")}/api/max/webhook`;
  const res = await maxApiFetch("https://platform-api2.max.ru/subscriptions", {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      update_types: ["message_created", "bot_started", "bot_added"],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[max] webhook subscribe failed", res.status, body.slice(0, 200));
    return { ok: false as const };
  }
  console.log("[max] webhook подписан:", url);
  return { ok: true as const, url };
}
