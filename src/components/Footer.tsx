"use client";

import Link from "next/link";
import Hydrangea from "./Hydrangea";
import { usePublicData } from "@/lib/public-data";

export default function Footer() {
  const { site } = usePublicData();

  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Hydrangea className="h-7 w-7" />
            <span className="font-display text-base tracking-wide text-plum">
              {site.name}
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            Букеты и композиции ручной сборки. Собираем сами, доставляем сами
            — по всему Череповцу.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-[13.5px] text-ink-soft">
          <span className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-ink">
            Каталог
          </span>
          <Link href="/catalog?f=hydrangeas" className="hover:text-ink">
            Гортензии
          </Link>
          <Link href="/catalog?f=budget" className="hover:text-ink">
            До 2000 ₽
          </Link>
          <Link href="/catalog" className="hover:text-ink">
            Весь каталог
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-[13.5px] text-ink-soft">
          <span className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-ink">
            Информация
          </span>
          <Link href="/about" className="hover:text-ink">
            О нас
          </Link>
          <Link href="/delivery" className="hover:text-ink">
            Доставка и оплата
          </Link>
          <Link href="/care" className="hover:text-ink">
            Уход за цветами
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            Политика конфиденциальности
          </Link>
          <Link href="/login" className="hover:text-ink">
            Войти
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-[13.5px] text-ink-soft">
          <span className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-ink">
            Контакты
          </span>
          <a href={site.phoneHref} className="hover:text-ink">
            {site.phone}
          </a>
          <span>
            {site.city}, {site.address}
          </span>
          <span className="flex flex-wrap gap-3">
            <a
              href={site.vkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink"
            >
              ВКонтакте
            </a>
            <a
              href={site.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink"
            >
              WhatsApp
            </a>
            <a
              href={site.telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink"
            >
              Telegram
            </a>
          </span>
        </div>
      </div>
      <div className="border-t border-line px-5 py-4 text-center text-[12px] text-ink-soft">
        © {new Date().getFullYear()} {site.name}. Все права защищены.
      </div>
    </footer>
  );
}
