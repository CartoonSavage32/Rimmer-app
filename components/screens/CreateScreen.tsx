import { Plus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../context/AppContext';
import { NewTimer } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { IconButton } from '../ui/IconButton';
import { Input } from '../ui/Input';

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'custom', label: 'Custom' },
] as const;

export const CreateScreen: React.FC = () => {
  const { state, addTimer, setScreen } = useApp();
  const { isDark } = state;

  const [newTimer, setNewTimer] = useState<NewTimer>({
    name: '',
    duration: 3,
    times: ['09:00'],
    frequency: 'daily',
  });

  const [errors, setErrors] = useState<Partial<NewTimer>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<NewTimer> = {};

    if (!newTimer.name.trim()) {
      newErrors.name = 'Timer name is required';
    }

    if (newTimer.duration < 1 || newTimer.duration > 1440) {
      newErrors.duration = 'Duration must be between 1 and 1440 minutes';
    }

    if (newTimer.times.length === 0) {
      newErrors.times = 'At least one time is required';
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

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      await addTimer(newTimer);
      setScreen('home');
    } catch (error) {
      Alert.alert('Error', 'Failed to create timer. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#FFFFFF' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#F9FAFB' : '#111827' }]}>
          New Timer
        </Text>
        <IconButton
          icon={<X size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />}
          onPress={() => setScreen('home')}
          variant="ghost"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.section}>
          <Input
            label="Timer Name"
            value={newTimer.name}
            onChangeText={(text) => setNewTimer({ ...newTimer, name: text })}
            placeholder="e.g., Morning Meditation"
            error={errors.name}
          />

          <Input
            label="Duration (minutes)"
            value={newTimer.duration.toString()}
            onChangeText={(text) => {
              const duration = parseInt(text) || 0;
              setNewTimer({ ...newTimer, duration });
            }}
            keyboardType="numeric"
            error={errors.duration}
          />
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            Notification Times
          </Text>
          
          {newTimer.times.map((time, index) => (
            <View key={index} style={styles.timeRow}>
              <Input
                value={time}
                onChangeText={(text) => handleTimeChange(index, text)}
                style={styles.timeInput}
                inputStyle={styles.timeInputField}
              />
              {newTimer.times.length > 1 && (
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
            icon={<Plus size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />}
            style={styles.addTimeButton}
          />
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            Frequency
          </Text>
          
          <View style={styles.frequencyGrid}>
            {FREQUENCY_OPTIONS.map((option) => (
              <Button
                key={option.value}
                title={option.label}
                onPress={() => setNewTimer({ ...newTimer, frequency: option.value })}
                variant={newTimer.frequency === option.value ? 'primary' : 'outline'}
                size="small"
                style={styles.frequencyButton}
              />
            ))}
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Create Timer"
          onPress={handleCreate}
          style={styles.createButton}
          disabled={!newTimer.name.trim()}
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
  timeInput: {
    flex: 1,
    marginBottom: 0,
  },
  timeInputField: {
    textAlign: 'center',
  },
  addTimeButton: {
    marginTop: 8,
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    minWidth: '45%',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  createButton: {
    width: '100%',
  },
});
