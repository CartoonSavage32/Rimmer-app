import { Plus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { designStyles, getDesignColors } from '../../constants/design';
import { useApp } from '../../context/AppContext';
import { NewTimer, TimerDuration } from '../../types';
import { durationToMinutes, minutesToDuration } from '../../utils/timeUtils';
import { DurationPicker } from '../ui/DurationPicker';
import { FrequencyPicker } from '../ui/FrequencyPicker';
import { Header } from '../ui/Header';
import { Input } from '../ui/Input';
import { TimePicker } from '../ui/TimePicker';

export const CreateScreen: React.FC = () => {
  const { state, addTimer, setScreen, setTimeFormat } = useApp();
  const { isDark, settings } = state;
  const colors = getDesignColors(isDark);

  const [newTimer, setNewTimer] = useState<NewTimer>({
    name: '',
    duration: 3,
    times: ['09:00'],
    frequency: 'daily',
    customDays: [],
  });

  const [duration, setDuration] = useState<TimerDuration>(minutesToDuration(3));

  const [errors, setErrors] = useState<Partial<NewTimer>>({});

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!newTimer.name.trim()) {
      newErrors.name = 'Timer name is required';
    }

    const durationMinutes = durationToMinutes(duration);
    if (durationMinutes < 1 || durationMinutes > 1440) {
      newErrors.duration = 'Duration must be between 1 minute and 24 hours';
    }

    if (newTimer.times.length === 0) {
      newErrors.times = 'At least one time is required';
    }

    if (newTimer.frequency === 'custom' && (!newTimer.customDays || newTimer.customDays.length === 0)) {
      newErrors.customDays = 'Please select at least one day for custom frequency';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTime = () => {
    setNewTimer({
      ...newTimer,
      times: [...newTimer.times, '12:00'],
    });
  };

  const handleRemoveTime = (index: number) => {
    if (newTimer.times.length > 1) {
      const newTimes = newTimer.times.filter((_, i) => i !== index);
      setNewTimer({ ...newTimer, times: newTimes });
    }
  };

  const handleTimeChange = (index: number, time: string) => {
    const newTimes = [...newTimer.times];
    newTimes[index] = time;
    setNewTimer({ ...newTimer, times: newTimes });
  };

  const handleDurationChange = (newDuration: TimerDuration) => {
    setDuration(newDuration);
    setNewTimer({
      ...newTimer,
      duration: durationToMinutes(newDuration),
    });
  };

  const handleFrequencyChange = (frequency: 'daily' | 'weekdays' | 'weekends' | 'custom', customDays?: number[]) => {
    setNewTimer({
      ...newTimer,
      frequency,
      customDays: customDays || [],
    });
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      const timerToCreate = {
        ...newTimer,
        duration: durationToMinutes(duration),
      };
      await addTimer(timerToCreate);
      setScreen('home');
    } catch (error) {
      Alert.alert('Error', 'Failed to create timer. Please try again.');
    }
  };

  return (
    <View style={[designStyles.screen.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <Header
        title="New Timer"
        onBackPress={() => setScreen('home')}
        isDark={isDark}
      />

      {/* Content */}
      <ScrollView style={designStyles.screen.content} showsVerticalScrollIndicator={false}>
        <View style={[designStyles.screen.formContent, { paddingTop: designStyles.spacing.xl }]}>
          {/* Timer Name */}
          <View style={designStyles.screen.section}>
            <Text style={[designStyles.screen.sectionLabel, { color: colors.text }]}>
              TIMER NAME
            </Text>
            <Input
              value={newTimer.name}
              onChangeText={(text) => setNewTimer({ ...newTimer, name: text })}
              placeholder="e.g., Morning Meditation"
              error={errors.name}
              style={StyleSheet.flatten([designStyles.screen.input, { backgroundColor: colors.inputBg, borderColor: colors.border }])}
              inputStyle={{ color: colors.text }}
            />
          </View>

          {/* Duration */}
          <View style={designStyles.screen.section}>
            <Text style={[designStyles.screen.sectionLabel, { color: colors.text }]}>
              DURATION
            </Text>
            <DurationPicker
              duration={duration}
              onDurationChange={(newDuration) => {
                const timerDuration: TimerDuration = {
                  ...newDuration,
                  milliseconds: 0
                };
                handleDurationChange(timerDuration);
              }}
              isDark={isDark}
            />
          </View>

          {/* Notification Times */}
          <View style={designStyles.screen.section}>
            <Text style={[designStyles.screen.sectionLabel, { color: colors.text }]}>
              NOTIFICATION TIMES
            </Text>
            <View style={styles.timesContainer}>
              {newTimer.times.map((time, index) => (
                <View key={index} style={styles.timeRow}>
                  <TimePicker
                    time={time}
                    onTimeChange={(newTime) => handleTimeChange(index, newTime)}
                    isDark={isDark}
                    showFormatToggle={index === 0}
                    onFormatChange={setTimeFormat}
                    timeFormat={settings.timeFormat}
                  />
                  {newTimer.times.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveTime(index)}
                      style={[styles.removeTimeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                      <X size={20} color={colors.text} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              <TouchableOpacity
                onPress={handleAddTime}
                style={[styles.addTimeButton, { borderColor: colors.border }]}
              >
                <Plus size={20} color={colors.text} />
                <Text style={[styles.addTimeText, { color: colors.text }]}>Add Time</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Frequency */}
          <View style={designStyles.screen.section}>
            <Text style={[designStyles.screen.sectionLabel, { color: colors.text }]}>
              FREQUENCY
            </Text>
            <FrequencyPicker
              frequency={newTimer.frequency}
              customDays={newTimer.customDays?.map(String) || []}
              onFrequencyChange={(frequency) => handleFrequencyChange(frequency as any)}
              onCustomDaysChange={(customDays) => setNewTimer({ ...newTimer, customDays: customDays.map(Number) })}
              isDark={isDark}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleCreate}
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          disabled={!newTimer.name.trim()}
        >
          <Text style={styles.createButtonText}>Create Timer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  durationCard: {
    borderRadius: designStyles.borderRadius.xxl,
    padding: designStyles.spacing.xxl,
    borderWidth: 1,
  },
  durationDisplay: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: designStyles.spacing.xxl,
    fontFamily: 'monospace',
  },
  durationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: designStyles.spacing.sm,
  },
  durationColumn: {
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
  },
  durationLabel: {
    fontSize: designStyles.fontSize.xs,
    fontWeight: '500',
    marginBottom: designStyles.spacing.sm,
  },
  durationButtons: {
    alignItems: 'center',
    gap: designStyles.spacing.sm,
  },
  durationButton: {
    padding: designStyles.spacing.md,
    borderRadius: designStyles.borderRadius.lg,
    minWidth: 48,
    alignItems: 'center',
  },
  durationButtonText: {
    fontSize: designStyles.fontSize.lg,
    fontWeight: '600',
  },
  durationInput: {
    borderRadius: designStyles.borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: designStyles.spacing.md,
    paddingVertical: designStyles.spacing.md,
    minWidth: 60,
    textAlign: 'center',
  },
  timesContainer: {
    gap: designStyles.spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designStyles.spacing.md,
  },
  timeInput: {
    flex: 1,
    borderRadius: designStyles.borderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: designStyles.spacing.lg,
    paddingVertical: designStyles.spacing.lg,
    fontFamily: 'monospace',
  },
  removeTimeButton: {
    padding: designStyles.spacing.lg,
    borderRadius: designStyles.borderRadius.xl,
    borderWidth: 1,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designStyles.spacing.sm,
    padding: designStyles.spacing.lg,
    borderRadius: designStyles.borderRadius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addTimeText: {
    fontSize: designStyles.fontSize.md,
    fontWeight: '500',
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designStyles.spacing.md,
  },
  frequencyButton: {
    flex: 1,
    minWidth: '45%',
    padding: designStyles.spacing.lg,
    borderRadius: designStyles.borderRadius.xl,
    alignItems: 'center',
  },
  frequencyButtonText: {
    fontSize: designStyles.fontSize.md,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: designStyles.spacing.xxl,
    paddingBottom: designStyles.spacing.xl,
    paddingTop: designStyles.spacing.lg,
    borderTopWidth: 1,
  },
  createButton: {
    paddingVertical: designStyles.spacing.lg,
    borderRadius: designStyles.borderRadius.xxl,
    alignItems: 'center',
    ...designStyles.shadow.lg,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: designStyles.fontSize.lg,
    fontWeight: '600',
  },
});
