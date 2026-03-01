"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="max-w-sm mx-auto py-10">
        <p className="text-red-600 dark:text-red-400">Не указана ссылка для установки пароля.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        password,
        confirmPassword,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Ошибка");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (success) {
    return (
      <div className="max-w-sm mx-auto py-10">
        <p className="text-green-700 dark:text-green-400 font-medium">Пароль установлен. Можно войти.</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Перенаправление на страницу входа...</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Установка пароля</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Придумайте пароль для входа в систему (не короче 8 символов).
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          minLength={8}
          required
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Повторите пароль"
          minLength={8}
          required
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 dark:bg-blue-500 px-4 py-2 text-white disabled:opacity-50 hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          {loading ? "Сохранение..." : "Сохранить пароль"}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="max-w-sm mx-auto py-10 text-gray-600 dark:text-gray-400">Загрузка...</div>}>
      <SetPasswordForm />
    </Suspense>
  );
}
