import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { sendExpoPushNotification } from '@/lib/pushNotifications';

export async function POST(req: NextRequest, { params }: { params: Promise<{ qrCodeId: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth || auth.role !== 'MANAGER') {
      return NextResponse.json({ message: 'Non autorise' }, { status: 401 });
    }
    const { qrCodeId } = await params;
    const user = await prisma.user.findUnique({ where: { qrCodeId } });

    if (!user) {
      return NextResponse.json({ message: 'QR Code invalide !' }, { status: 400 });
    }

    await prisma.checkIn.create({ data: { userId: user.id } });

    // Send push notification if client has a pushToken
    if (user.pushToken) {
      sendExpoPushNotification({
        to: user.pushToken,
        title: '✅ Accès Validé',
        body: `Bonjour ${user.firstName || 'Adhérent'}, votre entrée dans la salle a été enregistrée avec succès !`,
        data: { type: 'CHECK_IN', userId: user.id }
      }).catch(err => console.error('Erreur push checkin:', err));
    }

    return NextResponse.json({ 
      message: 'Check-in réussi pour : ' + (user.firstName || '') + ' ' + (user.lastName || ''),
      user
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}