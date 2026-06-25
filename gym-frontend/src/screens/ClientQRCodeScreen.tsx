import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Button, Alert, Modal, TouchableOpacity } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { ClientTabScreenProps } from '../types/navigation';

type Props = ClientTabScreenProps<'QRCode'>;

export default function ClientQRCodeScreen({ navigation }: Props) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const { authState } = useContext(AuthContext);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getBarCodeScannerPermissions();
  }, []);

  const handleAction = async (action: 'CHECKIN' | 'RENEW') => {
    try {
      const endpoint = action === 'CHECKIN' ? '/client/checkin' : '/client/renew';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authState.jwt}` }
      });
      
      const text = await response.text();
      
      if (response.ok) {
        Alert.alert('Succès', text || (action === 'CHECKIN' ? 'Accès autorisé !' : 'Demande de renouvellement envoyée.'), [
          { text: 'OK', onPress: () => setScanned(false) }
        ]);
      } else {
        Alert.alert('Erreur', text || 'Action refusée', [
          { text: 'OK', onPress: () => setScanned(false) }
        ]);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de joindre le serveur', [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setShowActionModal(true);
  };

  if (hasPermission === null) return <View style={styles.container}><Text style={styles.text}>Demande d'autorisation de la caméra...</Text></View>;
  if (hasPermission === false) return <View style={styles.container}><Text style={styles.text}>Pas d'accès à la caméra</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scanner la salle</Text>
      <Text style={styles.subtitle}>Scannez le QR Code de l'accueil</Text>
      
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      
      {scanned && <Button title={'Appuyez pour scanner à nouveau'} onPress={() => setScanned(false)} color={colors.primary} />}

      <Modal visible={showActionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Action à la salle</Text>
            <Text style={styles.modalSubtitle}>Que souhaitez-vous faire ?</Text>

            <TouchableOpacity 
              style={styles.modalBtnPrimary} 
              onPress={() => { setShowActionModal(false); handleAction('CHECKIN'); }}>
              <Text style={styles.modalBtnPrimaryText}>Pointer ma présence</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalBtnSecondary} 
              onPress={() => { setShowActionModal(false); handleAction('RENEW'); }}>
              <Text style={styles.modalBtnSecondaryText}>Renouveler l'abonnement</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalBtnCancel} 
              onPress={() => { setShowActionModal(false); setScanned(false); }}>
              <Text style={styles.modalBtnCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { color: colors.primary, fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { color: colors.textSecondary, fontSize: 16, textAlign: 'center', marginBottom: 32 },
  cameraContainer: { width: 300, height: 300, overflow: 'hidden', borderRadius: 24, marginBottom: 24, borderWidth: 2, borderColor: colors.primary },
  text: { color: colors.text },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: colors.surface, width: '100%', borderRadius: 24, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 8 },
  modalSubtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 32 },
  modalBtnPrimary: { backgroundColor: colors.primary, width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  modalBtnPrimaryText: { color: colors.background, fontSize: 16, fontWeight: 'bold' },
  modalBtnSecondary: { backgroundColor: 'transparent', width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.secondary, marginBottom: 16 },
  modalBtnSecondaryText: { color: colors.secondary, fontSize: 16, fontWeight: 'bold' },
  modalBtnCancel: { paddingVertical: 12, width: '100%', alignItems: 'center' },
  modalBtnCancelText: { color: colors.textSecondary, fontSize: 16 }
});
