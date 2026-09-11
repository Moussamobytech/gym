import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthUser(req);
    if (!auth || auth.role !== "MANAGER") {
      return NextResponse.json({ message: "Non autorise" }, { status: 401 });
    }

    const { id } = await params;
    const trainingId = parseInt(id, 10);
    if (Number.isNaN(trainingId)) {
      return NextResponse.json({ message: "Identifiant invalide" }, { status: 400 });
    }

    const training = await prisma.training.findUnique({ where: { id: trainingId } });
    if (!training) {
      return NextResponse.json({ message: "Entrainement introuvable" }, { status: 404 });
    }

    const updated = await prisma.training.update({
      where: { id: trainingId },
      data: { active: !training.active },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
