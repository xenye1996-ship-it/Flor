"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { useProductPhoto } from "@/lib/public-data";

export default function ProductCard({ product }: { product: Product }) {
  const photo = useProductPhoto(product.slug);

  return (
    <Link
      href={`/catalog/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-lavender/40 hover:shadow-[0_16px_40px_-14px_rgba(160,95,78,0.28)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        <Image
          src={photo}
          alt={`${product.name} — ${product.line}`}
          fill
          sizes="(max-width: 640px) 50vw, 280px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
        {product.tags.includes("Хит") && (
          <span className="absolute left-3 top-3 rounded-full bg-plum/90 px-2.5 py-1 text-[11px] font-medium tracking-wide text-surface backdrop-blur-sm">
            Хит
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="font-display text-[17px] leading-tight text-ink">
          {product.name}
        </p>
        <p className="text-[13px] text-ink-soft">{product.line}</p>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-[16px] font-semibold text-plum">
            {product.price.toLocaleString("ru-RU")} ₽
          </span>
          {product.oldPrice && (
            <span className="text-[12.5px] text-ink-soft line-through">
              {product.oldPrice.toLocaleString("ru-RU")} ₽
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
