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
  protocolCount: number;
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
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
  const [newLinkForId, setNewLinkForId] = useState<number | null>(null);
  const [newLinkUrl, setNewLinkUrl] = useState("");

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

  async function handleRegenerateLink(userId: number) {
    setRegeneratingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/regenerate-password-link`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setNewLinkForId(userId);
        setNewLinkUrl(data.setPasswordLink ?? "");
        load();
      } else {
        alert(data.error ?? "Ошибка");
      }
    } finally {
      setRegeneratingId(null);
    }
  }

  if (loading) {
    return <p className="text-gray-600 dark:text-gray-400">Загрузка пользователей...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Пользователи</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Все зарегистрированные пользователи (кто подал заявку на доступ). Запросов протокола — число нажатий кнопки «Протокол».
      </p>

      {newLinkForId !== null && newLinkUrl && (
        <div className="rounded border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 p-4">
          <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
            Новая ссылка для установки пароля (действует 24 часа):
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={newLinkUrl}
              className="flex-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(newLinkUrl)}
              className="rounded bg-green-600 dark:bg-green-500 px-3 py-2 text-sm text-white hover:bg-green-700 dark:hover:bg-green-600"
            >
              Копировать
            </button>
            <button
              type="button"
              onClick={() => { setNewLinkForId(null); setNewLinkUrl(""); }}
              className="text-sm text-green-700 dark:text-green-400 underline"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">Пользователей пока нет.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-600">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Админ</th>
                <th className="px-4 py-3 font-medium">Запросов протокола</th>
                <th className="px-4 py-3 font-medium">Ссылка для пароля</th>
                <th className="px-4 py-3 font-medium">Действия</th>
                <th className="px-4 py-3 font-medium">Регистрация</th>
                <th className="px-4 py-3 font-medium">Последний вход</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {u.lastName} {u.firstName}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{u.email}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {statusLabels[u.status] ?? u.status}
                  </td>
                  <td className="px-4 py-3">{u.isAdmin ? "Да" : "—"}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {u.protocolCount}
                  </td>
                  <td className="px-4 py-3">
                    {u.setPasswordLink ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={u.setPasswordLink}
                          className="min-w-[200px] max-w-[280px] rounded border border-gray-200 dark:border-gray-600 px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(u.setPasswordLink!)
                          }
                          className="rounded bg-blue-600 dark:bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                        >
                          Копировать
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleRegenerateLink(u.id)}
                      disabled={regeneratingId !== null}
                      className="rounded bg-amber-600 dark:bg-amber-500 px-2 py-1 text-xs text-white disabled:opacity-50 hover:bg-amber-700 dark:hover:bg-amber-600"
                    >
                      {regeneratingId === u.id ? "..." : "Перевыпустить ссылку"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(u.createdAt).toLocaleString("ru")}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
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
