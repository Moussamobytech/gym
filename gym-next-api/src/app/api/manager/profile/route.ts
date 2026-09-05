import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth || auth.role !== "MANAGER") return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: auth.userId } });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth || auth.role !== "MANAGER") return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  const { firstName, lastName, phoneNumber, profileImageUrl } = await req.json();
  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phoneNumber && { phoneNumber }),
      ...(profileImageUrl && { profileImageUrl }),
    }
  });
  return NextResponse.json(user);
}
