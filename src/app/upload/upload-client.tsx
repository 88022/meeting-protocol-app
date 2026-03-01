"use client";

import { useState } from "react";

export default function UploadClient() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
    } catch {
      // ignore copy errors
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/protocol", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Ошибка");
      return;
    }

    setResult(data.protocol);
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Создание протокола</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Выберите файл транскрипта в формате{" "}
            <span className="font-semibold">.txt</span>
          </p>
          <label className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 border border-blue-600 dark:border-blue-500 rounded cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 text-sm font-medium text-blue-700 dark:text-blue-300">
            Выбрать файл (.txt)
            <input
              type="file"
              accept=".txt"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                setFileName(f ? f.name : null);
              }}
              className="hidden"
            />
          </label>
          {fileName && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Выбран файл: <span className="font-medium">{fileName}</span>
            </p>
          )}
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">Нажми, чтобы получить протокол</p>
        <button
          type="submit"
          disabled={!file || loading}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          {loading ? "Обработка..." : "Протокол"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>}

      {result && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handleCopy}
            className="mb-2 inline-flex items-center justify-center w-8 h-8 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            aria-label="Скопировать протокол"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-4 h-4 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
          <pre className="whitespace-pre-wrap border border-gray-300 dark:border-gray-600 p-4 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}

