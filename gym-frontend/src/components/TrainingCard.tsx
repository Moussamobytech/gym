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

const LOCAL_IMAGES: Record<string, any> = {
  "musculation.jpg": require('../../assets/trainings/musculation.jpg'),
  "cardio.jpg": require('../../assets/trainings/cardio.jpg'),
  "yoga.jpg": require('../../assets/trainings/yoga.jpg'),
  "crossfit.jpg": require('../../assets/trainings/crossfit.jpg'),
  "zumba.jpg": require('../../assets/trainings/zumba.jpg'),
};

export const TrainingCard = ({ training, onPress, isManager, onToggleActive }: TrainingCardProps) => {
  const imageSource = LOCAL_IMAGES[training.imageUrl] || { uri: training.imageUrl };

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
