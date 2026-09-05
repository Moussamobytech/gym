import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  const trainings = await prisma.training.findMany();
  return NextResponse.json(trainings);
}
