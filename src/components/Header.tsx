"use client";

import Link from "next/link";
import Hydrangea from "./Hydrangea";
import { useCart } from "@/lib/cart-context";
import { usePublicData } from "@/lib/public-data";

const links = [
  { href: "/catalog", label: "Каталог" },
  { href: "/catalog?f=hydrangeas", label: "Гортензии" },
  { href: "/about", label: "О нас" },
  { href: "/care", label: "Уход за цветами" },
  { href: "/delivery", label: "Доставка и оплата" },
];

export default function Header() {
  const { count } = useCart();
  const { site } = usePublicData();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Hydrangea className="h-9 w-9" />
          <span className="font-display text-lg tracking-wide text-plum">
            {site.name}
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-[13.5px] text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <a
            href={site.phoneHref}
            className="hidden text-[13.5px] font-medium text-ink sm:block"
          >
            {site.phone}
          </a>
          <Link
            href="/login"
            className="rounded-full border border-line px-3.5 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Войти
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full bg-lavender px-4 py-2 text-[13.5px] font-semibold text-white transition-colors hover:bg-lavender-deep"
          >
            Корзина
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink px-1 text-[11px] font-bold text-plum">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
