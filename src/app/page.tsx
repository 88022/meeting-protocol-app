import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-[var(--font-geist-sans)]">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight text-gray-900">
            PM Assist
          </span>
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Войти →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            Сервис в разработке
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 leading-tight mb-6">
            Протоколы встреч{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              без усилий
            </span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
            PM&nbsp;Assist автоматически подключается к вашей встрече в&nbsp;Телемосте,
            записывает разговор и&nbsp;формирует готовый протокол с&nbsp;задачами и&nbsp;сроками.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-200"
            >
              Запросить доступ
            </Link>
            <a
              href="#how"
              className="px-6 py-3 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-lg transition-colors"
            >
              Как это работает ↓
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Всё, что нужно для продуктивных встреч
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-xl">
                🤖
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Агент сам подключается</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Сохраните ссылку на встречу в&nbsp;Телемосте —
                агент войдёт, запишет аудио и&nbsp;расшифрует без вашего участия.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center mb-4 text-xl">
                📋
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Умные шаблоны протоколов</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Рабочая встреча, встреча с&nbsp;клиентом или собеседование —
                AI подберёт структуру и&nbsp;выделит ключевые договорённости.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center mb-4 text-xl">
                📤
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Загрузка транскрипта</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Уже есть текст встречи? Загрузите файл и&nbsp;получите
                структурированный протокол за&nbsp;секунды.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Как это работает
          </h2>
          <div className="relative">
            {/* connector line */}
            <div className="absolute left-5 top-8 bottom-8 w-px bg-gradient-to-b from-indigo-200 via-violet-200 to-sky-200 hidden sm:block" />
            <div className="space-y-10">
              {[
                {
                  n: "1",
                  color: "bg-indigo-100 text-indigo-700",
                  title: "Сохраните ссылку на встречу",
                  desc: "Вставьте ссылку на конференцию в Телемосте и укажите название. PM Assist поставит встречу в очередь.",
                },
                {
                  n: "2",
                  color: "bg-violet-100 text-violet-700",
                  title: "Агент подключается и записывает",
                  desc: "В момент встречи агент войдёт как участник, захватит аудио и расшифрует разговор с помощью AI.",
                },
                {
                  n: "3",
                  color: "bg-sky-100 text-sky-700",
                  title: "Получите готовый протокол",
                  desc: "После встречи в вашем кабинете появится протокол с задачами, ответственными и сроками.",
                },
              ].map((step) => (
                <div key={step.n} className="flex gap-5 items-start relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ${step.color}`}
                  >
                    {step.n}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
            Шаблоны протоколов
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10">
            AI адаптирует структуру под тип встречи
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { emoji: "🗂️", label: "Рабочая встреча", desc: "Задачи, ответственные, дедлайны" },
              { emoji: "🤝", label: "Встреча с клиентом", desc: "Договорённости и следующие шаги" },
              { emoji: "👤", label: "Собеседование", desc: "Оценка кандидата и выводы" },
              { emoji: "✏️", label: "Свободный шаблон", desc: "Структура под любую встречу" },
            ].map((t) => (
              <div
                key={t.label}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
              >
                <div className="text-2xl mb-3">{t.emoji}</div>
                <div className="font-medium text-gray-900 text-sm mb-1">{t.label}</div>
                <div className="text-xs text-gray-400">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
            <span className="text-white text-2xl">✦</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Готовы попробовать?
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Сервис сейчас в разработке. Оставьте заявку на доступ —
            мы&nbsp;свяжемся, когда откроем следующий набор пользователей.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-200"
          >
            Запросить доступ
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>© 2026 PM Assist</span>
          <Link href="/login" className="hover:text-gray-600 transition-colors">
            Войти в сервис
          </Link>
        </div>
      </footer>
    </div>
  );
}
