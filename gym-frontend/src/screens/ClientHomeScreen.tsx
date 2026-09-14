import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { ClientTabScreenProps } from '../types/navigation';
import { Training } from '../types/data';
import { API_URL } from '../config';
import { TrainingCard } from '../components/TrainingCard';

type Props = ClientTabScreenProps<'Home'>;

export default function ClientHomeScreen({ navigation }: Props) {
  const { authState } = useContext(AuthContext);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveTrainings = async () => {
    try {
      const headers = { Authorization: `Bearer ${authState.jwt}` };
      let res = await fetch(`${API_URL}/trainings/active`, { headers });
      let data = await res.json();

      if (!Array.isArray(data)) {
        res = await fetch(`${API_URL}/client/trainings`, { headers });
        data = await res.json();
      }

      const list = Array.isArray(data) ? data : [];
      setTrainings(list.filter((t: Training) => t.active !== false));
    } catch (e) {
      console.error(e);
      setTrainings([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActiveTrainings();
    }, [authState.jwt])
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.sectionTitle}>Salles & Cours Disponibles</Text>
      <Text style={styles.subtitle}>Découvrez les entraînements du moment</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={trainings}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <TrainingCard 
              training={item} 
              onPress={() => navigation.navigate('ClientTrainingDetails', { training: item })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun exercice disponible pour le moment.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 16 },
  headerContainer: { marginBottom: 16 },
  sectionTitle: { color: colors.primary, fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: colors.textSecondary, fontSize: 14 },
  emptyText: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 24 }
});
