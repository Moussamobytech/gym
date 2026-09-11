import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ message: "Non autorise" }, { status: 401 });

    const trainings = await prisma.training.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(trainings);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
