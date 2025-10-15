import { Calendar } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { designStyles, getDesignColors } from '../../constants/design';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

const FREQUENCY_OPTIONS = [
  { key: 'once', label: 'Once' },
  { key: 'daily', label: 'Daily' },
  { key: 'weekdays', label: 'Weekdays' },
  { key: 'weekends', label: 'Weekends' },
  { key: 'custom', label: 'Custom' },
];

interface FrequencyPickerProps {
  frequency: string;
  customDays: string[];
  onFrequencyChange: (frequency: string) => void;
  onCustomDaysChange: (days: string[]) => void;
  isDark: boolean;
}

export const FrequencyPicker: React.FC<FrequencyPickerProps> = ({
  frequency,
  customDays,
  onFrequencyChange,
  onCustomDaysChange,
  isDark,
}) => {
  const colors = getDesignColors(isDark);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState(frequency);
  const [selectedDays, setSelectedDays] = useState(customDays);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleFrequencySelect = (freq: string) => {
    setSelectedFrequency(freq);
    if (freq !== 'custom') {
      setSelectedDays([]);
    } else {
      // Auto-scroll down to show custom days when custom is selected
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 200, animated: true });
        }
      }, 100);
    }
  };

  const handleDayToggle = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleConfirm = () => {
    onFrequencyChange(selectedFrequency);
    if (selectedFrequency === 'custom') {
      onCustomDaysChange(selectedDays);
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setSelectedFrequency(frequency);
    setSelectedDays(customDays);
    setIsModalVisible(false);
  };

  const getFrequencyLabel = () => {
    if (selectedFrequency === 'custom' && selectedDays.length > 0) {
      return selectedDays.map(day => 
        DAYS_OF_WEEK.find(d => d.key === day)?.label
      ).join(', ');
    }
    return FREQUENCY_OPTIONS.find(f => f.key === selectedFrequency)?.label || 'Once';
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={[styles.frequencyButton, { backgroundColor: colors.inputBg }]}
      >
        <Calendar size={20} color={colors.text} />
        <Text style={[styles.frequencyText, { color: colors.text }]}>
          {getFrequencyLabel()}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Frequency</Text>
            </View>

            <ScrollView ref={scrollViewRef} style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
              <View style={styles.frequencyOptions}>
                {FREQUENCY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => handleFrequencySelect(option.key)}
                    style={[
                      styles.frequencyOption,
                      {
                        backgroundColor: selectedFrequency === option.key ? colors.primary : colors.inputBg,
                      }
                    ]}
                  >
                    <Text style={[
                      styles.frequencyOptionText,
                      { color: selectedFrequency === option.key ? '#FFFFFF' : colors.text }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedFrequency === 'custom' && (
                <View style={styles.customDaysSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Days</Text>
                  <View style={styles.daysGrid}>
                    {DAYS_OF_WEEK.map((day) => (
                      <TouchableOpacity
                        key={day.key}
                        onPress={() => handleDayToggle(day.key)}
                        style={[
                          styles.dayButton,
                          {
                            backgroundColor: selectedDays.includes(day.key) ? colors.primary : colors.inputBg,
                          }
                        ]}
                      >
                        <Text style={[
                          styles.dayText,
                          { color: selectedDays.includes(day.key) ? '#FFFFFF' : colors.text }
                        ]}>
                          {day.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={handleCancel}
                style={[styles.actionButton, { backgroundColor: colors.inputBg }]}
              >
                <Text style={[styles.actionText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.actionText, { color: '#FFFFFF' }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  frequencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: designStyles.spacing.lg,
    borderRadius: designStyles.borderRadius.lg,
    gap: designStyles.spacing.sm,
  },
  frequencyText: {
    fontSize: designStyles.fontSize.md,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: designStyles.borderRadius.xxl,
    borderTopRightRadius: designStyles.borderRadius.xxl,
    maxHeight: '70%',
    flex: 1,
  },
  modalHeader: {
    padding: designStyles.spacing.xxl,
    paddingBottom: designStyles.spacing.lg,
  },
  scrollableContent: {
    flex: 1,
    paddingHorizontal: designStyles.spacing.xxl,
  },
  modalTitle: {
    fontSize: designStyles.fontSize.xl,
    fontWeight: '700',
  },
  frequencyOptions: {
    gap: designStyles.spacing.sm,
    marginBottom: designStyles.spacing.lg,
  },
  frequencyOption: {
    padding: designStyles.spacing.lg,
    borderRadius: designStyles.borderRadius.lg,
  },
  frequencyOptionText: {
    fontSize: designStyles.fontSize.md,
    fontWeight: '500',
  },
  customDaysSection: {
    marginBottom: designStyles.spacing.lg,
  },
  sectionTitle: {
    fontSize: designStyles.fontSize.md,
    fontWeight: '600',
    marginBottom: designStyles.spacing.md,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designStyles.spacing.sm,
  },
  dayButton: {
    padding: designStyles.spacing.md,
    borderRadius: designStyles.borderRadius.lg,
    minWidth: 60,
    alignItems: 'center',
  },
  dayText: {
    fontSize: designStyles.fontSize.sm,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: designStyles.spacing.md,
    padding: designStyles.spacing.xxl,
    paddingTop: designStyles.spacing.lg,
  },
  actionButton: {
    flex: 1,
    padding: designStyles.spacing.lg,
    borderRadius: designStyles.borderRadius.lg,
    alignItems: 'center',
  },
  actionText: {
    fontSize: designStyles.fontSize.md,
    fontWeight: '600',
  },
});
