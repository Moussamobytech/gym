import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { colors } from '../theme/colors';
import { RootStackScreenProps } from '../types/navigation';

type Props = RootStackScreenProps<'PreAuthScanner'>;

export default function PreAuthScannerScreen({ navigation }: Props) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    // Extraire l'ID si c'est une URL
    let extractedId = data;
    if (data.includes('managerId=')) {
      extractedId = data.split('managerId=')[1].split('&')[0];
    }

    Alert.alert(
      'Action Requise',
      'Que souhaitez-vous faire ?',
      [
        {
          text: "M'inscrire",
          onPress: () => navigation.navigate('Register', { managerId: extractedId }),
          style: 'default',
        },
        {
          text: 'Payer mon mois',
          onPress: () => navigation.navigate('Login', { intent: 'RENEW', managerId: extractedId }),
          style: 'default',
        },
        {
          text: 'Annuler',
          onPress: () => setScanned(false),
          style: 'cancel',
        }
      ]
    );
  };

  if (hasPermission === null) return <View style={styles.container}><Text style={styles.text}>Demande d'autorisation de la caméra...</Text></View>;
  if (hasPermission === false) return <View style={styles.container}><Text style={styles.text}>Pas d'accès à la caméra</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scanner la salle</Text>
      <Text style={styles.subtitle}>Scannez le QR Code affiché par la salle pour vous y inscrire.</Text>
      
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      
      <Button title="Annuler" onPress={() => navigation.goBack()} color={colors.error} />
      {scanned && <Button title={'Appuyez pour scanner à nouveau'} onPress={() => setScanned(false)} color={colors.primary} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { color: colors.primary, fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { color: colors.textSecondary, fontSize: 16, textAlign: 'center', marginBottom: 32 },
  cameraContainer: { width: 300, height: 300, overflow: 'hidden', borderRadius: 24, marginBottom: 24, borderWidth: 2, borderColor: colors.primary },
  text: { color: colors.text }
});
