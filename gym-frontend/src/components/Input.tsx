import React, { useState } from 'react';
import { TextInput, StyleSheet, TextInputProps, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface InputProps extends TextInputProps {}

export const Input = ({ style, secureTextEntry, onFocus, onBlur, ...rest }: InputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPasswordInput = secureTextEntry !== undefined && secureTextEntry !== false;

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input, 
          style, 
          isPasswordInput && styles.inputWithIcon,
          isFocused && styles.inputFocused
        ]}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={isPasswordInput ? !isPasswordVisible : false}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus && onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur && onBlur(e);
        }}
        {...rest}
      />
      {isPasswordInput && (
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Ionicons
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={24}
            color={isFocused ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    height: 60,
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    fontSize: 16,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputWithIcon: {
    paddingRight: 50,
  },
  iconContainer: {
    position: 'absolute',
    right: 16,
    top: 18,
    zIndex: 1,
  },
});
