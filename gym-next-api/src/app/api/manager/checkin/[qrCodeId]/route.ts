import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ qrCodeId: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth || auth.role !== 'MANAGER') {
      return NextResponse.json({ message: 'Non autorise' }, { status: 401 });
    }
    const { qrCodeId } = await params;
    const user = await prisma.user.findUnique({ where: { qrCodeId } });

    if (!user) {
      return NextResponse.json({ message: 'Invalid QR Code!' }, { status: 400 });
    }

    await prisma.checkIn.create({ data: { userId: user.id } });
    return NextResponse.json({ message: 'Check-in successful for user: ' + (user.firstName || '') + ' ' + (user.lastName || '') });
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}