import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { ClientTabScreenProps } from '../types/navigation';
import { API_URL } from '../config';

type Props = ClientTabScreenProps<'Profile'>;

export default function ClientProfileScreen({ navigation }: Props) {
  const { authState, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/client/profile`, {
        headers: { Authorization: `Bearer ${authState.jwt}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'PAID': return 'À jour';
      case 'EXPIRED': return 'Expiré';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Profil</Text>

      {profile && (
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Feather name="user" size={40} color={colors.primary} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{profile.firstName} {profile.lastName}</Text>
              <Text style={styles.phone}>{profile.phoneNumber}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Feather name="activity" size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Statut de l'abonnement</Text>
              <View style={[styles.badge, profile.paymentStatus === 'EXPIRED' && styles.badgeExpired, profile.paymentStatus === 'PENDING' && styles.badgePending]}>
                <Text style={[styles.badgeText, profile.paymentStatus === 'EXPIRED' && styles.badgeTextExpired, profile.paymentStatus === 'PENDING' && styles.badgeTextPending]}>
                  {getStatusLabel(profile.paymentStatus)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Feather name="calendar" size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Inscrit depuis le</Text>
              <Text style={styles.infoValue}>{new Date(profile.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Feather name="clock" size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Fin d'abonnement</Text>
              <Text style={styles.infoValue}>
                {profile.subscriptionEndDate ? new Date(profile.subscriptionEndDate).toLocaleDateString() : 'Non défini'}
              </Text>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Feather name="log-out" size={20} color={colors.error} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>DÉCONNEXION</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    paddingTop: 64,
  },
  title: {
    color: colors.secondary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(137, 180, 250, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phone: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 112, 134, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  badge: { backgroundColor: 'rgba(166, 227, 161, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: colors.secondary, fontWeight: 'bold', fontSize: 12 },
  badgeExpired: { backgroundColor: 'rgba(243, 139, 168, 0.1)' },
  badgeTextExpired: { color: colors.error },
  badgePending: { backgroundColor: 'rgba(250, 179, 135, 0.1)' },
  badgeTextPending: { color: '#FAB387' },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(243, 139, 168, 0.1)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(243, 139, 168, 0.3)',
  },
  logoutText: {
    color: colors.error,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
