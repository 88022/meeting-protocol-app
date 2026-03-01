/**
 * Один раз установить пароль пользователю по email.
 * Запуск: npx tsx scripts/set-admin-password.ts email@targetai.ai ТвойПароль
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Использование: npx tsx scripts/set-admin-password.ts <email> <пароль>");
  process.exit(1);
}

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const dbPath = url.startsWith("file:")
  ? path.join(process.cwd(), url.slice("file:".length))
  : url;

const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) {
    console.error("Пользователь с таким email не найден:", email);
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, status: "ACTIVE" },
  });

  console.log("Пароль установлен для", email);
  console.log("Можно входить на /login");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
