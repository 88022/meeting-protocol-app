import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const dbPath = url.startsWith("file:")
  ? path.join(process.cwd(), url.slice("file:".length))
  : url;

const adapter = new PrismaBetterSqlite3({ url: dbPath });
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

