import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TimerDuration } from '../../types';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';

interface DurationPickerProps {
  value: TimerDuration;
  onChange: (duration: TimerDuration) => void;
  isDark?: boolean;
}

export const DurationPicker: React.FC<DurationPickerProps> = ({
  value,
  onChange,
  isDark = false,
}) => {
  const [duration, setDuration] = useState<TimerDuration>(value);

  useEffect(() => {
    setDuration(value);
  }, [value]);

  const updateDuration = (field: keyof TimerDuration, delta: number) => {
    const newDuration = { ...duration };
    newDuration[field] = Math.max(0, newDuration[field] + delta);
    
    // Handle overflow
    if (field === 'milliseconds' && newDuration.milliseconds >= 100) {
      newDuration.milliseconds = 0;
      newDuration.seconds += 1;
    }
    if (field === 'seconds' && newDuration.seconds >= 60) {
      newDuration.seconds = 0;
      newDuration.minutes += 1;
    }
    if (field === 'minutes' && newDuration.minutes >= 60) {
      newDuration.minutes = 0;
      newDuration.hours += 1;
    }
    if (field === 'hours' && newDuration.hours >= 24) {
      newDuration.hours = 0;
    }
    
    setDuration(newDuration);
    onChange(newDuration);
  };

  const updateDurationField = (field: keyof TimerDuration, value: number) => {
    const newDuration = { ...duration };
    newDuration[field] = value;
    
    // Handle overflow
    if (field === 'milliseconds' && newDuration.milliseconds >= 100) {
      newDuration.milliseconds = 0;
      newDuration.seconds += 1;
    }
    if (field === 'seconds' && newDuration.seconds >= 60) {
      newDuration.seconds = 0;
      newDuration.minutes += 1;
    }
    if (field === 'minutes' && newDuration.minutes >= 60) {
      newDuration.minutes = 0;
      newDuration.hours += 1;
    }
    if (field === 'hours' && newDuration.hours >= 24) {
      newDuration.hours = 0;
    }
    
    setDuration(newDuration);
    onChange(newDuration);
  };

  const formatValue = (value: number, max: number): string => {
    return value.toString().padStart(2, '0');
  };

  const DurationControl = ({ 
    label, 
    value, 
    max, 
    onIncrement, 
    onDecrement,
    onValueChange
  }: {
    label: string;
    value: number;
    max: number;
    onIncrement: () => void;
    onDecrement: () => void;
    onValueChange: (newValue: number) => void;
  }) => (
    <View style={styles.control}>
      <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        {label}
      </Text>
      <View style={styles.controlButtons}>
        <Button
          title="+"
          onPress={onIncrement}
          variant="outline"
          size="small"
          style={styles.controlButton}
        />
        <Input
          value={value.toString()}
          onChangeText={(text) => {
            const numValue = parseInt(text) || 0;
            const clampedValue = Math.max(0, Math.min(max - 1, numValue));
            onValueChange(clampedValue);
          }}
          keyboardType="numeric"
          style={styles.valueInput}
          inputStyle={styles.valueInputField}
        />
        <Button
          title="-"
          onPress={onDecrement}
          variant="outline"
          size="small"
          style={styles.controlButton}
        />
      </View>
    </View>
  );

  return (
    <Card style={styles.container}>
      <Text style={[styles.title, { color: isDark ? '#F9FAFB' : '#111827' }]}>
        Duration
      </Text>
      
      <View style={styles.durationDisplay}>
        <Text style={[styles.durationText, { color: isDark ? '#F9FAFB' : '#111827' }]}>
          {formatValue(duration.hours, 24)}:{formatValue(duration.minutes, 60)}:{formatValue(duration.seconds, 60)}:{formatValue(Math.floor(duration.milliseconds / 10), 100)}
        </Text>
      </View>

      <View style={styles.controls}>
        <DurationControl
          label="Hours"
          value={duration.hours}
          max={24}
          onIncrement={() => updateDuration('hours', 1)}
          onDecrement={() => updateDuration('hours', -1)}
          onValueChange={(value) => updateDurationField('hours', value)}
        />
        <DurationControl
          label="Minutes"
          value={duration.minutes}
          max={60}
          onIncrement={() => updateDuration('minutes', 1)}
          onDecrement={() => updateDuration('minutes', -1)}
          onValueChange={(value) => updateDurationField('minutes', value)}
        />
        <DurationControl
          label="Seconds"
          value={duration.seconds}
          max={60}
          onIncrement={() => updateDuration('seconds', 1)}
          onDecrement={() => updateDuration('seconds', -1)}
          onValueChange={(value) => updateDurationField('seconds', value)}
        />
        <DurationControl
          label="Centiseconds"
          value={Math.floor(duration.milliseconds / 10)}
          max={100}
          onIncrement={() => updateDuration('milliseconds', 10)}
          onDecrement={() => updateDuration('milliseconds', -10)}
          onValueChange={(value) => updateDurationField('milliseconds', value * 10)}
        />
      </View>
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
  durationDisplay: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  durationText: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  control: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  controlButtons: {
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
    minWidth: 30,
    textAlign: 'center',
  },
  valueInput: {
    marginBottom: 0,
    minWidth: 60,
  },
  valueInputField: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});
