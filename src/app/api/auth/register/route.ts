import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { firstName, lastName, email } = await req.json();

  if (!firstName || !lastName || !email) {
    return NextResponse.json(
      { error: "Заполните имя, фамилию и email" },
      { status: 400 }
    );
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  if (!normalizedEmail.endsWith("@targetai.ai")) {
    return NextResponse.json(
      { error: "Используйте корпоративную почту в домене targetai.ai" },
      { status: 400 }
    );
  }

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

  return NextResponse.json({
    success: true,
    message: "Запрос на доступ отправлен. Мы свяжемся с вами по почте.",
  });
}

