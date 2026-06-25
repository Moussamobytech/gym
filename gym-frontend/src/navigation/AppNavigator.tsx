import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { AuthContextType } from '../types/auth';
import { RootStackParamList, ClientTabParamList, ManagerTabParamList } from '../types/navigation';
import { API_URL } from '../config';
import { usePushNotifications } from '../hooks/usePushNotifications';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PreAuthScannerScreen from '../screens/PreAuthScannerScreen';
import ClientHomeScreen from '../screens/ClientHomeScreen';
import ClientQRCodeScreen from '../screens/ClientQRCodeScreen';
import ClientProfileScreen from '../screens/ClientProfileScreen';
import ClientTrainingDetailsScreen from '../screens/ClientTrainingDetailsScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';
import ManagerQRCodeScreen from '../screens/ManagerQRCodeScreen';
import ManagerMembersScreen from '../screens/ManagerMembersScreen';
import ManagerProfileScreen from '../screens/ManagerProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const ClientTab = createBottomTabNavigator<ClientTabParamList>();
const ManagerTab = createBottomTabNavigator<ManagerTabParamList>();

function ClientTabs() {
  return (
    <ClientTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          if (route.name === 'Home') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'QRCode') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <ClientTab.Screen name="Home" component={ClientHomeScreen} options={{ title: 'Salles' }} />
      <ClientTab.Screen name="QRCode" component={ClientQRCodeScreen} options={{ title: 'Mon Accès' }} />
      <ClientTab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifs' }} />
      <ClientTab.Screen name="Profile" component={ClientProfileScreen} options={{ title: 'Profil' }} />
    </ClientTab.Navigator>
  );
}

function ManagerTabs() {
  return (
    <ManagerTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'QRCode') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else {
            iconName = focused ? 'people' : 'people-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <ManagerTab.Screen name="Dashboard" component={ManagerDashboardScreen} options={{ title: 'Salles' }} />
      <ManagerTab.Screen name="QRCode" component={ManagerQRCodeScreen} options={{ title: 'Code Salle' }} />
      <ManagerTab.Screen name="Members" component={ManagerMembersScreen} options={{ title: 'Membres' }} />
    </ManagerTab.Navigator>
  );
}

export default function AppNavigator() {
  const { authState, isLoading } = useContext(AuthContext) as AuthContextType & { isLoading: boolean };
  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    if (authState.jwt && expoPushToken) {
      // Send token to backend
      fetch(`${API_URL}/users/push-token`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.jwt}`
        },
        body: JSON.stringify({ pushToken: expoPushToken })
      }).catch(err => console.log('Failed to update push token', err));
    }
  }, [authState.jwt, expoPushToken]);

  if (isLoading) {
    return null; // ou un écran de chargement (ActivityIndicator)
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!authState.jwt ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="PreAuthScanner" component={PreAuthScannerScreen} />
          </>
        ) : authState.role === 'MANAGER' ? (
          <>
            <Stack.Screen name="ManagerRoot" component={ManagerTabs} />
            <Stack.Screen name="ManagerProfile" component={ManagerProfileScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="ClientRoot" component={ClientTabs} />
            <Stack.Screen name="ClientTrainingDetails" component={ClientTrainingDetailsScreen} options={{ presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
