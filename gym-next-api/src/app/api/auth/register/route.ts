import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, phoneNumber, password, managerQrCodeId } = await req.json();
    if (!phoneNumber || !password)
      return NextResponse.json({ message: "Champs requis" }, { status: 400 });

    const exists = await prisma.user.findUnique({ where: { phoneNumber } });
    if (exists)
      return NextResponse.json({ message: "Numero deja utilise" }, { status: 400 });

    let managerId: number | null = null;
    if (managerQrCodeId) {
      const manager = await prisma.user.findUnique({ where: { qrCodeId: managerQrCodeId } });
      if (!manager)
        return NextResponse.json({ message: "Salle introuvable" }, { status: 400 });
      managerId = manager.id;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        firstName, lastName, phoneNumber,
        password: hashed,
        role: managerId ? "CLIENT" : "MANAGER",
        managerId,
        paymentStatus: managerId ? "PENDING" : null,
        subscriptionEndDate: managerId ? new Date() : null,
      }
    });
    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
