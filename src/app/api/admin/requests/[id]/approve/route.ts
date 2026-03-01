import { NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSetPasswordEmail } from "@/lib/email";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const requestId = parseInt(id, 10);
  if (Number.isNaN(requestId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const accessRequest = await prisma.accessRequest.findUnique({
    where: { id: requestId },
    include: { user: true },
  });

  if (!accessRequest || accessRequest.status !== "PENDING") {
    return NextResponse.json({ error: "Request not found or already processed" }, { status: 400 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 часа

  await prisma.$transaction([
    prisma.passwordToken.create({
      data: {
        token,
        userId: accessRequest.userId,
        expiresAt,
      },
    }),
    prisma.accessRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedById: user.id,
      },
    }),
    prisma.user.update({
      where: { id: accessRequest.userId },
      data: { status: "INVITED" },
    }),
  ]);

  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const setPasswordLink = `${baseUrl}/set-password?token=${token}`;

  const emailResult = await sendSetPasswordEmail(
    accessRequest.user.email,
    accessRequest.user.firstName,
    setPasswordLink
  );

  return NextResponse.json({
    success: true,
    setPasswordLink,
    emailSent: emailResult.ok,
    message: emailResult.ok
      ? "Письмо со ссылкой отправлено на почту пользователя."
      : emailResult.error
        ? `Заявка одобрена, но письмо не отправлено: ${emailResult.error}. Скопируйте ссылку ниже и отправьте вручную.`
        : "Заявка одобрена. SMTP не настроен — скопируйте ссылку ниже и отправьте пользователю вручную.",
  });
}
