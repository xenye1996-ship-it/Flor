import { Suspense } from "react";
import AccountClient from "./AccountClient";

export const metadata = {
  title: "Личный кабинет",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <Suspense fallback={<p className="p-8 text-ink-soft">Загрузка…</p>}>
      <AccountClient />
    </Suspense>
  );
}
