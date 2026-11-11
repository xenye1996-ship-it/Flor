/** Уведомления о новом заказе: Telegram, MAX, VK. Ошибки не валят оформление. */

export type OrderNotifyPayload = {
  orderId: string;
  total: number;
  summary: string;
};

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { channel: "telegram", skipped: true as const };

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`telegram ${res.status}: ${body.slice(0, 200)}`);
  }
  return { channel: "telegram", ok: true as const };
}

/** MAX: https://dev.max.ru/docs-api/methods/POST/messages */
async function sendMax(text: string) {
  const {
    getMaxNotifyConfig,
    maxBotToken,
    pollMaxUpdatesOnce,
  } = await import("./max");
  const token = maxBotToken();
  let cfg = await getMaxNotifyConfig();
  // если получатель ещё не привязан — один раз добрать апдейты (вдруг только что написали боту)
  if (token && !cfg.maxChatId && !cfg.maxUserId) {
    await pollMaxUpdatesOnce(1).catch(() => null);
    cfg = await getMaxNotifyConfig();
  }
  const chatId = cfg.maxChatId;
  const userId = cfg.maxUserId;
  if (!token || (!chatId && !userId)) {
    return { channel: "max", skipped: true as const };
  }

  const qs = userId
    ? `user_id=${encodeURIComponent(userId)}`
    : `chat_id=${encodeURIComponent(chatId)}`;

  const { maxApiFetch } = await import("./max-fetch");
  const res = await maxApiFetch(`https://platform-api2.max.ru/messages?${qs}`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`max ${res.status}: ${body.slice(0, 200)}`);
  }
  return { channel: "max", ok: true as const };
}

/** VK community messages.send → peer_id (личка или беседа 2000000000+id) */
async function sendVk(text: string) {
  const token = process.env.VK_GROUP_TOKEN;
  const peerId = process.env.VK_PEER_ID;
  if (!token || !peerId) return { channel: "vk", skipped: true as const };

  const params = new URLSearchParams({
    access_token: token,
    peer_id: peerId,
    message: text,
    random_id: String(Date.now() % 1_000_000_000),
    v: process.env.VK_API_VERSION || "5.199",
  });

  const res = await fetch(`https://api.vk.com/method/messages.send?${params}`, {
    method: "POST",
  });
  const data = (await res.json()) as {
    response?: number;
    error?: { error_code: number; error_msg: string };
  };
  if (data.error) {
    throw new Error(
      `vk ${data.error.error_code}: ${data.error.error_msg}`,
    );
  }
  return { channel: "vk", ok: true as const };
}

export async function notifyOrderChannels(payload: OrderNotifyPayload) {
  const text = payload.summary;
  const results = await Promise.allSettled([
    sendTelegram(text),
    sendMax(text),
    sendVk(text),
  ]);

  const report = results.map((r, i) => {
    const name = ["telegram", "max", "vk"][i];
    if (r.status === "fulfilled") return r.value;
    console.error(`[order-notify] ${name}:`, r.reason);
    return { channel: name, ok: false as const, error: String(r.reason) };
  });

  const anyConfigured = report.some(
    (r) => !("skipped" in r && r.skipped),
  );
  if (!anyConfigured) {
    console.log(text);
  }

  return report;
}
