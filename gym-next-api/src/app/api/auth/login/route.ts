import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, password } = await req.json();
    if (!phoneNumber || !password)
      return NextResponse.json({ message: "Champs requis" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { phoneNumber } });
    if (!user)
      return NextResponse.json({ message: "Utilisateur non trouve" }, { status: 404 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return NextResponse.json({ message: "Mot de passe incorrect" }, { status: 401 });

    const token = signToken({ userId: user.id, phoneNumber: user.phoneNumber, role: user.role });
    return NextResponse.json({ jwt: token, role: user.role, qrCodeId: user.qrCodeId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
