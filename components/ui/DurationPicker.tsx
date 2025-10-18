import { Minus, Plus } from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const screenWidth = Dimensions.get('window').width;
  
  // Calculate dynamic sizes based on screen width
  const availableWidth = screenWidth - (designStyles.spacing.lg * 2) - (designStyles.spacing.sm * 2); // Account for padding and gaps
  const columnWidth = Math.max(80, availableWidth / 3 - designStyles.spacing.sm);
  const inputWidth = Math.max(60, columnWidth - 20); // Leave some margin
  const buttonSize = Math.max(35, Math.min(45, inputWidth * 0.7));

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
    <View style={[styles.timeColumn, { width: columnWidth }]}>
      <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>{label}</Text>
      
      <TouchableOpacity
        onPress={() => increment(field)}
        style={[
          styles.controlButton, 
          { 
            backgroundColor: colors.inputBg,
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2
          }
        ]}
      >
        <Plus size={Math.max(16, buttonSize * 0.4)} color={colors.text} />
      </TouchableOpacity>

      <Input
        value={formatTime(duration[field])}
        onChangeText={(value) => handleInputChange(field, value)}
        keyboardType="numeric"
        style={StyleSheet.flatten([
          styles.timeInput, 
          { 
            backgroundColor: colors.inputBg, 
            color: colors.text, 
            textAlign: 'center',
            width: inputWidth,
            height: buttonSize + 5
          }
        ])}
      />

      <TouchableOpacity
        onPress={() => decrement(field)}
        style={[
          styles.controlButton, 
          { 
            backgroundColor: colors.inputBg,
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2
          }
        ]}
      >
        <Minus size={Math.max(16, buttonSize * 0.4)} color={colors.text} />
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
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingHorizontal: designStyles.spacing.sm,
  },
  timeColumn: {
    alignItems: 'center',
    flex: 1,
    gap: designStyles.spacing.sm,
    paddingHorizontal: designStyles.spacing.xs,
  },
  timeLabel: {
    fontSize: designStyles.fontSize.sm,
    fontWeight: '500',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeInput: {
    borderRadius: designStyles.borderRadius.md,
    fontSize: designStyles.fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: designStyles.spacing.sm,
  },
});
