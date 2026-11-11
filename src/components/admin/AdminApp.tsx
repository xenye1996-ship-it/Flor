"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AuditEntry,
  LandingContent,
  PhotosContent,
  Product,
  ReviewsContent,
  SiteInfo,
} from "@/lib/content/types";
import AdminOrders from "@/components/admin/AdminOrders";

type Tab = "orders" | "landing" | "catalog" | "site" | "photos" | "audit";

type ContentPayload = {
  site: SiteInfo;
  products: Product[];
  landing: LandingContent;
  photos: PhotosContent;
  reviews: ReviewsContent;
  audit: AuditEntry[];
  actor: string;
};

const tabs: { id: Tab; label: string }[] = [
  { id: "orders", label: "Заказы" },
  { id: "landing", label: "Лендинг" },
  { id: "catalog", label: "Каталог" },
  { id: "site", label: "Контакты" },
  { id: "photos", label: "Картинки" },
  { id: "audit", label: "Журнал" },
];

const emptyProduct = (): Product => ({
  slug: `buket-${Date.now().toString(36)}`,
  name: "«Новый букет»",
  line: "Описание линейки",
  price: 2000,
  composition: "",
  description: "",
  careTip: "",
  size: "",
  vaseLife: "",
  includes: ["Открытка"],
  tags: [],
  occasions: ["just-because"],
  reviews: [],
  tone: "lavender",
});

export default function AdminApp({ actor }: { actor: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("orders");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [site, setSite] = useState<SiteInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [landing, setLanding] = useState<LandingContent | null>(null);
  const [photos, setPhotos] = useState<PhotosContent | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/content");
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const data = (await res.json()) as ContentPayload;
      setSite(data.site);
      setProducts(data.products);
      setLanding(data.landing);
      setPhotos(data.photos);
      setAudit(data.audit);
    } catch {
      setError("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(section: ContentPayload extends never ? never : "site" | "products" | "landing" | "photos", data: unknown) {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "Ошибка сохранения");
        return;
      }
      setMessage("Сохранено");
      await load();
      router.refresh();
    } catch {
      setError("Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  async function uploadFile(file: File): Promise<string | null> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Ошибка загрузки");
      return null;
    }
    setMessage(`Фото загружено: ${data.url}`);
    await load();
    return data.url as string;
  }

  if (loading || !site || !landing || !photos) {
    return <p className="text-ink-soft">Загрузка админки…</p>;
  }

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] text-plum">Админка STEM</h1>
          <p className="text-[13px] text-ink-soft">Вы вошли как {actor}</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/"
            target="_blank"
            className="rounded-full border border-line px-4 py-2 text-[13px] hover:bg-surface"
          >
            Открыть сайт
          </a>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-line px-4 py-2 text-[13px] hover:bg-surface"
          >
            Выйти
          </button>
        </div>
      </header>

      <nav className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-[13px] font-medium ${
              tab === t.id
                ? "bg-lavender text-white"
                : "border border-line text-ink-soft hover:bg-surface"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {(message || error) && (
        <p
          className={`mb-4 rounded-xl px-4 py-3 text-[13px] ${
            error ? "bg-pink/40 text-plum" : "bg-sage/20 text-ink"
          }`}
        >
          {error || message}
        </p>
      )}

      {tab === "orders" && <AdminOrders />}

      {tab === "landing" && (
        <section className="space-y-4 rounded-2xl border border-line bg-surface p-5">
          <Field label="Надзаголовок" value={landing.eyebrow} onChange={(v) => setLanding({ ...landing, eyebrow: v })} />
          <Field label="Заголовок" value={landing.headline} onChange={(v) => setLanding({ ...landing, headline: v })} />
          <Area label="Подзаголовок" value={landing.subhead} onChange={(v) => setLanding({ ...landing, subhead: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Кнопка 1" value={landing.ctaPrimary} onChange={(v) => setLanding({ ...landing, ctaPrimary: v })} />
            <Field label="Кнопка 2" value={landing.ctaSecondary} onChange={(v) => setLanding({ ...landing, ctaSecondary: v })} />
          </div>
          <Field label="Заголовок хитов" value={landing.hitsTitle} onChange={(v) => setLanding({ ...landing, hitsTitle: v })} />
          <Area label="Цитата" value={landing.quote} onChange={(v) => setLanding({ ...landing, quote: v })} />

          <h2 className="pt-2 font-display text-[18px] text-plum">
            Блок «Как продлить жизнь букету»
          </h2>
          <Field
            label="Заголовок блока"
            value={landing.careTitle}
            onChange={(v) => setLanding({ ...landing, careTitle: v })}
          />
          <Area
            label="Текст блока"
            value={landing.careText}
            onChange={(v) => setLanding({ ...landing, careText: v })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Текст кнопки"
              value={landing.careCta || "Читать"}
              onChange={(v) => setLanding({ ...landing, careCta: v })}
            />
            <Field
              label="Ссылка кнопки"
              value={landing.careHref || "/care"}
              onChange={(v) => setLanding({ ...landing, careHref: v })}
            />
          </div>

          <h2 className="pt-2 font-display text-[18px] text-plum">Преимущества (USP)</h2>
          {landing.usps.map((u, i) => (
            <div key={i} className="grid gap-3 rounded-xl border border-line p-3 sm:grid-cols-3">
              <label className="text-[12px] text-ink-soft">
                Иконка
                <select
                  value={u.icon}
                  onChange={(e) => {
                    const usps = [...landing.usps];
                    usps[i] = { ...u, icon: e.target.value as LandingContent["usps"][0]["icon"] };
                    setLanding({ ...landing, usps });
                  }}
                  className="mt-1 w-full rounded-lg border border-line bg-bg px-2 py-2 text-[13px]"
                >
                  <option value="camera">camera</option>
                  <option value="clock">clock</option>
                  <option value="card">card</option>
                </select>
              </label>
              <Field label="Заголовок" value={u.title} onChange={(v) => {
                const usps = [...landing.usps];
                usps[i] = { ...u, title: v };
                setLanding({ ...landing, usps });
              }} />
              <Field label="Текст" value={u.desc} onChange={(v) => {
                const usps = [...landing.usps];
                usps[i] = { ...u, desc: v };
                setLanding({ ...landing, usps });
              }} />
            </div>
          ))}

          <Area
            label="Бегущая строка (по строке)"
            value={landing.marquee.join("\n")}
            onChange={(v) =>
              setLanding({
                ...landing,
                marquee: v.split("\n").map((s) => s.trim()).filter(Boolean),
              })
            }
          />

          <SaveButton disabled={saving} onClick={() => save("landing", landing)} />
        </section>
      )}

      {tab === "catalog" && (
        <section className="space-y-4">
          <div className="flex justify-between gap-3">
            <p className="text-[13px] text-ink-soft">{products.length} товар(ов)</p>
            <button
              type="button"
              onClick={() => setProducts([emptyProduct(), ...products])}
              className="rounded-full border border-line px-4 py-2 text-[13px] hover:bg-surface"
            >
              + Добавить товар
            </button>
          </div>
          {products.map((p, i) => (
            <div key={p.slug + i} className="space-y-3 rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-display text-[18px] text-plum">{p.name}</h2>
                <button
                  type="button"
                  onClick={() => setProducts(products.filter((_, idx) => idx !== i))}
                  className="text-[12px] text-ink-soft hover:text-plum"
                >
                  Удалить
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Slug (URL)" value={p.slug} onChange={(v) => {
                  const next = [...products];
                  next[i] = { ...p, slug: v };
                  setProducts(next);
                }} />
                <Field label="Название" value={p.name} onChange={(v) => {
                  const next = [...products];
                  next[i] = { ...p, name: v };
                  setProducts(next);
                }} />
                <Field label="Линейка" value={p.line} onChange={(v) => {
                  const next = [...products];
                  next[i] = { ...p, line: v };
                  setProducts(next);
                }} />
                <Field label="Цена" value={String(p.price)} onChange={(v) => {
                  const next = [...products];
                  next[i] = { ...p, price: Number(v) || 0 };
                  setProducts(next);
                }} />
                <Field label="Старая цена" value={p.oldPrice ? String(p.oldPrice) : ""} onChange={(v) => {
                  const next = [...products];
                  next[i] = { ...p, oldPrice: v ? Number(v) : undefined };
                  setProducts(next);
                }} />
                <Field label="Теги через запятую" value={p.tags.join(", ")} onChange={(v) => {
                  const next = [...products];
                  next[i] = { ...p, tags: v.split(",").map((s) => s.trim()).filter(Boolean) };
                  setProducts(next);
                }} />
              </div>
              <Area label="Описание" value={p.description} onChange={(v) => {
                const next = [...products];
                next[i] = { ...p, description: v };
                setProducts(next);
              }} />
              <Field label="Состав" value={p.composition} onChange={(v) => {
                const next = [...products];
                next[i] = { ...p, composition: v };
                setProducts(next);
              }} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Размер" value={p.size} onChange={(v) => {
                  const next = [...products];
                  next[i] = { ...p, size: v };
                  setProducts(next);
                }} />
                <Field label="Срок в вазе" value={p.vaseLife} onChange={(v) => {
                  const next = [...products];
                  next[i] = { ...p, vaseLife: v };
                  setProducts(next);
                }} />
              </div>
              <Area label="Совет по уходу" value={p.careTip} onChange={(v) => {
                const next = [...products];
                next[i] = { ...p, careTip: v };
                setProducts(next);
              }} />
              <div>
                <p className="mb-1 text-[12px] text-ink-soft">Фото товара</p>
                <div className="flex flex-wrap items-center gap-3">
                  {photos.products[p.slug] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photos.products[p.slug]} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await uploadFile(file);
                      if (!url) return;
                      setPhotos({
                        ...photos,
                        products: { ...photos.products, [p.slug]: url },
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          <SaveButton
            disabled={saving}
            onClick={async () => {
              await save("products", products);
              await save("photos", photos);
            }}
          />
        </section>
      )}

      {tab === "site" && (
        <section className="space-y-4 rounded-2xl border border-line bg-surface p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Название" value={site.name} onChange={(v) => setSite({ ...site, name: v })} />
            <Field label="Город" value={site.city} onChange={(v) => setSite({ ...site, city: v })} />
            <Field label="Адрес" value={site.address} onChange={(v) => setSite({ ...site, address: v })} />
            <Field label="Телефон" value={site.phone} onChange={(v) => setSite({ ...site, phone: v })} />
            <Field label="tel: ссылка" value={site.phoneHref} onChange={(v) => setSite({ ...site, phoneHref: v })} />
            <Field label="WhatsApp URL" value={site.whatsappHref} onChange={(v) => setSite({ ...site, whatsappHref: v })} />
            <Field label="Telegram URL" value={site.telegramHref} onChange={(v) => setSite({ ...site, telegramHref: v })} />
            <Field label="VK URL" value={site.vkHref} onChange={(v) => setSite({ ...site, vkHref: v })} />
          </div>
          <Field label="Слоган" value={site.tagline} onChange={(v) => setSite({ ...site, tagline: v })} />
          <Field label="Купон / скидка" value={site.couponNote} onChange={(v) => setSite({ ...site, couponNote: v })} />
          <SaveButton disabled={saving} onClick={() => save("site", site)} />
        </section>
      )}

      {tab === "photos" && (
        <section className="space-y-5 rounded-2xl border border-line bg-surface p-5">
          {(["hero", "shop", "story", "gallery"] as const).map((key) => (
            <div key={key} className="flex flex-wrap items-center gap-4 border-b border-line pb-4">
              <div>
                <p className="mb-1 text-[13px] font-medium capitalize">{key}</p>
                {photos[key] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photos[key]} alt={key} className="h-24 w-36 rounded-lg object-cover" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadFile(file);
                  if (!url) return;
                  setPhotos({ ...photos, [key]: url });
                }}
              />
              <Field
                label="Или URL"
                value={photos[key]}
                onChange={(v) => setPhotos({ ...photos, [key]: v })}
              />
            </div>
          ))}
          <SaveButton disabled={saving} onClick={() => save("photos", photos)} />
        </section>
      )}

      {tab === "audit" && (
        <section className="rounded-2xl border border-line bg-surface p-5">
          <p className="mb-4 text-[13px] text-ink-soft">
            Последние действия в админке
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[13px]">
              <thead className="text-ink-soft">
                <tr>
                  <th className="pb-2 font-medium">Когда</th>
                  <th className="pb-2 font-medium">Кто</th>
                  <th className="pb-2 font-medium">Действие</th>
                  <th className="pb-2 font-medium">Детали</th>
                </tr>
              </thead>
              <tbody>
                {audit.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-ink-soft">
                      Пока пусто
                    </td>
                  </tr>
                )}
                {audit.map((a) => (
                  <tr key={a.id} className="border-t border-line">
                    <td className="py-2.5 pr-3 whitespace-nowrap">
                      {new Date(a.at).toLocaleString("ru-RU")}
                    </td>
                    <td className="py-2.5 pr-3">{a.actor}</td>
                    <td className="py-2.5 pr-3">{a.action}</td>
                    <td className="py-2.5 text-ink-soft">{a.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-full border border-line px-4 py-2 text-[13px] hover:bg-bg"
          >
            Обновить журнал
          </button>
        </section>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-[12px] text-ink-soft">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-[13.5px] text-ink outline-none focus:border-lavender"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-[12px] text-ink-soft">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-[13.5px] text-ink outline-none focus:border-lavender"
      />
    </label>
  );
}

function SaveButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full bg-lavender px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-lavender-deep disabled:opacity-60"
    >
      {disabled ? "Сохраняем…" : "Сохранить"}
    </button>
  );
}
