import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    redirect("/login");
  }
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-4 py-3">
        <nav className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/admin" className="font-semibold text-gray-900">
            Админка
          </a>
          <a
            href="/admin/requests"
            className="text-sm text-blue-600 hover:underline"
          >
            Заявки на доступ
          </a>
        </nav>
      </header>
      <main className="max-w-4xl mx-auto p-4">{children}</main>
    </div>
  );
}
