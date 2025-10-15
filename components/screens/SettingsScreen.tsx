import { Bell, Check, Monitor, Moon, Sun, X } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../context/AppContext';
import { notificationService } from '../../services/NotificationService';
import { Theme } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { IconButton } from '../ui/IconButton';
import { Switch } from '../ui/Switch';

const THEME_OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
] as const;

export const SettingsScreen: React.FC = () => {
  const { state, setTheme, setScreen } = useApp();
  const { settings, isDark } = state;

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const hasPermission = await notificationService.requestPermissions();
    setNotificationsEnabled(hasPermission);
  };

  const handleThemeChange = async (theme: Theme) => {
    try {
      await setTheme(theme);
    } catch (error) {
      Alert.alert('Error', 'Failed to update theme. Please try again.');
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to use timer reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    setNotificationsEnabled(enabled);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#FFFFFF' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#F9FAFB' : '#111827' }]}>
          Settings
        </Text>
        <IconButton
          icon={<X size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />}
          onPress={() => setScreen('home')}
          variant="ghost"
        />
      </View>

      <View style={styles.content}>
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            Appearance
          </Text>
          
          <View style={styles.themeOptions}>
            {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
              <Button
                key={value}
                title=""
                onPress={() => handleThemeChange(value)}
                variant={settings.theme === value ? 'primary' : 'outline'}
                style={styles.themeButton}
                icon={
                  <View style={styles.themeButtonContent}>
                    <Icon size={18} color={settings.theme === value ? '#FFFFFF' : (isDark ? '#D1D5DB' : '#374151')} />
                    <Text style={[
                      styles.themeButtonText,
                      {
                        color: settings.theme === value ? '#FFFFFF' : (isDark ? '#D1D5DB' : '#374151')
                      }
                    ]}>
                      {label}
                    </Text>
                    {settings.theme === value && (
                      <Check size={18} color="#FFFFFF" />
                    )}
                  </View>
                }
              />
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            Notifications
          </Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Bell size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.settingLabel, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                  Timer Reminders
                </Text>
              </View>
              <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Receive notifications for your scheduled timers
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              size="medium"
            />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            About
          </Text>
          
          <View style={styles.aboutInfo}>
            <Text style={[styles.appName, { color: isDark ? '#F9FAFB' : '#111827' }]}>
              Reminder Timer
            </Text>
            <Text style={[styles.appVersion, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Version 1.0.0
            </Text>
            <Text style={[styles.appDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              A simple and elegant timer reminder app to help you stay on track with your daily routines.
            </Text>
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  themeOptions: {
    gap: 8,
  },
  themeButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  themeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    justifyContent: 'space-between',
  },
  themeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  aboutInfo: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
