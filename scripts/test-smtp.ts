/**
 * Проверка SMTP: подключение и отправка тестового письма.
 * Запуск на сервере: cd /var/www/pmassist && npx tsx scripts/test-smtp.ts ваш@email.targetai.ai
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import nodemailer from "nodemailer";

const testTo = process.argv[2] || process.env.EMAIL_FROM;

if (!testTo) {
  console.error("Укажите email получателя: npx tsx scripts/test-smtp.ts ваш@email.targetai.ai");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
});

async function main() {
  console.log("Проверка SMTP...");
  console.log("  SMTP_HOST:", process.env.SMTP_HOST || "(не задан)");
  console.log("  SMTP_PORT:", process.env.SMTP_PORT ?? 587);
  console.log("  EMAIL_FROM:", process.env.EMAIL_FROM || "(не задан)");
  console.log("  Отправка на:", testTo);
  console.log("");

  if (!process.env.SMTP_HOST || !process.env.EMAIL_FROM) {
    console.error("Ошибка: в .env должны быть SMTP_HOST и EMAIL_FROM.");
    process.exit(1);
  }

  try {
    await transporter.verify();
    console.log("Подключение к SMTP серверу — OK.");
  } catch (e) {
    console.error("Ошибка подключения к SMTP:", e instanceof Error ? e.message : e);
    process.exit(1);
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: testTo,
      subject: "PM Assist — тестовое письмо",
      text: "Если вы получили это письмо, SMTP настроен верно.",
    });
    console.log("Тестовое письмо отправлено на", testTo);
  } catch (e) {
    console.error("Ошибка отправки:", e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main();
