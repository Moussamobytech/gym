import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { Training } from './data';

export type ClientTabParamList = {
  Home: undefined;
  QRCode: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type ManagerTabParamList = {
  Dashboard: undefined;
  QRCode: undefined;
  Members: undefined;
};

export type SuperAdminTabParamList = {
  Dashboard: undefined;
  CreateUser: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Login: { intent?: string, managerId?: string } | undefined;
  Register: { managerId?: string } | undefined;
  PreAuthScanner: undefined;
  ClientRoot: NavigatorScreenParams<ClientTabParamList>;
  ManagerRoot: NavigatorScreenParams<ManagerTabParamList>;
  SuperAdminRoot: NavigatorScreenParams<SuperAdminTabParamList>;
  ManagerProfile: undefined;
  Notifications: undefined;
  ClientTrainingDetails: { training: Training };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type ClientTabScreenProps<T extends keyof ClientTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<ClientTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type ManagerTabScreenProps<T extends keyof ManagerTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<ManagerTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type SuperAdminTabScreenProps<T extends keyof SuperAdminTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<SuperAdminTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;
