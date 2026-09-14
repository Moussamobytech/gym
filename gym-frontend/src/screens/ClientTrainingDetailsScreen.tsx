import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { RootStackScreenProps } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { getTrainingImageSource } from '../components/TrainingCard';

type Props = RootStackScreenProps<'ClientTrainingDetails'>;

export default function ClientTrainingDetailsScreen({ route, navigation }: Props) {
  const { training } = route.params;

  return (
    <View style={styles.container}>
      <ImageBackground source={getTrainingImageSource(training.imageUrl, training.name, training.id)} style={styles.headerImage}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{training.name}</Text>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
            <Text style={styles.statusText}>Salle Ouverte</Text>
          </View>
        </View>

        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <Ionicons name="time-outline" size={22} color={colors.primary} />
            <Text style={styles.featureValue}>Illimité</Text>
            <Text style={styles.featureLabel}>Durée</Text>
          </View>
          <View style={styles.featureCard}>
            <Ionicons name="flame-outline" size={22} color={colors.secondary} />
            <Text style={styles.featureValue}>Tous Niveaux</Text>
            <Text style={styles.featureLabel}>Intensité</Text>
          </View>
          <View style={styles.featureCard}>
            <Ionicons name="fitness-outline" size={22} color={colors.accent} />
            <Text style={styles.featureValue}>Complet</Text>
            <Text style={styles.featureLabel}>Matériel</Text>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>À propos du programme</Text>
        <Text style={styles.description}>{training.description}</Text>
        
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.enterButton} onPress={() => navigation.goBack()}>
            <Text style={styles.enterText}>VOIR LES AUTRES SALLES</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerImage: { width: '100%', height: 320, justifyContent: 'flex-start' },
  overlay: { flex: 1, backgroundColor: 'rgba(9, 10, 15, 0.45)', padding: 20, paddingTop: 48 },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(9, 10, 15, 0.75)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  content: { flex: 1, padding: 24, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background, marginTop: -28 },
  headerRow: { marginBottom: 20 },
  title: { fontSize: 30, fontWeight: '900', color: colors.text, marginBottom: 10, letterSpacing: 0.3 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212, 255, 0, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(212, 255, 0, 0.2)' },
  statusText: { color: colors.primary, marginLeft: 6, fontWeight: '800', fontSize: 12 },
  featuresGrid: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  featureCard: { flex: 1, backgroundColor: colors.surface, padding: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  featureValue: { color: colors.text, fontSize: 13, fontWeight: '800', marginTop: 6 },
  featureLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.primary, marginBottom: 12, letterSpacing: 0.5 },
  description: { fontSize: 15, color: colors.textSecondary, lineHeight: 24, marginBottom: 32 },
  actionContainer: { marginBottom: 32 },
  enterButton: { backgroundColor: colors.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  enterText: { color: '#090A0F', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
});
