import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const metadata = {
  title: "Вход — STEM",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-8 text-ink-soft">Загрузка…</p>}>
      <LoginClient />
    </Suspense>
  );
}
