export interface Training {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  active: boolean;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'MANAGER' | 'CLIENT';
  subscriptionEndDate?: string;
  paymentStatus?: 'PENDING' | 'PAID' | 'OVERDUE';
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
