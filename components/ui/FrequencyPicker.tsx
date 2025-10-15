import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DAYS_OF_WEEK } from '../../utils/timeUtils';
import { Button } from './Button';
import { Card } from './Card';

interface FrequencyPickerProps {
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  customDays?: number[];
  onChange: (frequency: 'daily' | 'weekdays' | 'weekends' | 'custom', customDays?: number[]) => void;
  isDark?: boolean;
}

export const FrequencyPicker: React.FC<FrequencyPickerProps> = ({
  frequency,
  customDays = [],
  onChange,
  isDark = false,
}) => {
  const [selectedDays, setSelectedDays] = useState<number[]>(customDays);

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekdays', label: 'Weekdays' },
    { value: 'weekends', label: 'Weekends' },
    { value: 'custom', label: 'Custom' },
  ] as const;

  const handleFrequencyChange = (newFrequency: 'daily' | 'weekdays' | 'weekends' | 'custom') => {
    if (newFrequency === 'custom') {
      // Initialize with weekdays if no custom days selected
      const initialDays = selectedDays.length > 0 ? selectedDays : [1, 2, 3, 4, 5];
      onChange(newFrequency, initialDays);
      setSelectedDays(initialDays);
    } else {
      onChange(newFrequency);
      setSelectedDays([]);
    }
  };

  const handleDayToggle = (dayValue: number) => {
    const newSelectedDays = selectedDays.includes(dayValue)
      ? selectedDays.filter(day => day !== dayValue)
      : [...selectedDays, dayValue];
    
    setSelectedDays(newSelectedDays);
    onChange('custom', newSelectedDays);
  };

  const getFrequencyDescription = () => {
    switch (frequency) {
      case 'daily':
        return 'Every day';
      case 'weekdays':
        return 'Monday to Friday';
      case 'weekends':
        return 'Saturday and Sunday';
      case 'custom':
        if (selectedDays.length === 0) return 'No days selected';
        if (selectedDays.length === 7) return 'Every day';
        const dayNames = selectedDays
          .sort()
          .map(day => DAYS_OF_WEEK[day].short)
          .join(', ');
        return dayNames;
      default:
        return '';
    }
  };

  return (
    <Card style={styles.container}>
      <Text style={[styles.title, { color: isDark ? '#F9FAFB' : '#111827' }]}>
        Frequency
      </Text>
      
      <View style={styles.frequencyGrid}>
        {frequencyOptions.map((option) => (
          <Button
            key={option.value}
            title={option.label}
            onPress={() => handleFrequencyChange(option.value)}
            variant={frequency === option.value ? 'primary' : 'outline'}
            size="small"
            style={styles.frequencyButton}
          />
        ))}
      </View>

      <Text style={[styles.description, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        {getFrequencyDescription()}
      </Text>

      {frequency === 'custom' && (
        <View style={styles.customDaysContainer}>
          <Text style={[styles.customDaysLabel, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            Select days:
          </Text>
          <View style={styles.daysGrid}>
            {DAYS_OF_WEEK.map((day) => (
              <Button
                key={day.value}
                title={day.short}
                onPress={() => handleDayToggle(day.value)}
                variant={selectedDays.includes(day.value) ? 'primary' : 'outline'}
                size="small"
                style={[
                  styles.dayButton,
                  selectedDays.includes(day.value) && styles.selectedDayButton
                ]}
              />
            ))}
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  frequencyButton: {
    flex: 1,
    minWidth: '45%',
  },
  description: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  customDaysContainer: {
    marginTop: 8,
  },
  customDaysLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    flex: 1,
    minWidth: '12%',
  },
  selectedDayButton: {
    backgroundColor: '#3B82F6',
  },
});
