import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Switch } from 'react-native';
import { colors } from '../theme/colors';
import { Training } from '../types/data';

interface TrainingCardProps {
  training: Training;
  onPress?: () => void;
  isManager?: boolean;
  onToggleActive?: (id: number) => void;
}

import { API_URL } from '../config';

const LOCAL_IMAGES: Record<string, any> = {
  "musculation.jpg": require('../../assets/trainings/musculation.jpg'),
  "cardio.jpg": require('../../assets/trainings/cardio.jpg'),
  "yoga.jpg": require('../../assets/trainings/yoga.jpg'),
  "crossfit.jpg": require('../../assets/trainings/crossfit.jpg'),
  "zumba.jpg": require('../../assets/trainings/zumba.jpg'),
};

const IMAGE_KEYS = Object.keys(LOCAL_IMAGES);

function getImageKeyFromName(name?: string | null) {
  if (!name) return null;
  const normalizedName = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalizedName.includes('cardio') || normalizedName.includes('tapis') || normalizedName.includes('velo') || normalizedName.includes('rameur') || normalizedName.includes('endurance')) return 'cardio.jpg';
  if (normalizedName.includes('yoga') || normalizedName.includes('relax') || normalizedName.includes('etirement') || normalizedName.includes('souplesse') || normalizedName.includes('pilates')) return 'yoga.jpg';
  if (normalizedName.includes('crossfit') || normalizedName.includes('cross fit') || normalizedName.includes('cross') || normalizedName.includes('hiit')) return 'crossfit.jpg';
  if (normalizedName.includes('zumba') || normalizedName.includes('danse') || normalizedName.includes('dance')) return 'zumba.jpg';
  if (normalizedName.includes('musculation') || normalizedName.includes('muscu') || normalizedName.includes('poids') || normalizedName.includes('force') || normalizedName.includes('haltere') || normalizedName.includes('machine')) return 'musculation.jpg';

  return null;
}

export function getTrainingImageSource(
  imageUrl?: string | null,
  trainingName?: string | null,
  trainingId?: number,
) {
  const trimmedUrl = imageUrl?.trim();
  if (trimmedUrl) {
    const lowerUrl = trimmedUrl.toLowerCase();

    // Check remote, data URI, or file URI
    if (/^(https?:\/\/|data:image\/|file:\/\/)/i.test(trimmedUrl)) {
      return { uri: trimmedUrl };
    }

    // Check relative path starting with /
    if (trimmedUrl.startsWith('/')) {
      const baseUrl = API_URL.replace(/\/api\/?$/, '');
      return { uri: `${baseUrl}${trimmedUrl}` };
    }

    // Check local filenames
    const fileName = lowerUrl.split(/[\\/]/).pop() || '';
    if (fileName && LOCAL_IMAGES[fileName]) {
      return LOCAL_IMAGES[fileName];
    }
    const fileNameWithJpg = `${fileName.replace(/\.(jpg|jpeg|png|webp)$/i, '')}.jpg`;
    if (LOCAL_IMAGES[fileNameWithJpg]) {
      return LOCAL_IMAGES[fileNameWithJpg];
    }
  }

  const imageKey = getImageKeyFromName(trainingName);
  if (imageKey && LOCAL_IMAGES[imageKey]) {
    return LOCAL_IMAGES[imageKey];
  }

  const fallbackIndex = Math.abs(trainingId ?? 0) % IMAGE_KEYS.length;
  return LOCAL_IMAGES[IMAGE_KEYS[fallbackIndex]] || LOCAL_IMAGES["musculation.jpg"];
}

export const TrainingCard = ({ training, onPress, isManager, onToggleActive }: TrainingCardProps) => {
  const imageSource = getTrainingImageSource(training.imageUrl, training.name, training.id);

  return (
    <TouchableOpacity 
      style={styles.cardContainer} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.88}
    >
      <ImageBackground 
        source={imageSource} 
        style={styles.imageBackground}
        imageStyle={styles.image}
        resizeMode="cover"
      >
        <View style={styles.topBadgeRow}>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>
              {training.name.toLowerCase().includes('muscu') ? '🏋️ MUSCULATION' : 
               training.name.toLowerCase().includes('cardio') ? '🏃 CARDIO' : 
               training.name.toLowerCase().includes('yoga') ? '🧘 YOGA' : 
               training.name.toLowerCase().includes('cross') ? '⚡ CROSSFIT' : '🔥 ENTRAÎNEMENT'}
            </Text>
          </View>
          {isManager && (
            <View style={styles.switchContainer}>
              <Text style={[styles.statusText, { color: training.active ? colors.primary : colors.textSecondary }]}>
                {training.active ? 'ACTIF' : 'INACTIF'}
              </Text>
              <Switch
                value={training.active}
                onValueChange={() => onToggleActive && onToggleActive(training.id)}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.primaryDark }}
                thumbColor={training.active ? colors.primary : colors.textSecondary}
              />
            </View>
          )}
        </View>

        <View style={styles.overlay}>
          <Text style={styles.title}>{training.name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {training.description}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 210,
    marginBottom: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: colors.surface,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'space-between',
  },
  image: {
    borderRadius: 24,
  },
  topBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  badgePill: {
    backgroundColor: 'rgba(9, 10, 15, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  badgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 10, 15, 0.85)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  overlay: {
    backgroundColor: 'rgba(9, 10, 15, 0.88)',
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
});
