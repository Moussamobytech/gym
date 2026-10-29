import { prisma } from '@/lib/prisma';

export interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export async function sendExpoPushNotification(message: PushMessage): Promise<boolean> {
  if (!message.to || (!message.to.startsWith('ExponentPushToken') && !message.to.startsWith('ExpoPushToken'))) {
    console.log('Token push Expo invalide ou manquant:', message.to);
    return false;
  }

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: message.to,
        sound: 'default',
        title: message.title,
        body: message.body,
        data: message.data || {},
      }),
    });

    const resData = await response.json();
    console.log('Push notification envoyee avec succes:', resData);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de la push notification:", error);
    return false;
  }
}

export async function sendExpoPushNotificationsBatch(messages: PushMessage[]): Promise<boolean> {
  const validMessages = messages.filter(
    (m) => m.to && (m.to.startsWith('ExponentPushToken') || m.to.startsWith('ExpoPushToken'))
  );

  if (validMessages.length === 0) {
    return false;
  }

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        validMessages.map((m) => ({
          to: m.to,
          sound: 'default',
          title: m.title,
          body: m.body,
          data: m.data || {},
        }))
      ),
    });

    const resData = await response.json();
    console.log('Batch push notifications envoyees:', resData);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi du lot de push notifications:", error);
    return false;
  }
}

/**
 * Cree une notification en base de donnees (visible sur le Web & Mobile)
 * et envoie une notification push Expo si l'utilisateur a un token valide.
 */
export async function createAndSendNotification(params: {
  userId: number;
  title: string;
  message: string;
  data?: Record<string, any>;
}) {
  const { userId, title, message, data } = params;

  try {
    // 1. Enregistrer dans la base de donnees (pour affichage Web et Mobile)
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });

    // 2. Recuperer le token push de l'utilisateur pour l'alerte mobile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushToken: true },
    });

    if (user?.pushToken) {
      sendExpoPushNotification({
        to: user.pushToken,
        title,
        body: message,
        data: { notificationId: notification.id, ...(data || {}) },
      }).catch((err) => console.error('Erreur push Expo:', err));
    }

    return notification;
  } catch (error) {
    console.error('Erreur createAndSendNotification:', error);
    throw error;
  }
}

/**
 * Cree des notifications en lot dans la base de donnees pour plusieurs utilisateurs
 * et envoie les pushs Expo en lot a ceux qui ont un token.
 */
export async function createAndSendNotificationsBatch(params: {
  userIds: number[];
  title: string;
  message: string;
  data?: Record<string, any>;
}) {
  const { userIds, title, message, data } = params;
  if (!userIds || userIds.length === 0) return;

  try {
    // 1. Creer en lot en base de donnees
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title,
        message,
      })),
    });

    // 2. Trouver les utilisateurs ayant un pushToken Expo
    const usersWithTokens = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        pushToken: { not: null },
      },
      select: { pushToken: true },
    });

    const pushMessages: PushMessage[] = usersWithTokens
      .filter((u) => u.pushToken)
      .map((u) => ({
        to: u.pushToken!,
        title,
        body: message,
        data: data || {},
      }));

    if (pushMessages.length > 0) {
      await sendExpoPushNotificationsBatch(pushMessages);
    }
  } catch (error) {
    console.error('Erreur createAndSendNotificationsBatch:', error);
    throw error;
  }
}
