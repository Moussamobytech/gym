import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { API_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { SuperAdminTabScreenProps } from '../types/navigation';

type Props = SuperAdminTabScreenProps<'CreateUser'>;

export default function SuperAdminCreateUserScreen({ navigation }: Props) {
  const { authState } = useContext(AuthContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [managerQrCodeId, setManagerQrCodeId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!firstName || !lastName || !phoneNumber || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.jwt}`
        },
        body: JSON.stringify({ 
          firstName, 
          lastName, 
          phoneNumber, 
          password, 
          managerQrCodeId: managerQrCodeId.trim() || undefined 
        }),
      });
      
      if (response.ok) {
        Alert.alert('Succès', 'Utilisateur créé avec succès !', [
          { text: 'OK', onPress: () => {
            setFirstName('');
            setLastName('');
            setPhoneNumber('');
            setPassword('');
            setManagerQrCodeId('');
            navigation.navigate('Dashboard');
          }}
        ]);
      } else {
        const err = await response.text();
        Alert.alert('Erreur', err || 'Erreur lors de la création.');
      }
    } catch (error) {
      Alert.alert('Erreur réseau', 'Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Créer un compte</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.formCard}>
          <Text style={styles.instructions}>
            Laissez le champ "ID Salle (QR Code)" vide pour créer un Gérant. Remplissez-le pour créer un Client rattaché à une salle.
          </Text>
          
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
          
          <View style={styles.divider} />
          <Text style={styles.label}>Optionnel (Pour créer un Client) :</Text>
          <Input
            placeholder="ID Salle (QR Code)"
            value={managerQrCodeId}
            onChangeText={setManagerQrCodeId}
          />
          
          <Button 
            title="CRÉER L'UTILISATEUR" 
            onPress={handleCreate} 
            loading={loading}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 64, paddingHorizontal: 24, paddingBottom: 16 },
  title: { color: '#cba6f7', fontSize: 28, fontWeight: '900' },
  scroll: { padding: 24, paddingBottom: 60 },
  formCard: { backgroundColor: colors.surface, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: colors.border },
  instructions: { color: colors.textSecondary, marginBottom: 24, fontSize: 14, lineHeight: 20 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 24 },
  label: { color: colors.text, fontWeight: 'bold', marginBottom: 16 },
  submitBtn: { marginTop: 16 }
});
