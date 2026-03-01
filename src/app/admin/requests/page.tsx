"use client";

import { useState, useEffect } from "react";

type RequestWithUser = {
  id: number;
  userId: number;
  status: string;
  createdAt: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [linkForId, setLinkForId] = useState<number | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/requests");
    if (res.ok) {
      const data = await res.json();
      setRequests(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(id: number) {
    setApprovingId(id);
    const res = await fetch(`/api/admin/requests/${id}/approve`, {
      method: "POST",
    });
    const data = await res.json();
    setApprovingId(null);
    if (res.ok) {
      setLinkForId(id);
      setLinkUrl(data.setPasswordLink ?? "");
      setStatusMessage(data.message ?? "");
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert(data.error ?? "Ошибка");
    }
  }

  if (loading) {
    return <p className="text-gray-600">Загрузка заявок...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Заявки на доступ</h1>

      {linkForId !== null && linkUrl && (
        <div className="rounded border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800 mb-2">
            {statusMessage}
          </p>
          <p className="text-xs text-green-700 mb-2">
            Ссылка для установки пароля (действует 24 часа):
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={linkUrl}
              className="flex-1 rounded border bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(linkUrl)}
              className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
            >
              Копировать
            </button>
          </div>
          <button
            type="button"
            onClick={() => { setLinkForId(null); setLinkUrl(""); }}
            className="mt-2 text-sm text-green-700 underline"
          >
            Закрыть
          </button>
        </div>
      )}

      {requests.length === 0 ? (
        <p className="text-gray-600">Нет заявок в ожидании.</p>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 p-4"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {r.user.lastName} {r.user.firstName}
                </p>
                <p className="text-sm text-gray-600">{r.user.email}</p>
                <p className="text-xs text-gray-500">
                  {new Date(r.createdAt).toLocaleString("ru")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleApprove(r.id)}
                disabled={approvingId !== null}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-blue-700"
              >
                {approvingId === r.id ? "Обработка..." : "Одобрить"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
