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
      activeOpacity={0.85}
    >
      <ImageBackground 
        source={imageSource} 
        style={styles.imageBackground}
        imageStyle={styles.image}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>{training.name}</Text>
            {isManager && (
              <View style={styles.switchContainer}>
                <Switch
                  value={training.active}
                  onValueChange={() => onToggleActive && onToggleActive(training.id)}
                  trackColor={{ false: colors.border, true: colors.primaryDark }}
                  thumbColor={training.active ? colors.primary : colors.textSecondary}
                />
              </View>
            )}
          </View>
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
    height: 200,
    marginBottom: 24,
    borderRadius: 24,
    elevation: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    backgroundColor: colors.surface,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  image: {
    borderRadius: 24,
  },
  overlay: {
    backgroundColor: 'rgba(5, 5, 5, 0.75)',
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  switchContainer: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 2,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
