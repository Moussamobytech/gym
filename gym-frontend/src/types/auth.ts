export type Role = 'CLIENT' | 'MANAGER';

export interface AuthState {
  isAuthenticated: boolean;
  role: Role | null;
  jwt: string | null;
  qrCodeId: string | null;
}

export interface AuthContextType {
  authState: AuthState;
  login: (jwt: string, role: Role, qrCodeId: string) => void;
  logout: () => void;
}
