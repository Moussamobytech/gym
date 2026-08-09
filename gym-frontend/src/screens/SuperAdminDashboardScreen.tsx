import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { API_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { SuperAdminTabScreenProps } from '../types/navigation';
import { User } from '../types/data';

type Props = SuperAdminTabScreenProps<'Dashboard'>;

export default function SuperAdminDashboardScreen({ navigation }: Props) {
  const { authState, logout } = useContext(AuthContext);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'MANAGER' | 'CLIENT'>('ALL');

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${authState.jwt}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const handleDeleteUser = (userId: number) => {
    Alert.alert(
      "Suppression",
      "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action supprimera également tous les membres associés si c'est un gérant.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authState.jwt}` }
              });
              if (res.ok) {
                Alert.alert("Succès", "Utilisateur supprimé.");
                fetchUsers();
              } else {
                const text = await res.text();
                Alert.alert("Erreur", text || "Impossible de supprimer l'utilisateur.");
              }
            } catch (e) {
              Alert.alert("Erreur", "Problème réseau.");
            }
          }
        }
      ]
    );
  };

  const filteredUsers = users.filter(u => filter === 'ALL' || u.role === filter);

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.userPhone}>{item.phoneNumber}</Text>
        </View>
        <View style={[styles.roleBadge, item.role === 'MANAGER' ? styles.badgeManager : styles.badgeClient]}>
          <Text style={[styles.roleText, item.role === 'MANAGER' ? styles.textManager : styles.textClient]}>
            {item.role === 'SUPER_ADMIN' ? 'ADMIN' : item.role}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          Inscrit le {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {item.role !== 'SUPER_ADMIN' && (
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => handleDeleteUser(item.id)}
          >
            <Feather name="trash-2" size={18} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Super Admin</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        {['ALL', 'MANAGER', 'CLIENT'].map(f => (
          <TouchableOpacity 
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f as any)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'ALL' ? 'Tous' : f === 'MANAGER' ? 'Gérants' : 'Clients'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#cba6f7" />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun utilisateur trouvé.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 64 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  title: { color: '#cba6f7', fontSize: 28, fontWeight: '900' },
  logoutButton: { padding: 8, backgroundColor: 'rgba(243, 139, 168, 0.1)', borderRadius: 12 },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16, gap: 12 },
  filterButton: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  filterButtonActive: { backgroundColor: 'rgba(203, 166, 247, 0.1)', borderColor: '#cba6f7' },
  filterText: { color: colors.textSecondary, fontWeight: 'bold' },
  filterTextActive: { color: '#cba6f7' },
  listContainer: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  userInfo: { flex: 1 },
  userName: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  userPhone: { color: colors.textSecondary, fontSize: 14 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeManager: { backgroundColor: 'rgba(249, 226, 175, 0.1)' },
  textManager: { color: colors.secondary, fontWeight: 'bold', fontSize: 12 },
  badgeClient: { backgroundColor: 'rgba(137, 180, 250, 0.1)' },
  textClient: { color: '#89b4fa', fontWeight: 'bold', fontSize: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  dateText: { color: colors.textSecondary, fontSize: 12 },
  deleteButton: { padding: 8, backgroundColor: 'rgba(243, 139, 168, 0.1)', borderRadius: 8 },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: 40, fontSize: 16 }
});
