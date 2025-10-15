import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { Switch } from './Switch';

interface TimePickerProps {
  value: string; // HH:MM format
  onChange: (time: string) => void;
  format: '12h' | '24h';
  onFormatChange?: (format: '12h' | '24h') => void;
  isDark?: boolean;
  label?: string;
  error?: string;
  showFormatToggle?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  format,
  onFormatChange,
  isDark = false,
  label = 'Time',
  error,
  showFormatToggle = false,
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [hours, setHours] = useState('12');
  const [minutes, setMinutes] = useState('00');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    updateDisplayValue(value, format);
  }, [value, format]);

  const updateDisplayValue = (time24h: string, currentFormat: '12h' | '24h') => {
    const [h, m] = time24h.split(':').map(Number);
    
    if (currentFormat === '12h') {
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const ampmValue = h < 12 ? 'AM' : 'PM';
      setHours(hour12.toString());
      setMinutes(m.toString().padStart(2, '0'));
      setAmpm(ampmValue);
      setDisplayValue(`${hour12}:${m.toString().padStart(2, '0')} ${ampmValue}`);
    } else {
      setHours(h.toString().padStart(2, '0'));
      setMinutes(m.toString().padStart(2, '0'));
      setDisplayValue(time24h);
    }
  };

  const handleHoursChange = (text: string) => {
    const numValue = parseInt(text) || 0;
    const clampedValue = Math.max(1, Math.min(12, numValue));
    setHours(clampedValue.toString());
    updateTime24h(clampedValue, parseInt(minutes), ampm);
  };

  const handleMinutesChange = (text: string) => {
    const numValue = parseInt(text) || 0;
    const clampedValue = Math.max(0, Math.min(59, numValue));
    setMinutes(clampedValue.toString().padStart(2, '0'));
    updateTime24h(parseInt(hours), clampedValue, ampm);
  };

  const handleAmpmChange = (newAmpm: 'AM' | 'PM') => {
    setAmpm(newAmpm);
    updateTime24h(parseInt(hours), parseInt(minutes), newAmpm);
  };

  const updateTime24h = (h: number, m: number, a: 'AM' | 'PM') => {
    let hour24 = h;
    
    if (a === 'AM' && h === 12) {
      hour24 = 0;
    } else if (a === 'PM' && h !== 12) {
      hour24 = h + 12;
    }
    
    const time24h = `${hour24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    onChange(time24h);
  };

  const quickTimeButtons = [
    { label: '6:00', value: '06:00' },
    { label: '9:00', value: '09:00' },
    { label: '12:00', value: '12:00' },
    { label: '15:00', value: '15:00' },
    { label: '18:00', value: '18:00' },
    { label: '21:00', value: '21:00' },
  ];

  const handleQuickTime = (time24h: string) => {
    onChange(time24h);
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: isDark ? '#F9FAFB' : '#111827' }]}>
          {label}
        </Text>
        {showFormatToggle && onFormatChange && (
          <View style={styles.formatToggle}>
            <Text style={[styles.formatLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {format === '12h' ? '12H' : '24H'}
            </Text>
            <Switch
              value={format === '12h'}
              onValueChange={(value) => onFormatChange(value ? '12h' : '24h')}
              size="small"
            />
          </View>
        )}
      </View>
      
      {format === '12h' ? (
        <View style={styles.timeInputs12h}>
          <Input
            value={hours}
            onChangeText={handleHoursChange}
            keyboardType="numeric"
            style={styles.hoursInput}
            inputStyle={styles.timeInputField}
            error={error}
          />
          <Text style={[styles.colon, { color: isDark ? '#F9FAFB' : '#111827' }]}>:</Text>
          <Input
            value={minutes}
            onChangeText={handleMinutesChange}
            keyboardType="numeric"
            style={styles.minutesInput}
            inputStyle={styles.timeInputField}
          />
          <View style={styles.ampmContainer}>
            <Button
              title="AM"
              onPress={() => handleAmpmChange('AM')}
              variant={ampm === 'AM' ? 'primary' : 'outline'}
              size="small"
              style={styles.ampmButton}
            />
            <Button
              title="PM"
              onPress={() => handleAmpmChange('PM')}
              variant={ampm === 'PM' ? 'primary' : 'outline'}
              size="small"
              style={styles.ampmButton}
            />
          </View>
        </View>
      ) : (
        <View style={styles.timeInputs24h}>
          <Input
            value={hours}
            onChangeText={(text) => {
              const numValue = parseInt(text) || 0;
              const clampedValue = Math.max(0, Math.min(23, numValue));
              setHours(clampedValue.toString().padStart(2, '0'));
              onChange(`${clampedValue.toString().padStart(2, '0')}:${minutes}`);
            }}
            keyboardType="numeric"
            style={styles.hoursInput}
            inputStyle={styles.timeInputField}
            error={error}
          />
          <Text style={[styles.colon, { color: isDark ? '#F9FAFB' : '#111827' }]}>:</Text>
          <Input
            value={minutes}
            onChangeText={(text) => {
              const numValue = parseInt(text) || 0;
              const clampedValue = Math.max(0, Math.min(59, numValue));
              setMinutes(clampedValue.toString().padStart(2, '0'));
              onChange(`${hours}:${clampedValue.toString().padStart(2, '0')}`);
            }}
            keyboardType="numeric"
            style={styles.minutesInput}
            inputStyle={styles.timeInputField}
          />
        </View>
      )}

      <View style={styles.quickTimes}>
        <Text style={[styles.quickTimesLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Quick times:
        </Text>
        <View style={styles.quickTimeButtons}>
          {quickTimeButtons.map((button) => (
            <Button
              key={button.value}
              title={format === '12h' ? 
                (() => {
                  const [h, m] = button.value.split(':').map(Number);
                  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                  const ampm = h < 12 ? 'AM' : 'PM';
                  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
                })() : 
                button.label
              }
              onPress={() => handleQuickTime(button.value)}
              variant="outline"
              size="small"
              style={styles.quickTimeButton}
            />
          ))}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  formatToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formatLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeInputs12h: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timeInputs24h: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  hoursInput: {
    flex: 1,
    marginBottom: 0,
  },
  minutesInput: {
    flex: 1,
    marginBottom: 0,
  },
  timeInputField: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'monospace',
  },
  colon: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  ampmContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  ampmButton: {
    minWidth: 50,
  },
  quickTimes: {
    marginTop: 8,
  },
  quickTimesLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  quickTimeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTimeButton: {
    flex: 1,
    minWidth: '30%',
  },
});
