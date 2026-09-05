import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth || auth.role !== "MANAGER") return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  const members = await prisma.user.findMany({ where: { managerId: auth.userId, role: "CLIENT" } });
  return NextResponse.json(members);
}
