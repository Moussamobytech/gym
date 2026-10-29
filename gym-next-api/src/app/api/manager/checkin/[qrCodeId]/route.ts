import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createAndSendNotification } from '@/lib/pushNotifications';

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

    // Enregistrer la notification en BDD (visible sur le web) et envoyer le Push Expo si token mobile present
    await createAndSendNotification({
      userId: user.id,
      title: '✅ Accès Validé',
      message: `Bonjour ${user.firstName || 'Adhérent'}, votre entrée dans la salle a été enregistrée avec succès !`,
      data: { type: 'CHECK_IN', userId: user.id }
    }).catch(err => console.error('Erreur notification checkin:', err));

    return NextResponse.json({ 
      message: 'Check-in réussi pour : ' + (user.firstName || '') + ' ' + (user.lastName || ''),
      user
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
