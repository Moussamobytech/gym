import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  const trainings = await prisma.training.findMany({
    where: { active: true },
    orderBy: { id: "asc" },
  });
  return NextResponse.json(trainings);
}
