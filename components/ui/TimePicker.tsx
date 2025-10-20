import { Clock } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { designStyles, getDesignColors } from '../../constants/design';
import { ToggleSwitch } from './ToggleSwitch';

interface TimePickerProps {
  time: string;
  onTimeChange: (time: string) => void;
  isDark: boolean;
  showFormatToggle?: boolean;
  onFormatChange?: (format: '12h' | '24h') => void;
  timeFormat: '12h' | '24h';
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;

// Get screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const TimePicker: React.FC<TimePickerProps> = ({
  time,
  onTimeChange,
  isDark,
  showFormatToggle = false,
  onFormatChange,
  timeFormat,
}) => {
  const colors = getDesignColors(isDark);
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Always keep the source of truth as 24h string (HH:MM)
  const [selectedTime, setSelectedTime] = useState(time);
  const [selectedHours24, setSelectedHours24] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const [selectedDisplayHour12, setSelectedDisplayHour12] = useState<number>(12);

  const hoursScrollRef = useRef<ScrollView>(null);
  const minutesScrollRef = useRef<ScrollView>(null);
  const periodScrollRef = useRef<ScrollView>(null);

  const parse24h = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours: Number.isFinite(hours) ? hours : 0, minutes: Number.isFinite(minutes) ? minutes : 0 };
  };

  const to24hString = (hours24: number, minutes: number) => `${hours24.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;

  const displayLabel = useMemo(() => {
    // For button text: format according to prop timeFormat, but based on 24h selectedTime
    const [h, m] = selectedTime.split(':').map(n => parseInt(n, 10));
    if (timeFormat === '12h') {
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const ampm = h < 12 ? 'AM' : 'PM';
      return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    }
    return to24hString(h, m);
  }, [selectedTime, timeFormat]);

  useEffect(() => {
    if (isModalVisible) {
      const { hours, minutes } = parse24h(selectedTime);
      setSelectedHours24(hours);
      setSelectedMinutes(minutes);
      const period = hours < 12 ? 'AM' : 'PM';
      setSelectedPeriod(period);
      const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      setSelectedDisplayHour12(displayHour);
    }
  }, [isModalVisible, selectedTime]);

  const handleTimeSelect24 = (hours24: number, minutes: number) => {
    setSelectedTime(to24hString(hours24, minutes));
  };

  const handleConfirm = () => {
    onTimeChange(selectedTime);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setSelectedTime(time);
    setIsModalVisible(false);
  };

  const generateNumbers = (min: number, max: number) => {
    const nums: number[] = [];
    for (let i = min; i <= max; i++) nums.push(i);
    return [...nums, ...nums, ...nums];
  };

  const generatePeriods = () => {
    return ['AM', 'PM', 'AM', 'PM', 'AM', 'PM'];
  };

  const handleScroll = (scrollViewRef: React.RefObject<ScrollView | null>, type: 'hours' | 'minutes' | 'period') => {
    return (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      
      if (type === 'hours') {
        if (timeFormat === '12h') {
          const base = 12;
          const displayHour = ((index % base) + base) % base; // 0..11
          const hour12 = displayHour === 0 ? 12 : displayHour; // 1..12
          setSelectedDisplayHour12(hour12);
          const h24 = hour12 % 12 + (selectedPeriod === 'PM' ? 12 : 0);
          setSelectedHours24(h24);
          handleTimeSelect24(h24, selectedMinutes);
        } else {
          const base = 24;
          const h24 = ((index % base) + base) % base; // 0..23
          setSelectedHours24(h24);
          handleTimeSelect24(h24, selectedMinutes);
        }
      } else if (type === 'minutes') {
        const base = 60;
        const minutes = ((index % base) + base) % base;
        setSelectedMinutes(minutes);
        handleTimeSelect24(selectedHours24, minutes);
      } else if (type === 'period') {
        const period = index % 2 === 0 ? 'AM' : 'PM';
        setSelectedPeriod(period);
        const h24 = selectedDisplayHour12 % 12 + (period === 'PM' ? 12 : 0);
        setSelectedHours24(h24);
        handleTimeSelect24(h24, selectedMinutes);
      }
    };
  };

  const scrollToIndex = (scrollViewRef: React.RefObject<ScrollView | null>, index: number, total: number) => {
    if (scrollViewRef.current) {
      const offsetY = (index + total) * ITEM_HEIGHT;
      scrollViewRef.current.scrollTo({ y: offsetY, animated: false });
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      setTimeout(() => {
        if (timeFormat === '12h') {
          const hourIndex = (selectedDisplayHour12 % 12) || 12;
          scrollToIndex(hoursScrollRef, hourIndex - 1, 12);
        } else {
          scrollToIndex(hoursScrollRef, selectedHours24, 24);
        }
        scrollToIndex(minutesScrollRef, selectedMinutes, 60);
        scrollToIndex(periodScrollRef, selectedPeriod === 'AM' ? 0 : 1, 2);
      }, 100);
    }
  }, [isModalVisible, timeFormat, selectedDisplayHour12, selectedHours24, selectedMinutes, selectedPeriod]);

  const renderScrollWheel = (
    data: (string | number)[],
    selectedValue: string | number,
    onScroll: (event: any) => void,
    label: string,
    scrollRef: React.RefObject<ScrollView | null>
  ) => (
    <View style={styles.wheelContainer}>
      <Text style={[styles.wheelLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.wheel, { backgroundColor: colors.inputBg }]}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={onScroll}
          style={styles.scrollView}
        >
          {data.map((item, index) => (
            <View key={index} style={styles.wheelItem}>
              <Text style={[
                styles.wheelText,
                { color: colors.text }
              ]}>
                {item.toString().padStart(2, '0')}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const hours = useMemo(() => (timeFormat === '12h'
    ? generateNumbers(1, 12)
    : generateNumbers(0, 23)), [timeFormat]);
  const minutes = useMemo(() => generateNumbers(0, 59), []);
  const periods = generatePeriods();

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={[styles.timeButton, { backgroundColor: colors.inputBg }]}
      >
        <Clock size={20} color={colors.text} />
        <Text style={[styles.timeText, { color: colors.text }]}>{displayLabel}</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bg, paddingBottom: insets.bottom }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Time</Text>
              {showFormatToggle && onFormatChange && (
                <View style={styles.formatToggle}>
                  <Text style={[styles.formatLabel, { color: colors.text }]}>12h</Text>
                  <ToggleSwitch
                    checked={timeFormat === '24h'}
                    onChange={() => onFormatChange(timeFormat === '12h' ? '24h' : '12h')}
                    size="small"
                  />
                  <Text style={[styles.formatLabel, { color: colors.text }]}>24h</Text>
                </View>
              )}
            </View>

            <View style={styles.timeWheels}>
              {renderScrollWheel(
                hours,
                selectedHours24,
                handleScroll(hoursScrollRef, 'hours'),
                'Hour',
                hoursScrollRef
              )}
              {renderScrollWheel(
                minutes,
                selectedMinutes,
                handleScroll(minutesScrollRef, 'minutes'),
                'Min',
                minutesScrollRef
              )}
              {timeFormat === '12h' && renderScrollWheel(
                periods,
                selectedPeriod,
                handleScroll(periodScrollRef, 'period'),
                'Period',
                periodScrollRef
              )}
            </View>

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
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: designStyles.spacing.lg,
    borderRadius: designStyles.borderRadius.lg,
    gap: designStyles.spacing.sm,
    minHeight: 50,
    flex: 1,
  },
  timeText: {
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
    padding: designStyles.spacing.xxl,
    maxHeight: screenHeight * 0.7,
    minHeight: screenHeight * 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designStyles.spacing.xxl,
  },
  modalTitle: {
    fontSize: designStyles.fontSize.xl,
    fontWeight: '700',
  },
  formatToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designStyles.spacing.sm,
  },
  formatLabel: {
    fontSize: designStyles.fontSize.sm,
    fontWeight: '500',
  },
  timeWheels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: designStyles.spacing.xxl,
    paddingHorizontal: designStyles.spacing.sm,
  },
  wheelContainer: {
    alignItems: 'center',
    flex: 1,
    maxWidth: screenWidth * 0.25,
  },
  wheelLabel: {
    fontSize: designStyles.fontSize.sm,
    fontWeight: '500',
    marginBottom: designStyles.spacing.sm,
  },
  wheel: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: Math.min(80, screenWidth * 0.2),
    borderRadius: designStyles.borderRadius.lg,
    overflow: 'hidden',
  },
  scrollView: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelText: {
    fontSize: designStyles.fontSize.lg,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: designStyles.spacing.md,
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