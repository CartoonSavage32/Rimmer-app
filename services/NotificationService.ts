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

    // Configure notification channels for Android
    if (Platform.OS === 'android') {
      // Timer alert channel
      await Notifications.setNotificationChannelAsync('timer-alerts', {
        name: 'Timer Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });

      // Running timer channel (persistent, silent updates)
      await Notifications.setNotificationChannelAsync('running-timer', {
        name: 'Running Timer',
        importance: Notifications.AndroidImportance.LOW, // Lower importance for silent updates
        vibrationPattern: [], // No vibration
        lightColor: '#FF231F7C',
        enableLights: false, // No lights
        enableVibrate: false,
        showBadge: false,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        sound: null, // No sound for silent updates
      });

      // Timer completion channel
      await Notifications.setNotificationChannelAsync('timer-completion', {
        name: 'Timer Completion',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#10B981',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
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
        title: 'Rimmer Timer',
        body: `Time for ${timer.name} (${timer.duration} minutes)`,
        data: {
          timerId: timer.id,
          timerName: timer.name,
          duration: timer.duration,
          action: 'timer_alert',
        },
        sound: 'default',
        categoryIdentifier: 'TIMER_ALERT',
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
            title: 'Rimmer Timer',
            body: `Time for ${timer.name} (${timer.duration} minutes)`,
            data: {
              timerId: timer.id,
              timerName: timer.name,
              duration: timer.duration,
              action: 'timer_alert',
            },
            sound: 'default',
            categoryIdentifier: 'TIMER_ALERT',
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
            title: 'Rimmer Timer',
            body: `Time for ${timer.name} (${timer.duration} minutes)`,
            data: {
              timerId: timer.id,
              timerName: timer.name,
              duration: timer.duration,
              action: 'timer_alert',
            },
            sound: 'default',
            categoryIdentifier: 'TIMER_ALERT',
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

  // Setup notification categories for interactive notifications
  async setupNotificationCategories(): Promise<void> {
    await Notifications.setNotificationCategoryAsync('TIMER_ALERT', [
      {
        identifier: 'START_TIMER',
        buttonTitle: 'Start Timer',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
      {
        identifier: 'SNOOZE_TIMER',
        buttonTitle: 'Snooze 5min',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('RUNNING_TIMER', [
      {
        identifier: 'STOP_TIMER',
        buttonTitle: 'Stop Timer',
        options: {
          isDestructive: true,
          isAuthenticationRequired: false,
        },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('TIMER_COMPLETION', [
      {
        identifier: 'CLEAR_NOTIFICATION',
        buttonTitle: 'Clear',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
    ]);
  }

  // Show persistent running timer notification
  async showRunningTimerNotification(timer: Timer): Promise<void> {
    const remainingMinutes = Math.floor((timer.remainingTime || 0) / 60);
    const remainingSeconds = (timer.remainingTime || 0) % 60;
    
    // Use a fixed identifier for this timer's running notification
    const notificationId = `running_timer_${timer.id}`;
    
    await Notifications.scheduleNotificationAsync({
      identifier: notificationId,
      content: {
        title: '⏱️ Timer Running',
        body: `${timer.name} - ${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')} remaining`,
        data: {
          timerId: timer.id,
          timerName: timer.name,
          duration: timer.duration,
          action: 'running_timer',
        },
        categoryIdentifier: 'RUNNING_TIMER',
        sticky: true, // Makes notification persistent
        priority: Notifications.AndroidNotificationPriority.LOW, // Lower priority for silent updates
        // Prevent notification from alerting on every update
        sound: false,
        vibrate: [],
      },
      trigger: null, // Show immediately
    });
  }

  // Update running timer notification in place (real-time updates)
  async updateRunningTimerNotification(timer: Timer): Promise<void> {
    const remainingMinutes = Math.floor((timer.remainingTime || 0) / 60);
    const remainingSeconds = (timer.remainingTime || 0) % 60;
    
    // Use the same fixed identifier to update the existing notification
    const notificationId = `running_timer_${timer.id}`;
    
    // Dismiss the existing notification silently
    await Notifications.dismissNotificationAsync(notificationId);
    
    // Schedule updated notification with same ID (silent update)
    await Notifications.scheduleNotificationAsync({
      identifier: notificationId,
      content: {
        title: '⏱️ Timer Running',
        body: `${timer.name} - ${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')} remaining`,
        data: {
          timerId: timer.id,
          timerName: timer.name,
          duration: timer.duration,
          action: 'running_timer',
        },
        categoryIdentifier: 'RUNNING_TIMER',
        sticky: true,
        priority: Notifications.AndroidNotificationPriority.LOW, // Lower priority for silent updates
        // Silent update - no sound or vibration
        sound: false,
        vibrate: [],
      },
      trigger: null,
    });
  }

  // Cancel running timer notification
  async cancelRunningTimerNotification(timerId: string): Promise<void> {
    const notificationId = `running_timer_${timerId}`;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Show timer completion notification
  async showTimerCompletionNotification(timer: Timer): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Timer Complete!',
        body: `${timer.name} has finished (${timer.duration} minutes)`,
        data: {
          timerId: timer.id,
          timerName: timer.name,
          duration: timer.duration,
          action: 'timer_completion',
        },
        categoryIdentifier: 'TIMER_COMPLETION',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Show immediately
    });
  }

  // Handle notification response (button taps)
  async handleNotificationResponse(response: Notifications.NotificationResponse): Promise<{ action: string; timerId: string } | null> {
    const { actionIdentifier, notification } = response;
    const data = notification.request.content.data as any;

    if (!data) return null;

    switch (actionIdentifier) {
      case 'START_TIMER':
        // This will be handled by the app context
        return { action: 'START_TIMER', timerId: data.timerId };
      
      case 'SNOOZE_TIMER':
        // Schedule a new notification in 5 minutes
        const snoozeTime = new Date(Date.now() + 5 * 60 * 1000);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Rimmer Timer',
            body: `Time for ${data.timerName} (${data.duration} minutes)`,
            data: {
              timerId: data.timerId,
              timerName: data.timerName,
              duration: data.duration,
              action: 'timer_alert',
            },
            sound: 'default',
            categoryIdentifier: 'TIMER_ALERT',
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: snoozeTime },
        });
        return { action: 'SNOOZE_TIMER', timerId: data.timerId };
      
      case 'STOP_TIMER':
        return { action: 'STOP_TIMER', timerId: data.timerId };
      
      case 'CLEAR_NOTIFICATION':
        // Notification will be dismissed automatically
        return { action: 'CLEAR_NOTIFICATION', timerId: data.timerId };
      
      default:
        return null;
    }
  }
}

export const notificationService = new NotificationService();
