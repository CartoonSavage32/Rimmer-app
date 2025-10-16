import { addDays, isWeekend } from 'date-fns';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Timer } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  /**
   * Get the current device time more accurately
   */
  private getCurrentDeviceTime(): Date {
    return new Date();
  }

  /**
   * Create a precise notification time using device timezone
   */
  private createNotificationTime(hours: number, minutes: number, baseDate?: Date): Date {
    const base = baseDate || this.getCurrentDeviceTime();
    const notificationTime = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    notificationTime.setHours(hours, minutes, 0, 0);
    return notificationTime;
  }

  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Reminder Timer',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  }

  async scheduleTimerNotifications(timer: Timer): Promise<void> {
    if (!timer.enabled) return;

    // Cancel existing notifications for this timer
    await this.cancelTimerNotifications(timer.id);

    // Get current device time
    const deviceTime = this.getCurrentDeviceTime();

    for (const timeString of timer.times) {
      const [hours, minutes] = timeString.split(':').map(Number);
      
      // Create notification time using device's timezone
      const notificationTime = this.createNotificationTime(hours, minutes, deviceTime);

      // If the time has already passed today, schedule for tomorrow
      if (notificationTime <= deviceTime) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }

      // Schedule notifications based on frequency
      if (timer.frequency === 'daily') {
        await this.scheduleDailyNotification(timer, notificationTime);
      } else if (timer.frequency === 'weekdays') {
        await this.scheduleWeekdayNotifications(timer, notificationTime);
      } else if (timer.frequency === 'weekends') {
        await this.scheduleWeekendNotifications(timer, notificationTime);
      } else {
        // Custom frequency - for now, treat as daily
        await this.scheduleDailyNotification(timer, notificationTime);
      }
    }
  }

  private async scheduleDailyNotification(timer: Timer, notificationTime: Date): Promise<void> {
    const trigger: Notifications.NotificationTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notificationTime,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Timer Reminder',
        body: `Time for ${timer.name} (${timer.duration} minutes)`,
        data: {
          timerId: timer.id,
          timerName: timer.name,
          duration: timer.duration,
        },
        sound: 'default',
      },
      trigger,
    });
  }

  private async scheduleWeekdayNotifications(timer: Timer, notificationTime: Date): Promise<void> {
    // Schedule for the next 7 days, but only weekdays
    for (let i = 0; i < 7; i++) {
      const scheduleDate = addDays(notificationTime, i);
      if (!isWeekend(scheduleDate)) {
        // Ensure we're using the device's timezone for the scheduled date
        const deviceScheduleDate = new Date(scheduleDate.getTime());
        const trigger: Notifications.NotificationTriggerInput = {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: deviceScheduleDate,
        };

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Timer Reminder',
            body: `Time for ${timer.name} (${timer.duration} minutes)`,
            data: {
              timerId: timer.id,
              timerName: timer.name,
              duration: timer.duration,
            },
            sound: 'default',
          },
          trigger,
        });
      }
    }
  }

  private async scheduleWeekendNotifications(timer: Timer, notificationTime: Date): Promise<void> {
    // Schedule for the next 7 days, but only weekends
    for (let i = 0; i < 7; i++) {
      const scheduleDate = addDays(notificationTime, i);
      if (isWeekend(scheduleDate)) {
        // Ensure we're using the device's timezone for the scheduled date
        const deviceScheduleDate = new Date(scheduleDate.getTime());
        const trigger: Notifications.NotificationTriggerInput = {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: deviceScheduleDate,
        };

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Timer Reminder',
            body: `Time for ${timer.name} (${timer.duration} minutes)`,
            data: {
              timerId: timer.id,
              timerName: timer.name,
              duration: timer.duration,
            },
            sound: 'default',
          },
          trigger,
        });
      }
    }
  }

  async cancelTimerNotifications(timerId: string): Promise<void> {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const timerNotifications = scheduledNotifications.filter(
      notification => notification.content.data?.timerId === timerId
    );

    for (const notification of timerNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
}

export const notificationService = new NotificationService();
