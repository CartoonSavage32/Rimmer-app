export interface Timer {
  id: string;
  name: string;
  duration: number; // in minutes
  times: string[]; // HH:MM format
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewTimer {
  name: string;
  duration: number;
  times: string[];
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
}

export type Theme = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: Theme;
  notificationsEnabled: boolean;
}

export interface NotificationData {
  timerId: string;
  timerName: string;
  duration: number;
}

export type Screen = 'home' | 'create' | 'settings';
