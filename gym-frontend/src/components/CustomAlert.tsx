import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export type AlertType = "success" | "error" | "info" | "warning";

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface CustomAlertProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onClose: () => void;
}

const ICON_MAP: Record<AlertType, { name: any; color: string }> = {
  success: { name: "checkmark-circle", color: colors.primary },
  error:   { name: "close-circle",     color: colors.error },
  warning: { name: "warning",          color: "#FFB347" },
  info:    { name: "information-circle", color: colors.secondary },
};

export const CustomAlert = ({ visible, type = "info", title, message, buttons, onClose }: CustomAlertProps) => {
  const icon = ICON_MAP[type];

  const defaultButtons: AlertButton[] = buttons && buttons.length > 0
    ? buttons
    : [{ text: "OK", onPress: onClose }];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <View style={[styles.iconWrapper, { backgroundColor: icon.color + "1A", borderColor: icon.color + "33" }]}>
            <Ionicons name={icon.name} size={40} color={icon.color} />
          </View>

          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={[styles.buttonsRow, defaultButtons.length === 1 && { justifyContent: "center" }]}>
            {defaultButtons.map((btn, i) => {
              const isDestructive = btn.style === "destructive";
              const isCancel = btn.style === "cancel";
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.btn,
                    defaultButtons.length > 1 && { flex: 1 },
                    isDestructive && styles.btnDestructive,
                    isCancel && styles.btnCancel,
                    !isDestructive && !isCancel && styles.btnPrimary,
                  ]}
                  onPress={() => { onClose(); btn.onPress?.(); }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.btnText,
                    isDestructive && styles.btnTextDestructive,
                    isCancel && styles.btnTextCancel,
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ---- Hook helper to use like Alert.alert -----
import { useState, useCallback } from "react";

interface AlertOptions {
  type?: AlertType;
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

export function useAlert() {
  const [alertState, setAlertState] = useState<AlertOptions & { visible: boolean }>({
    visible: false, type: "info", title: "",
  });

  const showAlert = useCallback((opts: AlertOptions) => {
    setAlertState({ ...opts, visible: true });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }));
  }, []);

  const AlertComponent = (
    <CustomAlert
      visible={alertState.visible}
      type={alertState.type}
      title={alertState.title}
      message={alertState.message}
      buttons={alertState.buttons}
      onClose={hideAlert}
    />
  );

  return { showAlert, AlertComponent };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(9, 10, 15, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  box: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 28,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1.5,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 4,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnCancel: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 24,
  },
  btnDestructive: {
    backgroundColor: "rgba(255, 69, 58, 0.15)",
    borderWidth: 1,
    borderColor: colors.error + "44",
    paddingHorizontal: 24,
  },
  btnText: { color: "#090A0F", fontWeight: "900", fontSize: 15 },
  btnTextCancel: { color: colors.textSecondary, fontWeight: "700" },
  btnTextDestructive: { color: colors.error, fontWeight: "800" },
});
