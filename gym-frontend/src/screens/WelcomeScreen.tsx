import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { Button } from '../components/Button';
import { RootStackScreenProps } from '../types/navigation';

type Props = RootStackScreenProps<'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const urlParams = new URLSearchParams(window.location.search);
      const managerId = urlParams.get('managerId');
      if (managerId) {
        // Nettoyer l'URL pour éviter de boucler si on revient en arrière
        window.history.replaceState({}, document.title, window.location.pathname);
        navigation.navigate('Register', { managerId });
      }
    }
  }, [navigation]);

  return (
    <ImageBackground 
      source={require('../../assets/trainings/musculation.jpg')} 
      style={styles.container}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>GYM ACCÈS</Text>
          <Text style={styles.subtitle}>L'élite de l'entraînement.</Text>
        </View>

        <View style={styles.actionContainer}>
          <Button 
            title="SE CONNECTER" 
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
          />
          <Button 
            title="SCANNER UNE SALLE" 
            variant="secondary"
            onPress={() => navigation.navigate('PreAuthScanner')}
            style={styles.button}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  overlay: { flex: 1, backgroundColor: 'rgba(5,5,5,0.7)', padding: 24, justifyContent: 'space-between' },
  header: { marginTop: 120, alignItems: 'center' },
  title: { color: colors.primary, fontSize: 52, fontWeight: '900', letterSpacing: 2, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: 18, marginTop: 12, letterSpacing: 1 },
  actionContainer: { marginBottom: 32 },
  button: { marginBottom: 16 },
});
