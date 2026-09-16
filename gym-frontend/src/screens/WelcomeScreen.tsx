
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Platform,
  Dimensions,
} from 'react-native';

import { colors } from '../theme/colors';
import { Button } from '../components/Button';
import { RootStackScreenProps } from '../types/navigation';

type Props = RootStackScreenProps<'Welcome'>;

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: Props) {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const urlParams = new URLSearchParams(window.location.search);
      const managerId = urlParams.get('managerId');

      if (managerId) {
        // Nettoyer l'URL pour éviter de boucler si on revient en arrière
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        navigation.navigate('Register', { managerId });
      }
    }
  }, [navigation]);

  return (
    <ImageBackground
      source={require('../../assets/trainings/musculation.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Overlay général */}
      <View style={styles.overlay}>

        {/* HEADER */}
        <View style={styles.header}>

          <View style={styles.logoContainer}>
            <View style={styles.logoLine} />
            <Text style={styles.logoText}>GA</Text>
            <View style={styles.logoLine} />
          </View>

          <Text style={styles.title}>GYM ACCÈS</Text>

          <Text style={styles.subtitle}>
            L'ÉLITE DE L'ENTRAÎNEMENT
          </Text>

          <Text style={styles.description}>
            Accédez à votre salle, gérez vos séances
            et donnez le meilleur de vous-même.
          </Text>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionContainer}>

          <Text style={styles.welcomeText}>
            BIENVENUE
          </Text>

          <Button
            title="SE CONNECTER"
            onPress={() => navigation.navigate('Login')}
            style={styles.primaryButton}
          />

          <Button
            title="SCANNER UNE SALLE"
            variant="secondary"
            onPress={() => navigation.navigate('PreAuthScanner')}
            style={styles.secondaryButton}
          />

          {/* Informations */}
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <View style={styles.infoDot} />
              <Text style={styles.infoText}>Accès rapide</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoItem}>
              <View style={styles.infoDot} />
              <Text style={styles.infoText}>Simple & sécurisé</Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            GYM ACCÈS
          </Text>

          <Text style={styles.footerSeparator}>•</Text>

          <Text style={styles.footerText}>
            VOTRE PERFORMANCE, NOTRE PRIORITÉ
          </Text>
        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 55 : 35,
    paddingBottom: 25,
    justifyContent: 'space-between',
  },

  /* =========================
     HEADER
  ========================= */

  header: {
    alignItems: 'center',
    marginTop: height < 700 ? 35 : 70,
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  logoLine: {
    width: 35,
    height: 2,
    backgroundColor: colors.primary,
    marginHorizontal: 10,
  },

  logoText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },

  title: {
    color: '#FFFFFF',
    fontSize: width < 380 ? 38 : 46,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {
      width: 0,
      height: 3,
    },
    textShadowRadius: 8,
  },

  subtitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: 12,
    textAlign: 'center',
  },

  description: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 330,
    marginTop: 18,
  },

  /* =========================
     ACTIONS
  ========================= */

  actionContainer: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    marginBottom: height < 700 ? 15 : 30,
  },

  welcomeText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 16,
  },

  primaryButton: {
    width: '100%',
    height: 56,
    marginBottom: 13,
    borderRadius: 12,
  },

  secondaryButton: {
    width: '100%',
    height: 56,
    marginBottom: 20,
    borderRadius: 12,
  },

  /* =========================
     INFO
  ========================= */

  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 7,
  },

  infoText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 11,
    fontWeight: '600',
  },

  separator: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 15,
  },

  /* =========================
     FOOTER
  ========================= */

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingBottom: 3,
  },

  footerText: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
  },

  footerSeparator: {
    color: colors.primary,
    fontSize: 10,
    marginHorizontal: 8,
  },
});

