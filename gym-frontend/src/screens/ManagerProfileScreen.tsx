import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { API_URL } from '../config';

export default function ManagerProfileScreen() {
  const { authState, logout } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  /**
   * =========================
   * RÉCUPÉRATION DU PROFIL
   * =========================
   */
  const fetchProfile = async () => {
    if (!authState.jwt) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/manager/profile`, {
        headers: {
          Authorization: `Bearer ${authState.jwt}`,
        },
      });

      if (res.ok) {
        const data = await res.json();

        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setPhoneNumber(data.phoneNumber || '');
        setProfileImageUrl(data.profileImageUrl || null);
      } else {
        Alert.alert(
          'Erreur',
          'Impossible de récupérer les informations du profil.'
        );
      }
    } catch (e) {
      console.error('Erreur fetchProfile:', e);

      Alert.alert(
        'Erreur',
        'Impossible de charger le profil.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [authState.jwt]);

  /**
   * =========================
   * CHOISIR UNE IMAGE
   * =========================
   */
  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission nécessaire',
          'Autorisez l’accès à votre galerie pour modifier votre photo de profil.'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
          base64: true,
        });

      if (
        !result.canceled &&
        result.assets?.length > 0 &&
        result.assets[0].base64
      ) {
        setProfileImageUrl(
          `data:image/jpeg;base64,${result.assets[0].base64}`
        );
      }
    } catch (e) {
      console.error('Erreur sélection image:', e);

      Alert.alert(
        'Erreur',
        'Impossible de sélectionner cette image.'
      );
    }
  };

  /**
   * =========================
   * ENREGISTRER LE PROFIL
   * =========================
   */
  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(
        'Informations manquantes',
        'Veuillez renseigner votre prénom et votre nom.'
      );
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert(
        'Informations manquantes',
        'Veuillez renseigner votre numéro de téléphone.'
      );
      return;
    }

    if (!authState.jwt) {
      Alert.alert(
        'Session expirée',
        'Veuillez vous reconnecter.'
      );
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/manager/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.jwt}`,
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phoneNumber.trim(),
          profileImageUrl,
        }),
      });

      if (res.ok) {
        Alert.alert(
          'Profil mis à jour',
          'Vos informations ont été enregistrées avec succès.'
        );
      } else {
        const err = await res.text();

        Alert.alert(
          'Erreur',
          err || 'Erreur lors de la mise à jour du profil.'
        );
      }
    } catch (e) {
      console.error('Erreur sauvegarde profil:', e);

      Alert.alert(
        'Erreur réseau',
        'Impossible de joindre le serveur.'
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * =========================
   * CONFIRMATION DÉCONNEXION
   * =========================
   */
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter de votre espace manager ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  /**
   * =========================
   * LOADING
   * =========================
   */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Ionicons
            name="person-outline"
            size={30}
            color={colors.primary}
          />
        </View>

        <ActivityIndicator
          size="small"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Chargement de votre profil...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* =========================
            HEADER
        ========================= */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>
              ESPACE MANAGER
            </Text>

            <Text style={styles.title}>
              Mon profil
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="person-outline"
              size={22}
              color={colors.primary}
            />
          </View>
        </View>

        <View style={styles.headerLine}>
          <View style={styles.headerLineActive} />
        </View>

        {/* =========================
            PROFIL / PHOTO
        ========================= */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            onPress={handlePickImage}
            style={styles.imageWrapper}
            activeOpacity={0.85}
          >
            {profileImageUrl ? (
              <Image
                source={{ uri: profileImageUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View
                style={[
                  styles.profileImage,
                  styles.placeholderImage,
                ]}
              >
                <Ionicons
                  name="person"
                  size={48}
                  color={colors.textSecondary}
                />
              </View>
            )}

            <View style={styles.editIcon}>
              <Ionicons
                name="camera"
                size={17}
                color={colors.background}
              />
            </View>
          </TouchableOpacity>

          <Text style={styles.profileName}>
            {firstName || lastName
              ? `${firstName} ${lastName}`.trim()
              : 'Manager'}
          </Text>

          <Text style={styles.profileRole}>
            ADMINISTRATEUR DE SALLE
          </Text>

          <TouchableOpacity
            onPress={handlePickImage}
            style={styles.changePhotoButton}
            activeOpacity={0.75}
          >
            <Ionicons
              name="camera-outline"
              size={15}
              color={colors.primary}
            />

            <Text style={styles.changePhotoText}>
              Modifier la photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* =========================
            INFORMATIONS PERSONNELLES
        ========================= */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Ionicons
              name="person-outline"
              size={18}
              color={colors.primary}
            />
          </View>

          <View>
            <Text style={styles.sectionTitle}>
              Informations personnelles
            </Text>

            <Text style={styles.sectionSubtitle}>
              Gérez vos informations de compte
            </Text>
          </View>
        </View>

        <View style={styles.formCard}>
          {/* Prénom */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              PRÉNOM
            </Text>

            <Input
              placeholder="Votre prénom"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          {/* Nom */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              NOM
            </Text>

            <Input
              placeholder="Votre nom"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Téléphone */}
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
        </View>

        {/* =========================
            INFO SÉCURITÉ
        ========================= */}
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
              Profil sécurisé
            </Text>

            <Text style={styles.securityText}>
              Vos informations sont protégées et utilisées
              uniquement pour la gestion de votre compte.
            </Text>
          </View>
        </View>

        {/* =========================
            BOUTON ENREGISTRER
        ========================= */}
        <Button
          title="ENREGISTRER LES MODIFICATIONS"
          onPress={handleSave}
          loading={saving}
          style={styles.saveButton}
        />

        {/* =========================
            DÉCONNEXION
        ========================= */}
        <View style={styles.logoutSection}>
          <View style={styles.logoutSeparator} />

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.75}
          >
            <View style={styles.logoutIcon}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.error}
              />
            </View>

            <View style={styles.logoutContent}>
              <Text style={styles.logoutText}>
                Se déconnecter
              </Text>

              <Text style={styles.logoutSubtext}>
                Fermer votre session actuelle
              </Text>
            </View>

            <Ionicons
              name="chevron-forward-outline"
              size={19}
              color={colors.error}
            />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          GYM ACCÈS • ESPACE MANAGER
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 35,
  },

  /* =========================
     LOADING
  ========================= */

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 12,
  },

  /* =========================
     HEADER
  ========================= */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  title: {
    color: colors.secondary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.2,
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

  headerLine: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 17,
    marginBottom: 25,
  },

  headerLineActive: {
    width: 55,
    height: 2,
    backgroundColor: colors.primary,
  },

  /* =========================
     PROFIL
  ========================= */

  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },

  imageWrapper: {
    position: 'relative',
    marginBottom: 14,
  },

  profileImage: {
    width: 122,
    height: 122,
    borderRadius: 61,
    backgroundColor: colors.surface,
  },

  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },

  editIcon: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 37,
    height: 37,
    borderRadius: 13,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileName: {
    color: colors.secondary,
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },

  profileRole: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 5,
  },

  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 13,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 165, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.20)',
  },

  changePhotoText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },

  /* =========================
     SECTION
  ========================= */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 165, 0, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  sectionTitle: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },

  /* =========================
     FORM
  ========================= */

  formCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 15,
    marginBottom: 16,
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

  /* =========================
     SÉCURITÉ
  ========================= */

  securityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 165, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.16)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },

  securityIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 165, 0, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
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
    fontSize: 10,
    lineHeight: 16,
  },

  /* =========================
     SAVE
  ========================= */

  saveButton: {
    marginTop: 3,
    paddingVertical: 15,
    borderRadius: 13,
  },

  /* =========================
     LOGOUT
  ========================= */

  logoutSection: {
    marginTop: 32,
  },

  logoutSeparator: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 17,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 139, 168, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(243, 139, 168, 0.14)',
    borderRadius: 15,
    padding: 13,
  },

  logoutIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(243, 139, 168, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  logoutContent: {
    flex: 1,
  },

  logoutText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '900',
  },

  logoutSubtext: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },

  /* =========================
     FOOTER
  ========================= */

  footer: {
    color: colors.textSecondary,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 28,
    opacity: 0.6,
  },
});