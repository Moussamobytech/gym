import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ message: "Non autorise" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Erreur GET notifications:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
