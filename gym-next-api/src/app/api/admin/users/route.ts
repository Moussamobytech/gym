import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Non autorise' }, { status: 401 });
    }
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Non autorise' }, { status: 401 });
    }
    const { firstName, lastName, phoneNumber, password, managerQrCodeId } = await req.json();

    if (!phoneNumber || !password) {
      return NextResponse.json({ message: 'Champs requis' }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { phoneNumber } });
    if (exists) {
      return NextResponse.json({ message: 'Ce numero est deja utilise' }, { status: 400 });
    }

    let managerId = null;
    let role = 'MANAGER';
    if (managerQrCodeId && managerQrCodeId.trim()) {
      const manager = await prisma.user.findUnique({ where: { qrCodeId: managerQrCodeId.trim() } });
      if (!manager) {
        return NextResponse.json({ message: 'Manager introuvable pour ce QR Code' }, { status: 400 });
      }
      managerId = manager.id;
      role = 'CLIENT';
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phoneNumber,
        password: hashedPassword,
        role: role as any,
        managerId,
        paymentStatus: role === 'CLIENT' ? 'PENDING' : null,
        subscriptionEndDate: role === 'CLIENT' ? new Date() : null,
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}