import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { ManagerTabScreenProps } from '../types/navigation';

type Props = ManagerTabScreenProps<'QRCode'>;

export default function ManagerQRCodeScreen({
  navigation,
}: Props) {
  const { authState } = useContext(AuthContext);

  const qrValue = `https://gym-lac-zeta.vercel.app/?managerId=${
    authState.qrCodeId || 'invalid-code'
  }`;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerLabel}>ESPACE MANAGER</Text>

            <Text style={styles.title}>
              Code de votre salle
            </Text>

            <Text style={styles.subtitle}>
              Permettez à vos clients de rejoindre facilement
              votre salle en scannant ce QR Code.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="qr-code-outline"
              size={24}
              color={colors.primary}
            />
          </View>
        </View>

        {/* SEPARATOR */}
        <View style={styles.separator}>
          <View style={styles.separatorActive} />
        </View>

        {/* QR SECTION */}
        <View style={styles.qrSection}>
          <View style={styles.qrCard}>
            <View style={styles.qrHeader}>
              <View style={styles.qrHeaderIcon}>
                <Ionicons
                  name="scan-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>

              <View style={styles.qrHeaderText}>
                <Text style={styles.qrTitle}>
                  QR CODE D'ACCÈS
                </Text>

                <Text style={styles.qrSubtitle}>
                  À scanner par vos clients
                </Text>
              </View>
            </View>

            {/* QR CODE */}
            <View style={styles.qrWrapper}>
              <View style={styles.qrInner}>
                <QRCode
                  value={qrValue}
                  size={230}
                  color={colors.background}
                  backgroundColor={colors.text}
                />
              </View>
            </View>

            {/* STATUS */}
            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />

              <Text style={styles.statusText}>
                Code actif
              </Text>
            </View>
          </View>
        </View>

        {/* INSTRUCTIONS */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color={colors.primary}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Comment ça fonctionne ?
            </Text>

            <Text style={styles.infoText}>
              1. Présentez ce QR Code au client.
              {'\n'}
              2. Le client ouvre l'appareil photo ou le scanner.
              {'\n'}
              3. Il est automatiquement redirigé vers l'inscription.
            </Text>
          </View>
        </View>

        {/* SCAN BADGE */}
        <View style={styles.scanHint}>
          <Ionicons
            name="phone-portrait-outline"
            size={19}
            color={colors.primary}
          />

          <Text style={styles.scanHintText}>
            Gardez ce code visible à l'accueil de votre salle
          </Text>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          GYM ACCÈS • ESPACE MANAGER
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 35,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 15,
  },

  headerLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  title: {
    color: colors.secondary,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* SEPARATOR */

  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 18,
    marginBottom: 25,
    overflow: 'hidden',
  },

  separatorActive: {
    width: 60,
    height: 2,
    backgroundColor: colors.primary,
  },

  /* QR */

  qrSection: {
    alignItems: 'center',
  },

  qrCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },

  qrHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  qrHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 165, 0, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  qrHeaderText: {
    flex: 1,
  },

  qrTitle: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  qrSubtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },

  qrWrapper: {
    backgroundColor: colors.text,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  qrInner: {
    backgroundColor: colors.text,
    padding: 2,
  },

  /* STATUS */

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 165, 0, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.14)',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 7,
  },

  statusText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* INFO */

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 15,
    marginTop: 18,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 165, 0, 0.09)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 6,
  },

  infoText: {
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 17,
  },

  /* HINT */

  scanHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 165, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.12)',
  },

  scanHintText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    marginLeft: 9,
    textAlign: 'center',
  },

  /* FOOTER */

  footer: {
    color: colors.textSecondary,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 27,
    opacity: 0.6,
  },
});