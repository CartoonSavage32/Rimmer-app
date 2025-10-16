import { Trash2, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { designStyles, getDesignColors } from '../../constants/design';
import { useApp } from '../../context/AppContext';
import { Timer, TimerDuration } from '../../types';
import { durationToMinutes, minutesToDuration } from '../../utils/timeUtils';
import { DurationPicker } from '../ui/DurationPicker';
import { FrequencyPicker } from '../ui/FrequencyPicker';
import { Header } from '../ui/Header';
import { Input } from '../ui/Input';
import { TimePicker } from '../ui/TimePicker';

interface EditScreenProps {
  timer: Timer;
  onClose: () => void;
}

export const EditScreen: React.FC<EditScreenProps> = ({ timer, onClose }) => {
  const { state, updateTimer, deleteTimer, setTimeFormat } = useApp();
  const { isDark, settings } = state;
  const insets = useSafeAreaInsets();
  const colors = getDesignColors(isDark);

  const [editedTimer, setEditedTimer] = useState<Timer>(timer);
  const [duration, setDuration] = useState<TimerDuration>(minutesToDuration(timer.duration));
  const [errors, setErrors] = useState<Partial<Timer>>({});

  useEffect(() => {
    setDuration(minutesToDuration(timer.duration));
  }, [timer.duration]);

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!editedTimer.name.trim()) {
      newErrors.name = 'Timer name is required';
    }

    const durationMinutes = durationToMinutes(duration);
    if (durationMinutes < 1 || durationMinutes > 1440) {
      newErrors.duration = 'Duration must be between 1 minute and 24 hours';
    }

    if (editedTimer.times.length === 0) {
      newErrors.times = 'At least one time is required';
    }

    if (editedTimer.frequency === 'custom' && (!editedTimer.customDays || editedTimer.customDays.length === 0)) {
      newErrors.customDays = 'Please select at least one day for custom frequency';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDurationChange = (newDuration: TimerDuration) => {
    setDuration(newDuration);
    setEditedTimer({
      ...editedTimer,
      duration: durationToMinutes(newDuration),
    });
  };

  const handleTimeChange = (index: number, time: string) => {
    const newTimes = [...editedTimer.times];
    newTimes[index] = time;
    setEditedTimer({ ...editedTimer, times: newTimes });
  };

  const handleAddTime = () => {
    setEditedTimer({
      ...editedTimer,
      times: [...editedTimer.times, '12:00'],
    });
  };

  const handleRemoveTime = (index: number) => {
    if (editedTimer.times.length > 1) {
      const newTimes = editedTimer.times.filter((_, i) => i !== index);
      setEditedTimer({ ...editedTimer, times: newTimes });
    }
  };

  const handleFrequencyChange = (frequency: 'daily' | 'weekdays' | 'weekends' | 'custom', customDays?: number[]) => {
    setEditedTimer({
      ...editedTimer,
      frequency,
      customDays: customDays || [],
    });
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const timerToUpdate = {
        ...editedTimer,
        duration: durationToMinutes(duration),
        updatedAt: new Date(),
      };
      await updateTimer(timerToUpdate);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update timer. Please try again.');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Timer',
      'Are you sure you want to delete this timer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTimer(editedTimer.id);
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete timer. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[designStyles.screen.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <Header
        title="Edit Timer"
        onBackPress={onClose}
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
              value={editedTimer.name}
              onChangeText={(text) => setEditedTimer({ ...editedTimer, name: text })}
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
              {editedTimer.times.map((time, index) => (
                <View key={index} style={styles.timeRow}>
                  <TimePicker
                    time={time}
                    onTimeChange={(newTime) => handleTimeChange(index, newTime)}
                    isDark={isDark}
                    showFormatToggle={index === 0}
                    onFormatChange={setTimeFormat}
                    timeFormat={settings.timeFormat}
                  />
                  {editedTimer.times.length > 1 && (
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
              frequency={editedTimer.frequency}
              customDays={editedTimer.customDays?.map(String) || []}
              onFrequencyChange={(frequency) => handleFrequencyChange(frequency as any)}
              onCustomDaysChange={(customDays) => setEditedTimer({ ...editedTimer, customDays: customDays.map(Number) })}
              isDark={isDark}
            />
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.deleteButton, { backgroundColor: colors.red }]}
          >
            <Trash2 size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Delete Timer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          disabled={!editedTimer.name.trim()}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    paddingHorizontal: designStyles.spacing.lg,
    paddingTop: 20,
    paddingBottom: designStyles.spacing.sm,
    marginHorizontal: designStyles.spacing.sm,
    marginTop: designStyles.spacing.xs,
    borderRadius: designStyles.borderRadius.lg,
    ...designStyles.shadow.sm,
  },
  backButton: {
    padding: designStyles.spacing.sm,
    borderRadius: designStyles.borderRadius.lg,
    marginRight: designStyles.spacing.lg,
  },
  title: {
    fontSize: designStyles.fontSize.xl,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: designStyles.spacing.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: designStyles.spacing.xxl,
  },
  sectionLabel: {
    fontSize: designStyles.fontSize.sm,
    fontWeight: '600',
    marginBottom: designStyles.spacing.md,
    letterSpacing: 1,
  },
  input: {
    borderRadius: designStyles.borderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: designStyles.spacing.lg,
    paddingVertical: designStyles.spacing.lg,
    fontSize: designStyles.fontSize.md,
  },
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
    minHeight: 60,
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
    minWidth: 50,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
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
    minHeight: 60,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designStyles.spacing.sm,
    padding: designStyles.spacing.lg,
    borderRadius: designStyles.borderRadius.xl,
    marginTop: designStyles.spacing.lg,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: designStyles.fontSize.md,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: designStyles.spacing.xxl,
    paddingBottom: designStyles.spacing.xl,
    paddingTop: designStyles.spacing.lg,
    borderTopWidth: 1,
  },
  saveButton: {
    paddingVertical: designStyles.spacing.lg,
    borderRadius: designStyles.borderRadius.xxl,
    alignItems: 'center',
    ...designStyles.shadow.lg,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: designStyles.fontSize.lg,
    fontWeight: '600',
  },
});
