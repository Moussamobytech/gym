import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { Notification } from '../types/data';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function NotificationsScreen() {
  const { authState } = useContext(AuthContext);
  const { webPermissionStatus, requestWebPermission } = usePushNotifications(authState.jwt);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!authState.jwt) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${authState.jwt}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error('Erreur chargement notifications:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [authState.jwt]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id: number) => {
    // Mise à jour optimiste
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authState.jwt}` },
      });
    } catch (e) {
      console.error('Erreur markAsRead:', e);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        item.read ? styles.readCard : styles.unreadCard,
      ]}
      onPress={() => !item.read && markAsRead(item.id)}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={item.read ? 'mail-open-outline' : 'mail'}
          size={24}
          color={item.read ? colors.textSecondary : colors.primary}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.cardTitle, !item.read && styles.boldText]}>
          {item.title}
        </Text>
        <Text style={styles.cardMessage}>{item.message}</Text>
        <Text style={styles.cardDate}>
          {new Date(item.createdAt).toLocaleDateString()}{' '}
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Bannière de permission Web */}
      {Platform.OS === 'web' && webPermissionStatus !== 'granted' && webPermissionStatus !== 'unsupported' && (
        <View style={styles.webBanner}>
          <Ionicons name="notifications-outline" size={24} color={colors.primary} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.webBannerTitle}>Activer les alertes sur ce navigateur</Text>
            <Text style={styles.webBannerText}>
              Recevez les notifications de la salle même si l'onglet est en arrière-plan.
            </Text>
          </View>
          <TouchableOpacity style={styles.webBannerButton} onPress={requestWebPermission}>
            <Text style={styles.webBannerButtonText}>Activer</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Aucune notification pour le moment.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    paddingTop: Platform.OS === 'web' ? 32 : 64,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  webBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.primary + '50',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  webBannerTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  webBannerText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  webBannerButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  webBannerButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadCard: {
    backgroundColor: colors.surface,
    borderColor: colors.primary + '40',
  },
  readCard: {
    backgroundColor: colors.background,
    opacity: 0.8,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: 'bold',
  },
  cardMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    color: colors.textSecondary,
    opacity: 0.7,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    marginLeft: 8,
  },
});
