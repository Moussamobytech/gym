import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { sendExpoPushNotification } from '@/lib/pushNotifications';

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

    // Send push notification to member if token exists
    if (member.pushToken) {
      const statusLabel = status === 'PAID' ? 'Payé (Actif 30 jours)' : status === 'EXPIRED' ? 'Expiré' : 'En attente';
      sendExpoPushNotification({
        to: member.pushToken,
        title: '💳 Statut d\'Abonnement',
        body: `Votre statut d'abonnement à la salle a été mis à jour : ${statusLabel}`,
        data: { type: 'SUBSCRIPTION_UPDATE', status: member.paymentStatus }
      }).catch(err => console.error('Erreur push abonnement:', err));
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error(error);
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
    console.error(error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}