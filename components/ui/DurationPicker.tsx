import { Minus, Plus } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { designStyles, getDesignColors } from '../../constants/design';
import { Input } from './Input';

interface DurationPickerProps {
  duration: { hours: number; minutes: number; seconds: number };
  onDurationChange: (duration: { hours: number; minutes: number; seconds: number }) => void;
  isDark: boolean;
}

export const DurationPicker: React.FC<DurationPickerProps> = ({
  duration,
  onDurationChange,
  isDark,
}) => {
  const colors = getDesignColors(isDark);

  const updateDuration = (field: 'hours' | 'minutes' | 'seconds', value: number) => {
    const newDuration = { ...duration, [field]: Math.max(0, value) };
    onDurationChange(newDuration);
  };

  const increment = (field: 'hours' | 'minutes' | 'seconds') => {
    const maxValue = field === 'hours' ? 23 : 59;
    updateDuration(field, Math.min(duration[field] + 1, maxValue));
  };

  const decrement = (field: 'hours' | 'minutes' | 'seconds') => {
    updateDuration(field, Math.max(duration[field] - 1, 0));
  };

  const handleInputChange = (field: 'hours' | 'minutes' | 'seconds', value: string) => {
    const numValue = parseInt(value) || 0;
    const maxValue = field === 'hours' ? 23 : 59;
    updateDuration(field, Math.min(Math.max(numValue, 0), maxValue));
  };

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  const renderTimeControl = (field: 'hours' | 'minutes' | 'seconds', label: string) => (
    <View style={styles.timeColumn}>
      <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>{label}</Text>
      
      <TouchableOpacity
        onPress={() => increment(field)}
        style={[styles.controlButton, { backgroundColor: colors.inputBg }]}
      >
        <Plus size={20} color={colors.text} />
      </TouchableOpacity>

      <Input
        value={formatTime(duration[field])}
        onChangeText={(value) => handleInputChange(field, value)}
        keyboardType="numeric"
        style={StyleSheet.flatten([styles.timeInput, { backgroundColor: colors.inputBg, color: colors.text, textAlign: 'center' }])}
      />

      <TouchableOpacity
        onPress={() => decrement(field)}
        style={[styles.controlButton, { backgroundColor: colors.inputBg }]}
      >
        <Minus size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.durationDisplay, { backgroundColor: colors.inputBg }]}>
        <Text style={[styles.durationText, { color: colors.text }]}>
          {formatTime(duration.hours)}:{formatTime(duration.minutes)}:{formatTime(duration.seconds)}
        </Text>
      </View>

      <View style={styles.controlsContainer}>
        {renderTimeControl('hours', 'Hours')}
        {renderTimeControl('minutes', 'Minutes')}
        {renderTimeControl('seconds', 'Seconds')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: designStyles.spacing.lg,
  },
  durationDisplay: {
    padding: designStyles.spacing.xxl,
    borderRadius: designStyles.borderRadius.xl,
    alignItems: 'center',
  },
  durationText: {
    fontSize: designStyles.fontSize.xxxl,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: designStyles.spacing.sm,
  },
  timeColumn: {
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
    gap: designStyles.spacing.sm,
  },
  timeLabel: {
    fontSize: designStyles.fontSize.sm,
    fontWeight: '500',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeInput: {
    width: 60,
    height: 40,
    borderRadius: designStyles.borderRadius.md,
    fontSize: designStyles.fontSize.lg,
    fontWeight: '600',
  },
});
