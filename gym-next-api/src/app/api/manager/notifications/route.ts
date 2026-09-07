import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { sendExpoPushNotificationsBatch } from '@/lib/pushNotifications';

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

    // Get all clients linked to this manager who have a pushToken
    const members = await prisma.user.findMany({
      where: {
        managerId: auth.userId,
        role: 'CLIENT',
        pushToken: { not: null }
      },
      select: { pushToken: true, firstName: true }
    });

    const messages = members
      .filter(m => m.pushToken)
      .map(m => ({
        to: m.pushToken!,
        title: title,
        body: body,
        data: { type: 'BROADCAST_NOTIFICATION' }
      }));

    if (messages.length > 0) {
      await sendExpoPushNotificationsBatch(messages);
    }

    return NextResponse.json({
      message: `Notification envoyée à ${messages.length} membres.`,
      sentCount: messages.length
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
