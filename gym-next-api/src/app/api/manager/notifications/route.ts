import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createAndSendNotificationsBatch } from '@/lib/pushNotifications';

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth || auth.role !== 'MANAGER') {
      return NextResponse.json({ message: 'Non autorise' }, { status: 401 });
    }

    const { title, body } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ message: 'Titre et message requis' }, { status: 400 });
    }

    // Récupérer TOUS les clients de ce gérant (qu'ils soient sur Web ou Mobile)
    const members = await prisma.user.findMany({
      where: {
        managerId: auth.userId,
        role: 'CLIENT',
      },
      select: { id: true, firstName: true }
    });

    if (members.length === 0) {
      return NextResponse.json({
        message: 'Aucun membre rattaché à votre salle.',
        sentCount: 0
      });
    }

    const memberIds = members.map(m => m.id);

    // Enregistrer en BDD pour tous les membres et envoyer les pushs Expo à ceux qui ont un token
    await createAndSendNotificationsBatch({
      userIds: memberIds,
      title,
      message: body,
      data: { type: 'BROADCAST_NOTIFICATION' }
    });

    return NextResponse.json({
      message: `Notification envoyée à ${members.length} membre(s).`,
      sentCount: members.length
    });
  } catch (error) {
    console.error('Erreur diffusion manager:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
