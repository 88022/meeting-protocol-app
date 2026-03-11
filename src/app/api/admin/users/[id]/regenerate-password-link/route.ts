import { NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentUser();
  if (!admin || !admin.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 часа

  await prisma.passwordToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  if (user.status !== "ACTIVE" && user.status !== "INVITED") {
    await prisma.user.update({
      where: { id: user.id },
      data: { status: "INVITED" },
    });
  }

  const baseUrl = process.env.APP_BASE_URL ?? "https://pmassist.ru";
  const setPasswordLink = `${baseUrl}/set-password?token=${token}`;

  return NextResponse.json({
    success: true,
    setPasswordLink,
    message: "Новая ссылка для установки пароля создана (действует 24 часа).",
  });
}
