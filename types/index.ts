export interface Timer {
  id: string;
  name: string;
  duration: number; // in minutes
  times: string[]; // HH:MM format
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  customDays?: number[]; // 0-6 for Sunday-Saturday when frequency is 'custom'
  enabled: boolean;
  isRunning?: boolean; // for manual trigger
  remainingTime?: number; // in seconds for countdown
  createdAt: Date;
  updatedAt: Date;
}

export interface NewTimer {
  name: string;
  duration: number;
  times: string[];
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  customDays?: number[];
}

export interface TimerDuration {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export type Theme = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: Theme;
  notificationsEnabled: boolean;
  timeFormat: '12h' | '24h';
}

export interface NotificationData {
  timerId: string;
  timerName: string;
  duration: number;
}

export type Screen = 'home' | 'create' | 'settings' | 'notifications';
