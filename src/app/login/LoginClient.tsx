"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Hydrangea from "@/components/Hydrangea";
import { usePublicData } from "@/lib/public-data";

const PHONE_KEY = "stem-account-phone";

export default function LoginClient() {
  const router = useRouter();
  const { site } = usePublicData();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const login = loginValue.trim();
      const pass = password.trim();

      // Сотрудник: логин + пароль → админка
      if (pass) {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login, password: pass }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Неверный логин или пароль");
          setLoading(false);
          return;
        }
        router.replace("/admin");
        router.refresh();
        return;
      }

      // Клиент: только телефон → кабинет заказов
      const digits = login.replace(/\D/g, "");
      if (digits.length < 10) {
        setError("Введите телефон полностью или логин с паролем для сотрудников");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/account/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: login }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Не удалось войти");
        setLoading(false);
        return;
      }

      try {
        localStorage.setItem(PHONE_KEY, login);
      } catch {
        /* ignore */
      }
      router.replace("/account");
    } catch {
      setError("Не удалось связаться с сервером");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-10">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[400px] rounded-3xl border border-line bg-surface p-8 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)]"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <Link href="/" className="mb-3 flex items-center gap-2">
            <Hydrangea className="h-10 w-10" />
            <span className="font-display text-xl tracking-wide text-plum">
              {site.name}
            </span>
          </Link>
          <p className="text-[14px] text-ink-soft">Вход в систему</p>
        </div>

        <label className="mb-4 block text-[13px]">
          <span className="mb-1.5 block text-ink-soft">Телефон или логин</span>
          <input
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
            placeholder="+7 911 … или admin"
            autoComplete="username"
            required
            className="w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-[14px] outline-none focus:border-lavender"
          />
        </label>

        <label className="mb-2 block text-[13px]">
          <span className="mb-1.5 block text-ink-soft">Пароль</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 pr-12 text-[14px] outline-none focus:border-lavender"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[12px] text-ink-soft hover:text-ink"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? "Скрыть" : "Показать"}
            </button>
          </div>
        </label>

        <p className="mb-5 text-[12px] leading-relaxed text-ink-soft">
          Клиентам: только телефон, пароль не нужен.
          <br />
          Сотрудникам: логин и пароль админки.
        </p>

        {error && (
          <p className="mb-4 rounded-xl bg-pink/40 px-3 py-2.5 text-[13px] text-plum">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-lavender px-4 py-3 text-[14.5px] font-semibold text-white hover:bg-lavender-deep disabled:opacity-60"
        >
          {loading ? "Вход…" : "Войти"}
        </button>

        <p className="mt-6 text-center text-[12.5px] text-ink-soft">
          <Link href="/" className="text-lavender-deep hover:underline">
            На главную
          </Link>
          {" · "}
          <Link href="/privacy" className="text-lavender-deep hover:underline">
            Политика конфиденциальности
          </Link>
        </p>
      </form>
    </div>
  );
}
