import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';
import { colors } from '../theme/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'error';
}

export const Button = ({ title, loading = false, variant = 'primary', style, ...rest }: ButtonProps) => {
  const isPrimary = variant === 'primary';
  const bgColor = isPrimary ? colors.primary : variant === 'secondary' ? colors.surface : colors.error;
  const textColor = variant === 'secondary' ? colors.primary : colors.background;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title.toUpperCase()}</Text>
      )}
    </>
  );

  return (
    <TouchableOpacity 
      style={[
        styles.buttonContainer, 
        { backgroundColor: bgColor }, 
        isPrimary && styles.primaryGlow,
        style
      ]} 
      disabled={loading || rest.disabled} 
      activeOpacity={0.8}
      {...rest}
    >
      <View style={styles.contentWrapper}>
        {content}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    height: 56,
    borderRadius: 16,
    marginBottom: 16,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  primaryGlow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});

