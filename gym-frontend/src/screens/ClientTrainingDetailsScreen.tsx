import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { RootStackScreenProps } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';

type Props = RootStackScreenProps<'ClientTrainingDetails'>;

export default function ClientTrainingDetailsScreen({ route, navigation }: Props) {
  const { training } = route.params;

  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: training.imageUrl }} style={styles.headerImage}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>{training.name}</Text>
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
          <Text style={styles.statusText}>Salle Ouverte</Text>
        </View>
        
        <Text style={styles.sectionTitle}>À propos de l'entraînement</Text>
        <Text style={styles.description}>{training.description}</Text>
        
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.enterButton} onPress={() => navigation.goBack()}>
            <Text style={styles.enterText}>RETOURNER À L'ACCUEIL</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerImage: { width: '100%', height: 300, justifyContent: 'flex-start' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', padding: 24, paddingTop: 48 },
  backButton: { width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.background, marginTop: -24 },
  title: { fontSize: 32, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(166, 227, 161, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 24 },
  statusText: { color: colors.secondary, marginLeft: 6, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 12 },
  description: { fontSize: 16, color: colors.textSecondary, lineHeight: 24, marginBottom: 32 },
  actionContainer: { marginTop: 32, paddingBottom: 24 },
  enterButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  enterText: { color: colors.text, fontWeight: 'bold', letterSpacing: 1 },
});
