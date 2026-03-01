import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      status: true,
      isAdmin: true,
      createdAt: true,
      lastLoginAt: true,
      passwordTokens: {
        where: {
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { expiresAt: "desc" },
        take: 1,
        select: { token: true },
      },
    },
  });

  const baseUrl = process.env.APP_BASE_URL ?? "https://pmassist.ru";
  const result = users.map((u) => {
    const token = u.passwordTokens[0];
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      status: u.status,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      setPasswordLink: token
        ? `${baseUrl}/set-password?token=${token.token}`
        : null,
    };
  });

  return NextResponse.json(result);
}
