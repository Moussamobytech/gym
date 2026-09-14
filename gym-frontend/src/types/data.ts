export interface Training {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  active: boolean;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'MANAGER' | 'CLIENT' | 'SUPER_ADMIN';
  subscriptionEndDate?: string;
  paymentStatus?: 'PENDING' | 'PAID' | 'EXPIRED' | 'OVERDUE';
  createdAt?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
