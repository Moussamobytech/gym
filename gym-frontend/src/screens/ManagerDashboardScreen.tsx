import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { ManagerTabScreenProps } from '../types/navigation';
import { Training } from '../types/data';
import { API_URL } from '../config';
import { TrainingCard } from '../components/TrainingCard';

import { Ionicons } from '@expo/vector-icons';

import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'react-native';

type Props = ManagerTabScreenProps<'Dashboard'>;

export default function ManagerDashboardScreen({ navigation }: Props) {
  const { logout, authState } = useContext(AuthContext);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>('');

  const fetchTrainings = async () => {
    try {
      const res = await fetch(`${API_URL}/trainings`, {
        headers: { Authorization: `Bearer ${authState.jwt}` }
      });
      const data = await res.json();
      setTrainings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchProfile = async () => {
        try {
          const res = await fetch(`${API_URL}/manager/profile`, {
            headers: { Authorization: `Bearer ${authState.jwt}` }
          });
          if (res.ok) {
            const data = await res.json();
            setProfileImageUrl(data.profileImageUrl || null);
            setFirstName(data.firstName || '');
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchProfile();
    }, [authState.jwt])
  );

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleToggle = async (id: number) => {
    setTrainings(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
    try {
      await fetch(`${API_URL}/trainings/${id}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authState.jwt}` }
      });
    } catch (e) {
      console.error(e);
      fetchTrainings(); // revert on fail
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {firstName ? `Bonjour, ${firstName}` : 'Salles & Cours'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={28} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => (navigation as any).navigate('ManagerProfile')}>
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
            ) : (
              <Ionicons name="person-circle-outline" size={40} color={colors.secondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={trainings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TrainingCard 
              training={item} 
              isManager 
              onToggleActive={handleToggle} 
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 64 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { color: colors.secondary, fontSize: 24, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  logoutText: { color: colors.error, fontWeight: 'bold' }
});
