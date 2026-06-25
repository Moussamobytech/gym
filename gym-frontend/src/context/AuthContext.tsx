import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, AuthState, Role } from '../types/auth';

export const AuthContext = createContext<AuthContextType & { isLoading: boolean }>({} as any);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    jwt: null,
    qrCodeId: null,
  });

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const storedSession = await AsyncStorage.getItem('session');
      if (storedSession) {
        setAuthState(JSON.parse(storedSession));
      }
    } catch (e) {
      console.error('Failed to load session', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (jwt: string, role: Role, qrCodeId: string) => {
    const newState = { isAuthenticated: true, role, jwt, qrCodeId };
    setAuthState(newState);
    await AsyncStorage.setItem('session', JSON.stringify(newState));
  };

  const logout = async () => {
    setAuthState({ isAuthenticated: false, role: null, jwt: null, qrCodeId: null });
    await AsyncStorage.removeItem('session');
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
