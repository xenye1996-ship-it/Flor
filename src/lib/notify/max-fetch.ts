import https from "https";

/**
 * Max API часто на цепочке с корневым сертификатом Минцифры,
 * которого нет в Node ca-store → обычный fetch падает.
 * Для platform-api2.max.ru ходим через https с ослабленной проверкой CA.
 */
export async function maxApiFetch(
  url: string,
  init: { method?: string; headers?: Record<string, string>; body?: string } = {},
): Promise<{ ok: boolean; status: number; json: () => Promise<unknown>; text: () => Promise<string> }> {
  const method = init.method || "GET";
  const body = init.body;

  const payload = await new Promise<{ status: number; body: string }>((resolve, reject) => {
    const req = https.request(
      url,
      {
        method,
        headers: {
          ...(init.headers || {}),
          ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}),
        },
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            status: res.statusCode || 0,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });

  return {
    ok: payload.status >= 200 && payload.status < 300,
    status: payload.status,
    async json() {
      return JSON.parse(payload.body || "{}");
    },
    async text() {
      return payload.body;
    },
  };
}
