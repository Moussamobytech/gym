export interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export async function sendExpoPushNotification(message: PushMessage): Promise<boolean> {
  if (!message.to || !message.to.startsWith('ExponentPushToken') && !message.to.startsWith('ExpoPushToken')) {
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
    console.log('Push notification envoyée avec succès:', resData);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la push notification:', error);
    return false;
  }
}

export async function sendExpoPushNotificationsBatch(messages: PushMessage[]): Promise<boolean> {
  const validMessages = messages.filter(m => m.to && (m.to.startsWith('ExponentPushToken') || m.to.startsWith('ExpoPushToken')));
  
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
      body: JSON.stringify(validMessages.map(m => ({
        to: m.to,
        sound: 'default',
        title: m.title,
        body: m.body,
        data: m.data || {},
      }))),
    });

    const resData = await response.json();
    console.log('Batch push notifications envoyées:', resData);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du lot de push notifications:', error);
    return false;
  }
}
