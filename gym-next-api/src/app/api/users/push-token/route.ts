import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ message: 'Non autorise' }, { status: 401 });
    }
    const { pushToken } = await req.json();

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: { pushToken }
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}