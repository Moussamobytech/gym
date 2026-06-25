import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { API_URL } from '../config';
import { RootStackScreenProps } from '../types/navigation';

type Props = RootStackScreenProps<'Register'>;

export default function RegisterScreen({ route, navigation }: Props) {
  const managerId = route.params?.managerId;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !phoneNumber || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (!managerId) {
      Alert.alert('Erreur', 'Aucune salle sélectionnée. Veuillez scanner le code QR de la salle.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phoneNumber, password, managerQrCodeId: managerId }),
      });
      
      if (response.ok) {
        Alert.alert('Succès', 'Compte créé ! Vous pouvez maintenant vous connecter.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        const err = await response.text();
        Alert.alert('Erreur', err || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      Alert.alert('Erreur réseau', 'Impossible de se connecter au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Inscription</Text>
        <Text style={styles.subtitle}>Salle liée : {managerId}</Text>
        
        <Input placeholder="Prénom" value={firstName} onChangeText={setFirstName} />
        <Input placeholder="Nom" value={lastName} onChangeText={setLastName} />
        <Input
          placeholder="Numéro de téléphone"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        <Input
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <Button title="S'INSCRIRE" onPress={handleRegister} loading={loading} />
        <Button 
          title="Annuler" 
          variant="secondary"
          onPress={() => navigation.navigate('Welcome')} 
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 32, flexGrow: 1, justifyContent: 'center' },
  title: { color: colors.primary, fontSize: 40, fontWeight: '900', marginBottom: 8, textAlign: 'center', letterSpacing: 1 },
  subtitle: { color: colors.textSecondary, fontSize: 16, marginBottom: 40, textAlign: 'center' },
});
