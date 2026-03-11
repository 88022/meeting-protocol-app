import { NextResponse } from "next/server";
import OpenAI from "openai";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

console.log(
  "OPENAI_API_KEY starts with:",
  process.env.OPENAI_API_KEY?.slice(0, 5)
);
console.log("HTTP_PROXY is set:", !!process.env.HTTP_PROXY);

const proxyAgent = process.env.HTTP_PROXY
  ? new HttpsProxyAgent(process.env.HTTP_PROXY)
  : undefined;

function customFetch(
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : (input as unknown as Request).url;
  // node-fetch RequestInit differs from global; proxy agent is Node-only
  return fetch(url, { ...init, agent: proxyAgent } as Parameters<typeof fetch>[1]) as unknown as Promise<Response>;
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 120000,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetch: customFetch as any,
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Нужен файл .txt" }, { status: 400 });
    }

    const fullText = await file.text();
    const text =
      fullText.length > 20000 ? fullText.slice(0, 20000) : fullText;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Ты помощник-проектный менеджер. Из полной транскрипции встречи составь ПРОТОКОЛ договорённостей строго по шаблону и с правильными переносами строк.\n\n" +

        "ИСТОЧНИК И ПРАВИЛА:\n" +
        "- Используй только то, что явно прозвучало в транскрипции.\n" +
        "- НИКОГДА не выдумывай сроки, время, даты, ответственных, должности и уточнения.\n" +
        "- Если срок/ответственный не указаны — соответствующую строку НЕ выводи.\n\n" +

        "ЕДИНЫЙ СТАНДАРТ:\n" +
        "- Нумерация пунктов: строго `1.` `2.` `3.` (точка после номера).\n" +
        "- Ответственный: строго `Отв. <как в тексте>`.\n\n" +

        "СТРОГИЙ ШАБЛОН ВЫВОДА:\n" +
        "Коллеги, спасибо за встречу!\n\n" +
        "Итоги и договоренности:\n\n" +

        "Далее пункты протокола.\n\n" +

        "ПРАВИЛА ПЕРЕНОСОВ СТРОК (ОЧЕНЬ ВАЖНО):\n" +
        "- ВНУТРИ одного пункта (между действием / сроком / отв.) НЕ ДОЛЖНО быть пустых строк: только перенос строки `\\n`.\n" +
        "- МЕЖДУ разными пунктами должна быть ровно одна пустая строка: `\\n\\n`.\n\n" +

        "ФОРМАТ КАЖДОГО ПУНКТА:\n" +
        "N. <Действие одним-двумя предложениями, начинай с глагола в инфинитиве>\n" +
        "Срок: <как в транскрипции: \"до ДД.ММ, ЧЧ:ММ\" или \"к ДД.ММ, ЧЧ:ММ\" или \"ДД.ММ, ЧЧ:ММ\" или только дата/время/словами>\n" +
        "Отв. <как в транскрипции>\n\n" +

        "ПРАВИЛА ПРО СРОК И ОТВЕТСТВЕННОГО:\n" +
        "- Если есть срок, но нет ответственного:\n" +
        "  N. <Действие>\n" +
        "  Срок: <...>\n\n" +
        "- Если есть ответственный, но нет срока:\n" +
        "  N. <Действие>\n" +
        "  Отв. <...>\n\n" +
        "- Если нет ни срока, ни ответственного:\n" +
        "  N. <Действие>\n\n" +

        "СОДЕРЖАНИЕ ДЕЙСТВИЯ:\n" +
        "- Коротко и по делу, 1–2 предложения.\n" +
        "- Начинай с глагола: \"Согласовать\", \"Подготовить\", \"Отправить\", \"Собрать\", \"Проверить\", \"Создать\" и т.п.\n" +
        "- Если договорённость повторяется — не дублируй.\n\n" +

        "НОРМАЛИЗАЦИЯ:\n" +
        "- Не переводить \"завтра/в четверг/на следующей неделе\" в даты — оставлять как в транскрипции.\n" +
        "- Если в сроке указана календарная дата (ДД.ММ или ДД.ММ.ГГГГ), выводи её в формате `ДД.ММ` (или `ДД.ММ.ГГГГ`, если год явно был в тексте). Если вместе с датой явно указано время — добавь `, ЧЧ:ММ`. Если время не указано — пиши только дату.\n" +
        "- Сохраняй написание имён/инициалов как в транскрипции.\n\n" +

        "ВЫВОД:\n" +
        "- Выведи ТОЛЬКО протокол (обычный текст), без markdown, без комментариев и пояснений.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const protocolText = response.output_text ?? "";

    await prisma.protocolLog.create({
      data: {
        userId: user.id,
        originalFilename: file.name,
      },
    });

    return NextResponse.json({ protocol: protocolText });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Ошибка при генерации протокола" },
      { status: 500 }
    );
  }
}