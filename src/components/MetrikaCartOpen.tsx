"use client";

import { useEffect, useRef } from "react";
import { reachGoal, YM_GOALS } from "@/lib/metrika";

/** Цель: открытие корзины. */
export default function MetrikaCartOpen() {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    reachGoal(YM_GOALS.cartOpen);
  }, []);
  return null;
}
