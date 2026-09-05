import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth || auth.role !== 'MANAGER') {
      return NextResponse.json({ message: 'Non autorise' }, { status: 401 });
    }
    const { id } = await params;
    const memberId = parseInt(id);
    const { status } = await req.json();

    const endDate = status === 'PAID'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : status === 'EXPIRED' ? new Date(Date.now() - 86400000) : new Date();

    const member = await prisma.user.update({
      where: { id: memberId },
      data: {
        paymentStatus: status,
        subscriptionEndDate: endDate
      }
    });
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth || auth.role !== 'MANAGER') {
      return NextResponse.json({ message: 'Non autorise' }, { status: 401 });
    }
    const { id } = await params;
    const memberId = parseInt(id);

    await prisma.checkIn.deleteMany({ where: { userId: memberId } });
    await prisma.user.delete({ where: { id: memberId } });

    return NextResponse.json({ message: 'Membre supprime avec succes' });
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}