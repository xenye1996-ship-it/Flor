import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import AdminApp from "@/components/admin/AdminApp";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  return <AdminApp actor={session.login} />;
}
