import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { sendExpoPushNotification } from '@/lib/pushNotifications';

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth || auth.role !== 'CLIENT') {
      return NextResponse.json({ message: 'Non autorise' }, { status: 401 });
    }

    const { managerQrCodeId } = await req.json();
    if (!managerQrCodeId || typeof managerQrCodeId !== 'string') {
      return NextResponse.json({ message: 'QR Code de la salle requis' }, { status: 400 });
    }

    const [client, manager] = await Promise.all([
      prisma.user.findUnique({ where: { id: auth.userId } }),
      prisma.user.findUnique({ where: { qrCodeId: managerQrCodeId, role: 'MANAGER' } }),
    ]);

    if (!client || !manager) {
      return NextResponse.json({ message: 'Salle introuvable' }, { status: 404 });
    }

    if (client.managerId !== manager.id) {
      return NextResponse.json({ message: 'Ce QR Code ne correspond pas a votre salle' }, { status: 403 });
    }

    if (client.paymentStatus === 'PENDING') {
      return NextResponse.json({ message: 'Une demande de renouvellement est deja en attente' }, { status: 409 });
    }

    const updatedClient = await prisma.user.update({
      where: { id: client.id },
      data: {
        paymentStatus: 'PENDING',
        subscriptionEndDate: client.subscriptionEndDate || new Date(),
      },
    });

    if (manager.pushToken) {
      sendExpoPushNotification({
        to: manager.pushToken,
        title: 'Nouvelle demande de renouvellement',
        body: `${client.firstName || 'Un client'} ${client.lastName || ''} demande le renouvellement de son abonnement.`,
        data: { type: 'RENEWAL_REQUEST', userId: client.id },
      }).catch(error => console.error('Erreur push renouvellement:', error));
    }

    return NextResponse.json({
      message: 'Demande de renouvellement envoyee au gerant.',
      user: updatedClient,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
