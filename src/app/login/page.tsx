"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Ошибка входа");
        return;
      }
      router.push("/upload");
    } catch (err) {
      setError("Не удалось войти. Проверьте интернет или попробуйте позже.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Вход</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Корпоративная почта"
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          {loading ? "Входим..." : "Войти"}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="mt-6 text-sm text-gray-700 dark:text-gray-300">
        Новый пользователь?{" "}
        <button
          type="button"
          onClick={() => router.push("/register")}
          className="text-blue-600 dark:text-blue-400 underline"
        >
          Регистрация
        </button>
      </div>
    </div>
  );
}

