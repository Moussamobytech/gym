import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { AppLoader } from '../components/AppLoader';
import { useAlert } from '../components/CustomAlert';
import { API_URL } from '../config';
import { RootStackScreenProps } from '../types/navigation';

type Props = RootStackScreenProps<'Register'>;

export default function RegisterScreen({
  route,
  navigation,
}: Props) {
  const managerId = route.params?.managerId;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { showAlert, AlertComponent } = useAlert();

  const handleRegister = async () => {
    if (!firstName || !lastName || !phoneNumber || !password) {
      showAlert({
        type: 'warning',
        title: 'Champs requis',
        message: 'Veuillez remplir tous les champs.',
      });
      return;
    }

    if (!managerId) {
      showAlert({
        type: 'error',
        title: 'Salle non sélectionnée',
        message:
          "Veuillez scanner le QR Code de la salle avant de vous inscrire.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phoneNumber,
          password,
          managerQrCodeId: managerId,
        }),
      });

      const responseText = await response.text();

      let responseData: { message?: string } = {};

      try {
        responseData = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {}

      if (response.ok) {
        showAlert({
          type: 'success',
          title: 'Compte créé ! 🎉',
          message:
            'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
          buttons: [
            {
              text: 'Se connecter',
              onPress: () => navigation.navigate('Login'),
            },
          ],
        });
      } else {
        showAlert({
          type: 'error',
          title: "Erreur d'inscription",
          message:
            responseData.message ||
            responseText ||
            'Une erreur est survenue.',
        });
      }
    } catch (error) {
      console.error('Erreur inscription:', error);

      showAlert({
        type: 'error',
        title: 'Erreur réseau',
        message:
          'Impossible de se connecter au serveur.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {AlertComponent}

      <AppLoader
        visible={loading}
        fullScreen
        message="Création du compte..."
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandIconText}>GA</Text>
            </View>

            <View>
              <Text style={styles.brandName}>GYM ACCÈS</Text>
              <Text style={styles.brandLabel}>
                ESPACE MEMBRE
              </Text>
            </View>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="person-add-outline"
              size={22}
              color={colors.primary}
            />
          </View>
        </View>

        {/* SEPARATOR */}
        <View style={styles.separator}>
          <View style={styles.separatorActive} />
        </View>

        {/* TITLE */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Créer votre compte
          </Text>

          <Text style={styles.subtitle}>
            Rejoignez votre salle et profitez de votre
            espace membre.
          </Text>
        </View>

        {/* SALLE */}
        <View style={styles.gymCard}>
          <View style={styles.gymIcon}>
            <Ionicons
              name="qr-code-outline"
              size={20}
              color={colors.primary}
            />
          </View>

          <View style={styles.gymContent}>
            <Text style={styles.gymLabel}>
              SALLE ASSOCIÉE
            </Text>

            <Text
              style={styles.gymId}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {managerId || 'Aucune salle sélectionnée'}
            </Text>
          </View>

          {managerId && (
            <View style={styles.validIcon}>
              <Ionicons
                name="checkmark-circle"
                size={19}
                color={colors.primary}
              />
            </View>
          )}
        </View>

        {/* FORM */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="person-outline"
                size={17}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Vos informations
              </Text>

              <Text style={styles.sectionSubtitle}>
                Renseignez vos informations personnelles
              </Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                PRÉNOM
              </Text>

              <Input
                placeholder="Votre prénom"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                NOM
              </Text>

              <Input
                placeholder="Votre nom"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                NUMÉRO DE TÉLÉPHONE
              </Text>

              <Input
                placeholder="Votre numéro de téléphone"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroupLast}>
              <Text style={styles.inputLabel}>
                MOT DE PASSE
              </Text>

              <Input
                placeholder="Choisissez un mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <View style={styles.passwordHint}>
                <Ionicons
                  name="lock-closed-outline"
                  size={13}
                  color={colors.textSecondary}
                />

                <Text style={styles.passwordHintText}>
                  Votre mot de passe protège votre compte.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECURITY */}
        <View style={styles.securityBox}>
          <View style={styles.securityIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={colors.primary}
            />
          </View>

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>
              Inscription sécurisée
            </Text>

            <Text style={styles.securityText}>
              Vos informations personnelles sont utilisées
              uniquement pour créer et gérer votre compte membre.
            </Text>
          </View>
        </View>

        {/* ACTION */}
        <Button
          title="CRÉER MON COMPTE"
          onPress={handleRegister}
          loading={loading}
          style={styles.registerButton}
        />

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.navigate('Welcome')}
          activeOpacity={0.75}
        >
          <Ionicons
            name="arrow-back-outline"
            size={17}
            color={colors.textSecondary}
          />

          <Text style={styles.cancelText}>
            Retour à l'accueil
          </Text>
        </TouchableOpacity>

        {/* FOOTER */}
        <Text style={styles.footer}>
          GYM ACCÈS • ESPACE MEMBRE
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 35,
    flexGrow: 1,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  brandIconText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  brandName: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },

  brandLabel: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginTop: 2,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
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
    marginTop: 19,
    marginBottom: 26,
    overflow: 'hidden',
  },

  separatorActive: {
    width: 55,
    height: 2,
    backgroundColor: colors.primary,
  },

  /* TITLE */

  titleContainer: {
    marginBottom: 23,
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
    marginTop: 6,
  },

  /* GYM */

  gymCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    padding: 13,
    marginBottom: 24,
  },

  gymIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 165, 0, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.17)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  gymContent: {
    flex: 1,
  },

  gymLabel: {
    color: colors.textSecondary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 3,
  },

  gymId: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '700',
  },

  validIcon: {
    marginLeft: 8,
  },

  /* SECTION */

  formSection: {
    marginBottom: 17,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 165, 0, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.17)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  sectionTitle: {
    color: colors.secondary,
    fontSize: 15,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 3,
  },

  /* FORM CARD */

  formCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 15,
  },

  inputGroup: {
    marginBottom: 13,
  },

  inputGroupLast: {
    marginBottom: 0,
  },

  inputLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
    marginLeft: 2,
  },

  passwordHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    marginLeft: 2,
  },

  passwordHintText: {
    color: colors.textSecondary,
    fontSize: 9,
    marginLeft: 5,
  },

  /* SECURITY */

  securityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 165, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.14)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },

  securityIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 165, 0, 0.09)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  securityContent: {
    flex: 1,
  },

  securityTitle: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 3,
  },

  securityText: {
    color: colors.textSecondary,
    fontSize: 9,
    lineHeight: 15,
  },

  /* BUTTON */

  registerButton: {
    marginTop: 2,
    paddingVertical: 15,
    borderRadius: 13,
  },

  /* CANCEL */

  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 6,
  },

  cancelText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 7,
  },

  /* FOOTER */

  footer: {
    color: colors.textSecondary,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 17,
    opacity: 0.6,
  },
});