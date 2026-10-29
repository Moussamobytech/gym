import { useState, useEffect, useRef, useCallback } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { API_URL } from '../config';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    } as any),
  });
}

export type WebPermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

export function usePushNotifications(authToken?: string | null) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [webPermission, setWebPermission] = useState<WebPermissionStatus>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      return (window.Notification.permission as WebPermissionStatus) || 'default';
    }
    return 'unsupported';
  });

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const seenNotificationIds = useRef<Set<number>>(new Set());
  const initialFetchDone = useRef(false);

  // === DEMANDE DE PERMISSION WEB NATIVE ===
  const requestWebPermission = useCallback(async (): Promise<WebPermissionStatus> => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const permission = await window.Notification.requestPermission();
      const status = permission as WebPermissionStatus;
      setWebPermission(status);
      return status;
    } catch (e) {
      console.warn('Erreur demande permission notification Web:', e);
      return 'denied';
    }
  }, []);

  // === GESTION MOBILE (EXPO PUSH) ===
  useEffect(() => {
    if (Platform.OS === 'web') return;

    registerForPushNotificationsAsync().then((token) => {
      if (token) setExpoPushToken(token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notif) => {
      setNotification(notif);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification cliquée (Mobile):', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // === GESTION WEB (POLLING & NOTIFICATIONS NAVIGATEUR NATIVES) ===
  useEffect(() => {
    if (Platform.OS !== 'web' || !authToken) return;

    // Fonction de vérification des nouvelles notifications
    const checkWebNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/notifications`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) return;
        const list: Array<{ id: number; title: string; message: string; read: boolean }> = await res.json();

        if (!initialFetchDone.current) {
          // Au premier chargement, mémoriser les notifications déjà existantes
          list.forEach((n) => seenNotificationIds.current.add(n.id));
          initialFetchDone.current = true;
          return;
        }

        // Pour les chargements suivants, repérer les nouvelles notifications non lues
        for (const notif of list) {
          if (!seenNotificationIds.current.has(notif.id) && !notif.read) {
            seenNotificationIds.current.add(notif.id);

            // Si la permission du navigateur est accordée, afficher le pop-up système du navigateur
            if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
              try {
                new window.Notification(notif.title || 'Gym', {
                  body: notif.message,
                  icon: '/assets/icon.png',
                });
              } catch (err) {
                console.warn('Erreur affichage Notification web:', err);
              }
            }
          }
        }
      } catch (err) {
        // Ignorer les erreurs temporaires réseau
      }
    };

    // Première exécution
    checkWebNotifications();

    // Vérifier toutes les 15 secondes
    const interval = setInterval(checkWebNotifications, 15000);

    return () => clearInterval(interval);
  }, [authToken]);

  return {
    expoPushToken,
    notification,
    webPermissionStatus: webPermission,
    requestWebPermission,
  };
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    return null;
  }

  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log("Permission d'envoi des notifications non accordée !");
        return null;
      }
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (projectId) {
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      } else {
        token = (await Notifications.getExpoPushTokenAsync()).data;
      }
      console.log('Expo Push Token généré :', token);
    } catch (e) {
      console.log('Erreur lors de la génération du Push Token:', e);
    }
  } else {
    console.log('Un appareil physique est recommandé pour recevoir les notifications Push');
  }

  return token;
}
