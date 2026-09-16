import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Modal } from "react-native";
import { colors } from "../theme/colors";

interface AppLoaderProps {
  visible?: boolean;
  message?: string;
  fullScreen?: boolean;
}

export const AppLoader = ({ visible = true, message, fullScreen = false }: AppLoaderProps) => {
  const pulse = useRef(new Animated.Value(0.5)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 1200, useNativeDriver: true })
    ).start();
  }, []);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const content = (
    <View style={styles.loaderBox}>
      <View style={styles.spinnerWrapper}>
        <Animated.View style={[styles.spinnerOuter, { transform: [{ rotate: spin }] }]} />
        <Animated.View style={[styles.spinnerInner, { opacity: pulse }]} />
        <View style={styles.spinnerCenter}>
          <Text style={styles.spinnerIcon}>?</Text>
        </View>
      </View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );

  if (fullScreen) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>{content}</View>
      </Modal>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  inlineContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  overlay: { flex: 1, backgroundColor: "rgba(9, 10, 15, 0.92)", justifyContent: "center", alignItems: "center" },
  loaderBox: { alignItems: "center" },
  spinnerWrapper: { width: 80, height: 80, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  spinnerOuter: {
    position: "absolute", width: 76, height: 76, borderRadius: 38,
    borderWidth: 3, borderColor: "transparent",
    borderTopColor: colors.primary, borderRightColor: colors.primary + "55",
  },
  spinnerInner: {
    position: "absolute", width: 56, height: 56, borderRadius: 28,
    borderWidth: 2, borderColor: "transparent",
    borderBottomColor: colors.secondary, borderLeftColor: colors.secondary + "55",
  },
  spinnerCenter: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface, justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: colors.border,
  },
  spinnerIcon: { fontSize: 16 },
  message: { color: colors.textSecondary, fontSize: 14, fontWeight: "600", textAlign: "center", letterSpacing: 0.5 },
});
