"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sprig from "@/components/Sprig";
import { useCart } from "@/lib/cart-context";
import { useProductBySlug, useProductPhoto } from "@/lib/public-data";
import MetrikaCartOpen from "@/components/MetrikaCartOpen";

function CartLineRow({
  slug,
  qty,
  onSetQty,
  onRemove,
}: {
  slug: string;
  qty: number;
  onSetQty: (slug: string, qty: number) => void;
  onRemove: (slug: string) => void;
}) {
  const product = useProductBySlug(slug);
  const photo = useProductPhoto(slug);
  if (!product) return null;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
        <Image
          src={photo}
          alt=""
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={`/catalog/${product.slug}`}
          className="block truncate font-display text-[15.5px] text-ink hover:text-plum"
        >
          {product.name}
        </Link>
        <p className="text-[12.5px] text-ink-soft">
          {product.price.toLocaleString("ru-RU")} ₽ / шт
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSetQty(slug, qty - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-surface-2"
          aria-label="Уменьшить количество"
        >
          −
        </button>
        <span className="w-5 text-center text-[13.5px] tabular-nums">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => onSetQty(slug, qty + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-surface-2"
          aria-label="Увеличить количество"
        >
          +
        </button>
      </div>
      <p className="w-20 shrink-0 text-right text-[14px] font-semibold text-plum tabular-nums">
        {(product.price * qty).toLocaleString("ru-RU")} ₽
      </p>
      <button
        type="button"
        onClick={() => onRemove(slug)}
        className="shrink-0 text-[12.5px] text-ink-soft hover:text-lavender-deep"
        aria-label={`Убрать ${product.name} из корзины`}
      >
        Убрать
      </button>
    </motion.div>
  );
}

export default function CartPage() {
  const { lines, setQty, remove, total, count } = useCart();

  return (
    <>
      <MetrikaCartOpen />
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-5 pb-20 pt-12">
          <h1 className="mb-8 text-[28px] text-plum">Корзина</h1>

          {lines.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-8 py-20 text-center">
              <Sprig className="h-8 w-28 opacity-80" />
              <p className="font-display text-[19px] text-ink">
                Корзина пока пустая
              </p>
              <p className="max-w-[40ch] text-[14px] text-ink-soft">
                Загляните в каталог — там четыре линейки букетов, есть и до
                2000 ₽.
              </p>
              <Link
                href="/catalog"
                className="mt-2 inline-block rounded-full bg-lavender px-6 py-3 text-[13.5px] font-semibold text-white hover:bg-lavender-deep"
              >
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-[1fr_320px]">
              <div className="flex flex-col gap-3">
                <AnimatePresence initial={false}>
                  {lines.map((line) => (
                    <CartLineRow
                      key={line.slug}
                      slug={line.slug}
                      qty={line.qty}
                      onSetQty={setQty}
                      onRemove={remove}
                    />
                  ))}
                </AnimatePresence>
              </div>

              <div className="h-fit rounded-2xl border border-line bg-surface p-6">
                <div className="mb-4 flex items-center justify-between text-[14px] text-ink-soft">
                  <span>Товаров</span>
                  <span className="tabular-nums">{count}</span>
                </div>
                <div className="mb-6 flex items-center justify-between border-t border-line pt-4 text-[16px] font-semibold text-ink">
                  <span>Итого</span>
                  <span className="tabular-nums text-plum">
                    {total.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <Link
                  href="/checkout"
                  className="block w-full rounded-full bg-lavender px-6 py-3.5 text-center text-[14.5px] font-semibold text-white hover:bg-lavender-deep"
                >
                  Оформить заказ
                </Link>
                <p className="mt-3 text-center text-[12px] text-ink-soft">
                  Открытку и время доставки укажете на следующем шаге
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
