"use client";

import { useState, useEffect } from "react";

type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  isAdmin: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  setPasswordLink: string | null;
};

const statusLabels: Record<string, string> = {
  PENDING: "Ожидает одобрения",
  INVITED: "Приглашён (ждёт установки пароля)",
  ACTIVE: "Активен",
  BLOCKED: "Заблокирован",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Загрузка пользователей...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Пользователи</h1>
      <p className="text-sm text-gray-600">
        Все зарегистрированные пользователи (кто подал заявку на доступ).
      </p>

      {users.length === 0 ? (
        <p className="text-gray-600">Пользователей пока нет.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Админ</th>
                <th className="px-4 py-3 font-medium">Ссылка для пароля</th>
                <th className="px-4 py-3 font-medium">Регистрация</th>
                <th className="px-4 py-3 font-medium">Последний вход</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {u.lastName} {u.firstName}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{u.email}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {statusLabels[u.status] ?? u.status}
                  </td>
                  <td className="px-4 py-3">{u.isAdmin ? "Да" : "—"}</td>
                  <td className="px-4 py-3">
                    {u.setPasswordLink ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={u.setPasswordLink}
                          className="min-w-[200px] max-w-[280px] rounded border border-gray-200 px-2 py-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(u.setPasswordLink!)
                          }
                          className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                        >
                          Копировать
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(u.createdAt).toLocaleString("ru")}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleString("ru")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
