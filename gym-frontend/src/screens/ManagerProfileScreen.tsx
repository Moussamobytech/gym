import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/manager/profile`, {
        headers: { Authorization: `Bearer ${authState.jwt}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setPhoneNumber(data.phoneNumber || '');
        setProfileImageUrl(data.profileImageUrl || null);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erreur', 'Permission refusée pour accéder à la galerie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setProfileImageUrl(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/manager/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.jwt}`
        },
        body: JSON.stringify({ firstName, lastName, phoneNumber, profileImageUrl })
      });
      if (res.ok) {
        Alert.alert('Succès', 'Profil mis à jour');
      } else {
        const err = await res.text();
        Alert.alert('Erreur', err || 'Erreur lors de la mise à jour');
      }
    } catch (e) {
      Alert.alert('Erreur réseau', 'Impossible de joindre le serveur');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Mon Profil</Text>

      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={handlePickImage} style={styles.imageWrapper}>
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.placeholderImage]}>
              <Ionicons name="person" size={60} color={colors.textSecondary} />
            </View>
          )}
          <View style={styles.editIcon}>
            <Ionicons name="camera" size={20} color={colors.background} />
          </View>
        </TouchableOpacity>
      </View>

      <Input placeholder="Prénom" value={firstName} onChangeText={setFirstName} />
      <Input placeholder="Nom" value={lastName} onChangeText={setLastName} />
      <Input placeholder="Numéro de téléphone" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" autoCapitalize="none" />

      <Button title="ENREGISTRER" onPress={handleSave} loading={saving} style={{ marginTop: 24 }} />

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={24} color={colors.error} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 64 },
  title: { color: colors.secondary, fontSize: 32, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  imageContainer: { alignItems: 'center', marginBottom: 32 },
  imageWrapper: { position: 'relative' },
  profileImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.surface },
  placeholderImage: { justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
  editIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.background },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 48, padding: 16, backgroundColor: 'rgba(243, 139, 168, 0.1)', borderRadius: 12 },
  logoutText: { color: colors.error, fontSize: 18, fontWeight: 'bold', marginLeft: 8 }
});
