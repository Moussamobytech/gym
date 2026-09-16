import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { ManagerTabScreenProps } from '../types/navigation';
import { Training } from '../types/data';
import { API_URL } from '../config';
import { TrainingCard } from '../components/TrainingCard';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

type Props = ManagerTabScreenProps<'Dashboard'>;

export default function ManagerDashboardScreen({
  navigation,
}: Props) {
  const { authState } = useContext(AuthContext);

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>('');

  /**
   * Récupération des entraînements
   */
  const fetchTrainings = async (isRefresh = false) => {
    if (!authState.jwt) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const headers = {
        Authorization: `Bearer ${authState.jwt}`,
      };

      let res = await fetch(`${API_URL}/trainings`, { headers });
      let data = await res.json();

      // Fallback client
      if (!Array.isArray(data)) {
        res = await fetch(`${API_URL}/client/trainings`, { headers });
        data = await res.json();
      }

      setTrainings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Erreur récupération trainings:', e);
      setTrainings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Récupération du profil manager
   */
  useFocusEffect(
    React.useCallback(() => {
      const fetchProfile = async () => {
        if (!authState.jwt) return;

        try {
          const res = await fetch(`${API_URL}/manager/profile`, {
            headers: {
              Authorization: `Bearer ${authState.jwt}`,
            },
          });

          if (res.ok) {
            const data = await res.json();

            setProfileImageUrl(data.profileImageUrl || null);
            setFirstName(data.firstName || '');
          }
        } catch (e) {
          console.error('Erreur récupération profil:', e);
        }
      };

      fetchProfile();
    }, [authState.jwt])
  );

  /**
   * Chargement initial
   */
  useEffect(() => {
    fetchTrainings();
  }, [authState.jwt]);

  /**
   * Activation / désactivation d'un entraînement
   */
  const handleToggle = async (id: number) => {
    const previousTrainings = [...trainings];

    // Optimistic update
    setTrainings(prev =>
      prev.map(training =>
        training.id === id
          ? {
              ...training,
              active: !training.active,
            }
          : training
      )
    );

    try {
      const response = await fetch(`${API_URL}/trainings/${id}/toggle`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authState.jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error('Impossible de modifier le statut');
      }
    } catch (e) {
      console.error('Erreur toggle training:', e);

      // Retour à l'état précédent
      setTrainings(previousTrainings);
    }
  };

  /**
   * Statistiques
   */
  const totalTrainings = trainings.length;

  const activeTrainings = trainings.filter(
    training => training.active
  ).length;

  const inactiveTrainings = trainings.filter(
    training => !training.active
  ).length;

  /**
   * Rafraîchissement
   */
  const handleRefresh = () => {
    fetchTrainings(true);
  };

  /**
   * Header du dashboard
   */
  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.greetingRow}>
            <Text style={styles.greetingSmall}>ESPACE MANAGER</Text>

            <View style={styles.statusDot} />
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {firstName
              ? `Bonjour, ${firstName}`
              : 'Salles & Cours'}
          </Text>

          <Text style={styles.subtitle}>
            Gérez vos entraînements et votre salle.
          </Text>
        </View>

        <View style={styles.headerActions}>
          {/* Notifications */}
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.75}
            onPress={() =>
              (navigation as any).navigate('Notifications')
            }
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.secondary}
            />

            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>!</Text>
            </View>
          </TouchableOpacity>

          {/* Profil */}
          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.8}
            onPress={() =>
              (navigation as any).navigate('ManagerProfile')
            }
          >
            {profileImageUrl ? (
              <Image
                source={{ uri: profileImageUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons
                  name="person"
                  size={21}
                  color={colors.primary}
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Ligne décorative */}
      <View style={styles.headerLine}>
        <View style={styles.headerLineActive} />
      </View>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons
              name="barbell-outline"
              size={20}
              color={colors.primary}
            />
          </View>

          <Text style={styles.statValue}>
            {totalTrainings}
          </Text>

          <Text style={styles.statLabel}>
            TOTAL
          </Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={colors.primary}
            />
          </View>

          <Text style={styles.statValue}>
            {activeTrainings}
          </Text>

          <Text style={styles.statLabel}>
            ACTIFS
          </Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons
              name="pause-circle-outline"
              size={20}
              color={colors.textSecondary}
            />
          </View>

          <Text style={styles.statValue}>
            {inactiveTrainings}
          </Text>

          <Text style={styles.statLabel}>
            INACTIFS
          </Text>
        </View>
      </View>

      {/* Titre section */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Vos entraînements
          </Text>

          <Text style={styles.sectionSubtitle}>
            Activez ou désactivez vos programmes
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {totalTrainings}
          </Text>
        </View>
      </View>
    </>
  );

  /**
   * État vide
   */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name="barbell-outline"
          size={38}
          color={colors.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>
        Aucun entraînement
      </Text>

      <Text style={styles.emptyText}>
        Aucun exercice n'est actuellement enregistré
        dans votre espace.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <Ionicons
              name="barbell-outline"
              size={30}
              color={colors.primary}
            />
          </View>

          <ActivityIndicator
            size="small"
            color={colors.primary}
          />

          <Text style={styles.loadingText}>
            Chargement de votre espace...
          </Text>
        </View>
      ) : (
        <FlatList
          data={trainings}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TrainingCard
              training={item}
              isManager
              onToggleActive={handleToggle}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            trainings.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
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
    paddingHorizontal: 20,
    paddingTop: 58,
  },

  listContent: {
    paddingBottom: 30,
  },

  listContentEmpty: {
    flexGrow: 1,
  },

  /* =========================
     HEADER
  ========================= */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  headerLeft: {
    flex: 1,
    paddingRight: 14,
  },

  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  greetingSmall: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },

  title: {
    color: colors.secondary,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  notificationBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationBadgeText: {
    color: colors.background,
    fontSize: 8,
    fontWeight: '900',
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },

  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 13,
  },

  profilePlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* =========================
     HEADER LINE
  ========================= */

  headerLine: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 18,
    overflow: 'hidden',
  },

  headerLineActive: {
    width: 55,
    height: 2,
    backgroundColor: colors.primary,
  },

  /* =========================
     STATISTIQUES
  ========================= */

  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 26,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
    minHeight: 105,
  },

  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 165, 0, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  statValue: {
    color: colors.secondary,
    fontSize: 23,
    fontWeight: '900',
  },

  statLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },

  /* =========================
     SECTION
  ========================= */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  sectionTitle: {
    color: colors.secondary,
    fontSize: 19,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },

  countBadge: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 165, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },

  /* =========================
     LOADING
  ========================= */

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 12,
  },

  /* =========================
     EMPTY STATE
  ========================= */

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 80,
  },

  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 165, 0, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 7,
  },

  emptyText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 280,
  },
});