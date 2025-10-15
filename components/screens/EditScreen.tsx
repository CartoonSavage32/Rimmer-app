import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Timer, TimerDuration } from '../../types';
import { durationToMinutes, minutesToDuration } from '../../utils/timeUtils';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { DurationPicker } from '../ui/DurationPicker';
import { FrequencyPicker } from '../ui/FrequencyPicker';
import { IconButton } from '../ui/IconButton';
import { Input } from '../ui/Input';
import { TimePicker } from '../ui/TimePicker';

interface EditScreenProps {
  timer: Timer;
  onClose: () => void;
}

export const EditScreen: React.FC<EditScreenProps> = ({ timer, onClose }) => {
  const { state, updateTimer, setTimeFormat } = useApp();
  const { isDark, settings } = state;

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

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#FFFFFF' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#F9FAFB' : '#111827' }]}>
          Edit Timer
        </Text>
        <IconButton
          icon={<X size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />}
          onPress={onClose}
          variant="ghost"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.section}>
          <Input
            label="Timer Name"
            value={editedTimer.name}
            onChangeText={(text) => setEditedTimer({ ...editedTimer, name: text })}
            placeholder="e.g., Morning Meditation"
            error={errors.name}
          />
        </Card>

        <DurationPicker
          value={duration}
          onChange={handleDurationChange}
          isDark={isDark}
        />

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            Notification Times
          </Text>
          
           {editedTimer.times.map((time, index) => (
             <View key={index} style={styles.timeRow}>
               <TimePicker
                 value={time}
                 onChange={(newTime) => handleTimeChange(index, newTime)}
                 format={settings.timeFormat}
                 onFormatChange={setTimeFormat}
                 isDark={isDark}
                 error={typeof errors.times === 'string' ? errors.times : undefined}
                 showFormatToggle={index === 0}
               />
               {editedTimer.times.length > 1 && (
                 <IconButton
                   icon={<X size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />}
                   onPress={() => handleRemoveTime(index)}
                   variant="ghost"
                   size="small"
                 />
               )}
             </View>
           ))}

          <Button
            title="Add Time"
            onPress={handleAddTime}
            variant="outline"
            style={styles.addTimeButton}
          />
        </Card>

        <FrequencyPicker
          frequency={editedTimer.frequency}
          customDays={editedTimer.customDays}
          onChange={handleFrequencyChange}
          isDark={isDark}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          style={styles.saveButton}
          disabled={!editedTimer.name.trim()}
        />
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  addTimeButton: {
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  saveButton: {
    width: '100%',
  },
});
