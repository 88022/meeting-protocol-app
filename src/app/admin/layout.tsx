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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <nav className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/admin" className="font-semibold text-gray-900 dark:text-gray-100">
            Админка
          </a>
          <div className="flex gap-4">
            <a
              href="/admin/users"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Пользователи
            </a>
            <a
              href="/admin/requests"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Заявки на доступ
            </a>
          </div>
        </nav>
      </header>
      <main className="max-w-4xl mx-auto p-4">{children}</main>
    </div>
  );
}
