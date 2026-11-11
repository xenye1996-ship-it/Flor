"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [login, setLogin] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка входа");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Не удалось связаться с сервером");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-16 max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-sm"
    >
      <h1 className="mb-1 font-display text-[24px] text-plum">STEM Admin</h1>
      <p className="mb-6 text-[13px] text-ink-soft">
        Вход для редактирования сайта
      </p>
      <label className="mb-4 block text-[13px]">
        <span className="mb-1.5 block text-ink-soft">Логин</span>
        <input
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-[14px] outline-none focus:border-lavender"
          autoComplete="username"
        />
      </label>
      <label className="mb-5 block text-[13px]">
        <span className="mb-1.5 block text-ink-soft">Пароль</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-[14px] outline-none focus:border-lavender"
          autoComplete="current-password"
        />
      </label>
      {error && (
        <p className="mb-4 rounded-lg bg-pink/30 px-3 py-2 text-[13px] text-plum">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-lavender px-4 py-3 text-[14px] font-semibold text-white hover:bg-lavender-deep disabled:opacity-60"
      >
        {loading ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
