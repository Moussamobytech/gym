import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { ManagerTabScreenProps } from '../types/navigation';

type Props = ManagerTabScreenProps<'QRCode'>;

export default function ManagerQRCodeScreen({ navigation }: Props) {
  const { authState } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Code de la Salle</Text>
        <Text style={styles.subtitle}>Faites scanner ce code aux clients pour qu'ils s'inscrivent à votre salle.</Text>
      </View>
      <View style={styles.qrCard}>
        <QRCode
          value={`https://gym-lac-zeta.vercel.app/?managerId=${authState.qrCodeId || 'invalid-code'}`}
          size={250}
          color={colors.background}
          backgroundColor={colors.text}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 48 },
  title: { color: colors.secondary, fontSize: 32, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: 16, textAlign: 'center', lineHeight: 24 },
  qrCard: { backgroundColor: colors.text, padding: 32, borderRadius: 30, elevation: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
});
