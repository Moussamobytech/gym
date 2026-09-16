
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';

import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { RootStackScreenProps } from '../types/navigation';
import { Role } from '../types/auth';

type Props = RootStackScreenProps<'Login'>;

const { height } = Dimensions.get('window');

export default function LoginScreen({ route, navigation }: Props) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const intent = route.params?.intent;

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert(
        'Champs requis',
        'Veuillez remplir tous les champs.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          password,
        }),
      });

      let data = null;

      const text = await response.text();

      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.warn('Response is not JSON:', text);
        }
      }

      if (response.ok && data && data.jwt) {
        if (intent === 'RENEW' && data.role === 'CLIENT') {
          try {
            await fetch(`${API_URL}/client/renew`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${data.jwt}`,
              },
            });

            Alert.alert(
              'Renouvellement',
              'Votre demande de paiement a été signalée au gérant. Vous êtes maintenant "En attente".'
            );
          } catch (e) {
            console.error('Renew error', e);
          }
        }

        await login(
          data.jwt,
          data.role as Role,
          data.qrCodeId
        );
      } else {
        Alert.alert(
          'Connexion impossible',
          data?.message || 'Identifiants incorrects.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Erreur de connexion',
        'Impossible de joindre le serveur. Vérifiez votre connexion internet.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

          {/* =========================
              HEADER
          ========================= */}

          <View style={styles.header}>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Welcome')}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>‹</Text>
              <Text style={styles.backText}>
                Accueil
              </Text>
            </TouchableOpacity>

            <View style={styles.brandMark}>
              <View style={styles.brandLine} />

              <Text style={styles.brandText}>
                GA
              </Text>

              <View style={styles.brandLine} />
            </View>

          </View>

          {/* =========================
              TITLE
          ========================= */}

          <View style={styles.titleContainer}>

            <Text style={styles.title}>
              GYM ACCÈS
            </Text>

            <Text style={styles.subtitle}>
              ESPACE MEMBRE
            </Text>

            <View style={styles.titleLine} />

            <Text style={styles.description}>
              Connectez-vous pour accéder à votre
              espace personnel.
            </Text>

          </View>

          {/* =========================
              FORMULAIRE
          ========================= */}

          <View style={styles.formContainer}>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                NUMÉRO DE TÉLÉPHONE
              </Text>

              <Input
                placeholder="Votre numéro de téléphone"
                keyboardType="phone-pad"
                autoCapitalize="none"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                MOT DE PASSE
              </Text>

              <Input
                placeholder="Votre mot de passe"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* =========================
                CONNEXION
            ========================= */}

            <View style={styles.buttonContainer}>
              <Button
                title="SE CONNECTER"
                onPress={handleLogin}
                loading={loading}
              />
            </View>

          </View>

          {/* =========================
              SECURITY
          ========================= */}

          <View style={styles.securityContainer}>

            <View style={styles.securityIcon}>
              <View style={styles.securityDot} />
            </View>

            <View style={styles.securityTextContainer}>
              <Text style={styles.securityTitle}>
                CONNEXION SÉCURISÉE
              </Text>

              <Text style={styles.securityDescription}>
                Vos informations sont protégées.
              </Text>
            </View>

          </View>

          {/* =========================
              FOOTER
          ========================= */}

          <View style={styles.footer}>

            <Text style={styles.footerBrand}>
              GYM ACCÈS
            </Text>

            <Text style={styles.footerSeparator}>
              •
            </Text>

            <Text style={styles.footerText}>
              PERFORMANCE
            </Text>

          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  /* =====================================
     GLOBAL
  ===================================== */

  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    minHeight: height,
    backgroundColor: colors.background,
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'ios' ? 48 : 30,
    paddingBottom: 24,
  },

  /* =====================================
     HEADER
  ===================================== */

  header: {
    width: '100%',
    alignItems: 'center',
  },

  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 10,
    zIndex: 10,
  },

  backIcon: {
    color: colors.primary,
    fontSize: 30,
    lineHeight: 28,
    marginRight: 4,
  },

  backText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  brandMark: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  brandLine: {
    width: 28,
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.7,
  },

  brandText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
    marginHorizontal: 11,
  },

  /* =====================================
     TITLE
  ===================================== */

  titleContainer: {
    alignItems: 'center',
    marginTop: height < 700 ? 45 : 65,
    marginBottom: height < 700 ? 35 : 45,
  },

  title: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: 8,
    opacity: 0.8,
  },

  titleLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.primary,
    marginTop: 17,
    opacity: 0.7,
  },

  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 16,
    maxWidth: 300,
    opacity: 0.75,
  },

  /* =====================================
     FORM
  ===================================== */

  formContainer: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },

  fieldContainer: {
    marginBottom: 21,
  },

  label: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 3,
    opacity: 0.8,
  },

  buttonContainer: {
    marginTop: 8,
  },

  /* =====================================
     SECURITY
  ===================================== */

  securityContainer: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.16)',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 165, 0, 0.04)',
  },

  securityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  securityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  securityTextContainer: {
    flex: 1,
  },

  securityTitle: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 3,
  },

  securityDescription: {
    color: colors.textSecondary,
    fontSize: 10,
    opacity: 0.65,
  },

  /* =====================================
     FOOTER
  ===================================== */

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 30,
  },

  footerBrand: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    opacity: 0.7,
  },

  footerSeparator: {
    color: colors.primary,
    fontSize: 9,
    marginHorizontal: 8,
    opacity: 0.6,
  },

  footerText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    opacity: 0.45,
  },

});

