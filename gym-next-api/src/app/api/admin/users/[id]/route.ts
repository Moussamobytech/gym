import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Non autorise' }, { status: 401 });
    }
    const { id } = await params;
    const userId = parseInt(id);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur introuvable.' }, { status: 404 });
    }
    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Impossible de supprimer un Super Admin.' }, { status: 400 });
    }

    await prisma.checkIn.deleteMany({ where: { userId } });

    if (user.role === 'MANAGER') {
      const clients = await prisma.user.findMany({ where: { managerId: userId } });
      for (const client of clients) {
        await prisma.checkIn.deleteMany({ where: { userId: client.id } });
        await prisma.user.delete({ where: { id: client.id } });
      }
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ message: 'Utilisateur supprime avec succes.' });
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}