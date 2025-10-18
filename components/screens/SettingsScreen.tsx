import { Bell, Check, Monitor, Moon, Sun } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { designStyles, getDesignColors } from '../../constants/design';
import { useApp } from '../../context/AppContext';
import { notificationService } from '../../services/NotificationService';
import { Theme } from '../../types';
import { ToggleSwitch } from '../ui/ToggleSwitch';

const THEME_OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
] as const;

export const SettingsScreen: React.FC = () => {
  const { state, setTheme, setTimeFormat } = useApp();
  const { settings, isDark } = state;
  const colors = getDesignColors(isDark);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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

  const handleTimeFormatChange = async (format: '12h' | '24h') => {
    try {
      await setTimeFormat(format);
    } catch (error) {
      Alert.alert('Error', 'Failed to update time format. Please try again.');
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to use Rimmer timers.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    setNotificationsEnabled(enabled);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            APPEARANCE
          </Text>
          <View style={styles.optionsContainer}>
            {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
              <TouchableOpacity
                key={value}
                onPress={() => handleThemeChange(value)}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: settings.theme === value ? colors.primary : colors.inputBg,
                  }
                ]}
              >
                <View style={styles.optionContent}>
                  <Icon size={20} color={settings.theme === value ? '#FFFFFF' : colors.text} />
                  <Text style={[
                    styles.optionText,
                    { color: settings.theme === value ? '#FFFFFF' : colors.text }
                  ]}>
                    {label}
                  </Text>
                  {settings.theme === value && <Check size={20} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Format */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            TIME FORMAT
          </Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              onPress={() => handleTimeFormatChange('12h')}
              style={[
                styles.optionButton,
                {
                  backgroundColor: settings.timeFormat === '12h' ? colors.primary : colors.inputBg,
                }
              ]}
            >
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionText,
                  { color: settings.timeFormat === '12h' ? '#FFFFFF' : colors.text }
                ]}>
                  12 Hour (AM/PM)
                </Text>
                {settings.timeFormat === '12h' && <Check size={20} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTimeFormatChange('24h')}
              style={[
                styles.optionButton,
                {
                  backgroundColor: settings.timeFormat === '24h' ? colors.primary : colors.inputBg,
                }
              ]}
            >
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionText,
                  { color: settings.timeFormat === '24h' ? '#FFFFFF' : colors.text }
                ]}>
                  24 Hour
                </Text>
                {settings.timeFormat === '24h' && <Check size={20} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            NOTIFICATIONS
          </Text>
          <View style={[styles.settingRow, { backgroundColor: colors.inputBg }]}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Bell size={20} color={colors.text} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Rimmer Timers
                </Text>
              </View>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Receive notifications for your scheduled timers
              </Text>
            </View>
            <ToggleSwitch
              checked={notificationsEnabled}
              onChange={() => handleNotificationToggle(!notificationsEnabled)}
              size="medium"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: designStyles.spacing.xxl,
    paddingTop: designStyles.spacing.lg,
  },
  section: {
    marginBottom: designStyles.spacing.xxxl,
  },
  sectionLabel: {
    fontSize: designStyles.fontSize.sm,
    fontWeight: '600',
    marginBottom: designStyles.spacing.md,
    letterSpacing: 1,
  },
  optionsContainer: {
    gap: designStyles.spacing.sm,
  },
  optionButton: {
    padding: designStyles.spacing.lg,
    borderRadius: designStyles.borderRadius.xl,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontSize: designStyles.fontSize.md,
    fontWeight: '500',
    flex: 1,
    marginLeft: designStyles.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: designStyles.spacing.lg,
    borderRadius: designStyles.borderRadius.xl,
  },
  settingInfo: {
    flex: 1,
    marginRight: designStyles.spacing.lg,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designStyles.spacing.sm,
    marginBottom: designStyles.spacing.xs,
  },
  settingLabel: {
    fontSize: designStyles.fontSize.md,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: designStyles.fontSize.sm,
    lineHeight: 20,
  },
});