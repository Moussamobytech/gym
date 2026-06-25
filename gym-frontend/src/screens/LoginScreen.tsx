import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { RootStackScreenProps } from '../types/navigation';
import { Role } from '../types/auth';

type Props = RootStackScreenProps<'Login'>;

export default function LoginScreen({ route, navigation }: Props) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const intent = route.params?.intent;

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password })
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
              headers: { Authorization: `Bearer ${data.jwt}` }
            });
            Alert.alert('Renouvellement', 'Votre demande de paiement a été signalée au gérant. Vous êtes maintenant "En attente".');
          } catch(e) {
            console.error('Renew error', e);
          }
        }
        await login(data.jwt, data.role as Role, data.qrCodeId);
      } else {
        Alert.alert('Erreur', data?.message || 'Identifiants incorrects');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de joindre le serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gym Premium</Text>
      
      <View style={styles.inputContainer}>
        <Input 
          placeholder="Numéro de téléphone" 
          keyboardType="phone-pad"
          autoCapitalize="none"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <Input 
          placeholder="Mot de passe" 
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <Button 
        title="SE CONNECTER" 
        onPress={handleLogin} 
        loading={loading}
      />

      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Welcome')}>
        <Text style={styles.linkText}>Retour à l'accueil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 32 },
  title: { color: colors.primary, fontSize: 40, fontWeight: '900', marginBottom: 48, textAlign: 'center', letterSpacing: 1 },
  inputContainer: { marginBottom: 32 },
  linkButton: { padding: 16, marginTop: 16 },
  linkText: { color: colors.textSecondary, textAlign: 'center', fontSize: 16, fontWeight: '600' }
});
