"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Ошибка регистрации");
        return;
      }
      setSuccess(
        data.message ??
          "Запрос на доступ отправлен. Мы свяжемся с вами по электронной почте."
      );
      setFirstName("");
      setLastName("");
      setEmail("");
    } catch (err) {
      setError("Не удалось отправить запрос. Проверьте интернет или попробуйте позже.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Запрос доступа</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Имя"
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Фамилия"
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Корпоративная почта (@targetai.ai)"
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          {loading ? "Отправляем..." : "Отправить запрос"}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {success && <p className="mt-4 text-sm text-green-700 dark:text-green-400">{success}</p>}
    </div>
  );
}

