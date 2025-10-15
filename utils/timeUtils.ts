import { TimerDuration } from '../types';

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

// Convert duration in minutes to TimerDuration object
export const minutesToDuration = (minutes: number): TimerDuration => {
  const totalMs = minutes * 60 * 1000;
  const hours = Math.floor(totalMs / (1000 * 60 * 60));
  const remainingMs = totalMs % (1000 * 60 * 60);
  const mins = Math.floor(remainingMs / (1000 * 60));
  const remainingMs2 = remainingMs % (1000 * 60);
  const seconds = Math.floor(remainingMs2 / 1000);
  const milliseconds = remainingMs2 % 1000;

  return { hours, minutes: mins, seconds, milliseconds };
};

// Convert TimerDuration object to minutes
export const durationToMinutes = (duration: TimerDuration): number => {
  return duration.hours * 60 + duration.minutes + duration.seconds / 60 + duration.milliseconds / (1000 * 60);
};

// Format duration as HH:MM:SS:ZZ
export const formatDuration = (duration: TimerDuration): string => {
  const h = duration.hours.toString().padStart(2, '0');
  const m = duration.minutes.toString().padStart(2, '0');
  const s = duration.seconds.toString().padStart(2, '0');
  const z = Math.floor(duration.milliseconds / 10).toString().padStart(2, '0');
  return `${h}:${m}:${s}:${z}`;
};

// Parse duration string (HH:MM:SS:ZZ) to TimerDuration
export const parseDuration = (durationStr: string): TimerDuration => {
  const parts = durationStr.split(':').map(Number);
  return {
    hours: parts[0] || 0,
    minutes: parts[1] || 0,
    seconds: parts[2] || 0,
    milliseconds: (parts[3] || 0) * 10,
  };
};

// Format time for display (12h or 24h format)
export const formatTime = (time: string, format: '12h' | '24h'): string => {
  const [hours, minutes] = time.split(':').map(Number);
  
  if (format === '24h') {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // 12h format
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours < 12 ? 'AM' : 'PM';
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

// Convert 12h time to 24h time
export const convertTo24Hour = (time12h: string): string => {
  const [time, ampm] = time12h.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  let hour24 = hours;
  if (ampm === 'AM' && hours === 12) {
    hour24 = 0;
  } else if (ampm === 'PM' && hours !== 12) {
    hour24 = hours + 12;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Convert 24h time to 12h time
export const convertTo12Hour = (time24h: string): string => {
  const [hours, minutes] = time24h.split(':').map(Number);
  
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours < 12 ? 'AM' : 'PM';
  
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

// Get device time format preference
export const getDeviceTimeFormat = (): '12h' | '24h' => {
  // This is a simplified version - in a real app, you'd use platform-specific APIs
  // For now, we'll default to 24h format
  return '24h';
};

// Format frequency display text
export const formatFrequency = (frequency: string, customDays?: number[]): string => {
  switch (frequency) {
    case 'daily':
      return 'Daily';
    case 'weekdays':
      return 'Weekdays';
    case 'weekends':
      return 'Weekends';
    case 'custom':
      if (customDays && customDays.length > 0) {
        const dayNames = customDays.map(day => DAYS_OF_WEEK[day].short).join(', ');
        return `Custom (${dayNames})`;
      }
      return 'Custom';
    default:
      return frequency;
  }
};
