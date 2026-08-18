"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export default function AddToCartButton({ slug }: { slug: string }) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleClick() {
    add(slug);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full rounded-full bg-lavender px-6 py-3.5 text-[14.5px] font-semibold text-white transition-colors hover:bg-lavender-deep sm:w-auto"
    >
      {justAdded ? "Добавлено ✓" : "Добавить в корзину"}
    </button>
  );
}
