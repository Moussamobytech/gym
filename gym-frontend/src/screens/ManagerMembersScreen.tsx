import React, { useState, useCallback, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { ManagerTabScreenProps } from '../types/navigation';
import { API_URL } from '../config';

type Props = ManagerTabScreenProps<'Members'>;

const MemberCardItem = ({ item, requestAction }: { item: any, requestAction: (type: 'ACCEPT' | 'REFUSE' | 'DELETE', id: number, name: string) => void }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'PAID': return 'À jour';
      case 'EXPIRED': return 'Expiré';
      default: return status;
    }
  };

  return (
    <TouchableOpacity style={styles.memberCard} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
      <View style={styles.memberHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.memberName}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.memberPhone}>{item.phoneNumber}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <View style={[styles.badge, item.paymentStatus === 'EXPIRED' && styles.badgeExpired, item.paymentStatus === 'PENDING' && styles.badgePending]}>
            <Text style={[styles.badgeText, item.paymentStatus === 'EXPIRED' && styles.badgeTextExpired, item.paymentStatus === 'PENDING' && styles.badgeTextPending]}>
              {getStatusLabel(item.paymentStatus)}
            </Text>
          </View>
          <Feather name={expanded ? "chevron-up" : "chevron-down"} size={24} color={colors.textSecondary} />
        </View>
      </View>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Inscrit le :</Text>
            <Text style={styles.infoValue}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fin d'abonnement :</Text>
            <Text style={styles.infoValue}>{item.subscriptionEndDate ? new Date(item.subscriptionEndDate).toLocaleDateString() : 'Non défini'}</Text>
          </View>

          <View style={styles.actionsDivider} />
          
          <Text style={styles.actionsTitle}>Gérer l'abonnement</Text>
          <View style={styles.iconButtonsRow}>
            <TouchableOpacity style={[styles.iconButton, styles.iconAccept]} onPress={() => requestAction('ACCEPT', item.id, `${item.firstName} ${item.lastName}`)}>
              <Feather name="check" size={24} color={colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, styles.iconRefuse]} onPress={() => requestAction('REFUSE', item.id, `${item.firstName} ${item.lastName}`)}>
              <Feather name="x" size={24} color={colors.error} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, styles.iconDelete]} onPress={() => requestAction('DELETE', item.id, `${item.firstName} ${item.lastName}`)}>
              <Feather name="trash-2" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function ManagerMembersScreen({ navigation }: Props) {
  const { authState } = useContext(AuthContext);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'PAID'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalData, setModalData] = useState<{ visible: boolean, type: 'ACCEPT' | 'REFUSE' | 'DELETE', memberId: number, memberName: string } | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setVisibleCount(10);
  }, [activeTab, searchQuery]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_URL}/manager/members`, {
        headers: { Authorization: `Bearer ${authState.jwt}` }
      });
      const data = await res.json();
      setMembers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMembers();
    }, [])
  );

  const confirmAction = async () => {
    if (!modalData) return;
    const { type, memberId } = modalData;
    setModalData(null);

    if (type === 'DELETE') {
      try {
        const res = await fetch(`${API_URL}/manager/members/${memberId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authState.jwt}` }
        });
        if (res.ok) {
          fetchMembers();
        } else {
          Alert.alert('Erreur', 'Impossible de supprimer ce membre');
        }
      } catch (e) {
        Alert.alert('Erreur', 'Erreur réseau');
      }
    } else {
      const status = type === 'ACCEPT' ? 'PAID' : 'EXPIRED';
      try {
        const res = await fetch(`${API_URL}/manager/members/${memberId}/status`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authState.jwt}` 
          },
          body: JSON.stringify({ status })
        });
        if (res.ok) {
          fetchMembers();
        } else {
          const err = await res.text();
          Alert.alert('Erreur', err || 'Mise à jour impossible');
        }
      } catch (e) {
        console.error(e);
        Alert.alert('Erreur', 'Impossible de joindre le serveur');
      }
    }
  };

  const requestAction = (type: 'ACCEPT' | 'REFUSE' | 'DELETE', memberId: number, memberName: string) => {
    setModalData({ visible: true, type, memberId, memberName });
  };

  let displayedMembers = members;
  if (activeTab === 'PENDING') {
    displayedMembers = members.filter(m => m.paymentStatus === 'PENDING');
  } else if (activeTab === 'PAID') {
    displayedMembers = members.filter(m => m.paymentStatus === 'PAID');
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayedMembers = displayedMembers.filter(m => 
      (m.firstName && m.firstName.toLowerCase().includes(q)) || 
      (m.lastName && m.lastName.toLowerCase().includes(q)) ||
      (m.phoneNumber && m.phoneNumber.includes(q))
    );
  }

  const hasMore = displayedMembers.length > visibleCount;
  const paginatedMembers = displayedMembers.slice(0, visibleCount);

  const renderModalContent = () => {
    if (!modalData) return null;
    let title = '';
    let subtitle = '';
    let btnText = '';
    let btnStyle = {};
    let iconName: any = 'help-circle';

    if (modalData.type === 'ACCEPT') {
      title = 'Valider le paiement ?';
      subtitle = `Cela ajoutera 1 mois d'abonnement à ${modalData.memberName}.`;
      btnText = 'Oui, Valider';
      btnStyle = styles.modalBtnAccept;
      iconName = 'check-circle';
    } else if (modalData.type === 'REFUSE') {
      title = 'Refuser la demande ?';
      subtitle = `L'abonnement de ${modalData.memberName} passera en expiré.`;
      btnText = 'Oui, Refuser';
      btnStyle = styles.modalBtnRefuse;
      iconName = 'x-circle';
    } else if (modalData.type === 'DELETE') {
      title = 'Supprimer le membre ?';
      subtitle = `Attention, cette action supprimera définitivement ${modalData.memberName} du système !`;
      btnText = 'Oui, Supprimer';
      btnStyle = styles.modalBtnDelete;
      iconName = 'trash-2';
    }

    return (
      <View style={styles.modalContent}>
        <Feather name={iconName} size={48} color={modalData.type === 'ACCEPT' ? colors.secondary : colors.error} style={{ marginBottom: 16 }} />
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalSubtitle}>{subtitle}</Text>

        <TouchableOpacity style={[styles.modalBtn, btnStyle]} onPress={confirmAction}>
          <Text style={styles.modalBtnText}>{btnText}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setModalData(null)}>
          <Text style={styles.modalBtnCancelText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Membres de la salle</Text>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un nom ou un numéro..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'PENDING' && styles.activeTab]} 
          onPress={() => setActiveTab('PENDING')}>
          <Text style={[styles.tabText, activeTab === 'PENDING' && styles.activeTabText]}>Demandes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'PAID' && styles.activeTab]} 
          onPress={() => setActiveTab('PAID')}>
          <Text style={[styles.tabText, activeTab === 'PAID' && styles.activeTabText]}>Abonnés</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={paginatedMembers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MemberCardItem item={item} requestAction={requestAction} />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun membre trouvé.</Text>}
          ListFooterComponent={
            hasMore ? (
              <TouchableOpacity style={styles.seeMoreBtn} onPress={() => setVisibleCount(c => c + 10)}>
                <Text style={styles.seeMoreText}>Voir plus</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}

      <Modal visible={!!modalData} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {renderModalContent()}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 64 },
  title: { color: colors.secondary, fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 16, height: 48, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: colors.text, fontSize: 16 },
  memberCard: { backgroundColor: colors.surface, padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  memberHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  memberName: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  memberPhone: { color: colors.textSecondary, fontSize: 14 },
  badge: { backgroundColor: 'rgba(166, 227, 161, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: colors.secondary, fontWeight: 'bold', fontSize: 12 },
  badgeExpired: { backgroundColor: 'rgba(243, 139, 168, 0.1)' },
  badgeTextExpired: { color: colors.error },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
  actionsContainer: { alignItems: 'flex-end', gap: 8 },
  badgePending: { backgroundColor: 'rgba(250, 179, 135, 0.1)' },
  badgeTextPending: { color: '#FAB387' },
  iconButtonsRow: { flexDirection: 'row', gap: 8 },
  iconButton: { padding: 8, borderRadius: 8, borderWidth: 1 },
  iconAccept: { backgroundColor: 'rgba(166, 227, 161, 0.1)', borderColor: colors.secondary },
  iconRefuse: { backgroundColor: 'rgba(243, 139, 168, 0.1)', borderColor: colors.error },
  iconDelete: { backgroundColor: 'rgba(108, 112, 134, 0.1)', borderColor: colors.border },
  tabContainer: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontWeight: 'bold' },
  activeTabText: { color: colors.background, fontWeight: 'bold' },
  expandedContent: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { color: colors.textSecondary, fontSize: 14 },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: 'bold' },
  actionsDivider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  actionsTitle: { color: colors.secondary, fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: colors.surface, padding: 32, borderRadius: 24, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  modalTitle: { color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  modalSubtitle: { color: colors.textSecondary, fontSize: 16, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  modalBtn: { width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  modalBtnText: { color: colors.background, fontSize: 16, fontWeight: 'bold' },
  modalBtnAccept: { backgroundColor: colors.secondary },
  modalBtnRefuse: { backgroundColor: colors.error },
  modalBtnDelete: { backgroundColor: colors.error },
  modalBtnCancel: { paddingVertical: 12 },
  modalBtnCancelText: { color: colors.textSecondary, fontSize: 16, fontWeight: 'bold' },
  seeMoreBtn: { padding: 16, backgroundColor: 'rgba(137, 180, 250, 0.1)', borderRadius: 12, alignItems: 'center', marginTop: 8 },
  seeMoreText: { color: colors.primary, fontWeight: 'bold', fontSize: 16 },
});
