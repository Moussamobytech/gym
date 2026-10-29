import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ message: "Non autorise" }, { status: 401 });
    }

    const { id } = await params;
    const notificationId = parseInt(id, 10);

    if (isNaN(notificationId)) {
      return NextResponse.json({ message: "ID invalide" }, { status: 400 });
    }

    // Verifier que la notification appartient bien a l'utilisateur
    const existing = await prisma.notification.findFirst({
      where: { id: notificationId, userId: auth.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Notification introuvable" },
        { status: 404 }
      );
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return NextResponse.json({ success: true, notification: updated });
  } catch (error) {
    console.error("Erreur PUT mark notification as read:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
