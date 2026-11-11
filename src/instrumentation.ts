export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { startMaxAutoPoller, ensureMaxWebhookSubscription } = await import(
    "@/lib/notify/max"
  );

  // На публичном HTTPS — webhook; локально — long polling.
  const sub = await ensureMaxWebhookSubscription();
  if ("skipped" in sub && sub.skipped) {
    startMaxAutoPoller();
  }
}
