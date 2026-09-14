import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { ClientTabScreenProps } from '../types/navigation';
import { Training } from '../types/data';
import { API_URL } from '../config';
import { TrainingCard } from '../components/TrainingCard';

type Props = ClientTabScreenProps<'Home'>;

const CATEGORIES = ['Tous', 'Musculation', 'Cardio', 'Yoga', 'CrossFit'];

export default function ClientHomeScreen({ navigation }: Props) {
  const { authState } = useContext(AuthContext);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

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

  const filteredTrainings = trainings.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || 
                            t.name.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.welcomeText}>ESPACE MUSCULATION & COURS</Text>
          <Text style={styles.sectionTitle}>Salles Disponibles ⚡</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
        <TextInput
          placeholder="Rechercher un cours ou une salle..."
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScrollView} contentContainerStyle={styles.categoriesContainer}>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={filteredTrainings}
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
            <View style={styles.emptyContainer}>
              <Ionicons name="barbell-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>Aucun exercice trouvé pour cette recherche.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 24 },
  headerContainer: { marginBottom: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  welcomeText: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  sectionTitle: { color: colors.text, fontSize: 26, fontWeight: '900', letterSpacing: 0.3 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15 },
  categoriesScrollView: { marginHorizontal: -20, paddingHorizontal: 20, marginBottom: 8 },
  categoriesContainer: { flexDirection: 'row', gap: 10, paddingRight: 20 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  categoryTextActive: { color: '#090A0F', fontWeight: '900' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyText: { color: colors.textSecondary, fontSize: 15, textAlign: 'center' }
});
