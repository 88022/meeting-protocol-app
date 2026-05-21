import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendRequestReceivedEmail,
  sendNewRequestNotificationToAdmins,
} from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email } = body ?? {};

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Заполните имя, фамилию и email" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с такой почтой уже существует" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        status: "PENDING",
      },
    });

    await prisma.accessRequest.create({
      data: {
        userId: user.id,
        status: "PENDING",
      },
    });

    // Письмо заявителю и уведомление админам (не блокируем ответ при ошибке почты)
    const applicantName = `${user.firstName} ${user.lastName}`.trim();
    sendRequestReceivedEmail(user.email, user.firstName).catch(() => {});
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { email: true },
    });
    sendNewRequestNotificationToAdmins(
      admins.map((a) => a.email),
      user.email,
      applicantName
    ).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Запрос на доступ отправлен. Мы свяжемся с вами по почте.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("Register error:", message, stack);
    return NextResponse.json(
      { error: "Ошибка сервера. Попробуйте позже." },
      { status: 500 }
    );
  }
}

