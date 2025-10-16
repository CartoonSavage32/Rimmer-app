import { Clock } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
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
  const [selectedTime, setSelectedTime] = useState(time);
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');

  const hoursScrollRef = useRef<ScrollView>(null);
  const minutesScrollRef = useRef<ScrollView>(null);
  const periodScrollRef = useRef<ScrollView>(null);

  const parseTime = (timeStr: string) => {
    const [timePart, period] = timeStr.split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);
    return { hours, minutes, period: period as 'AM' | 'PM' };
  };

  const formatTime = (hours: number, minutes: number, period?: string) => {
    if (timeFormat === '12h') {
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period || 'AM'}`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isModalVisible) {
      const { hours, minutes, period } = parseTime(selectedTime);
      setSelectedHours(hours);
      setSelectedMinutes(minutes);
      setSelectedPeriod(period || 'AM');
    }
  }, [isModalVisible, selectedTime]);

  const handleTimeSelect = (hours: number, minutes: number, period?: 'AM' | 'PM') => {
    let finalHours = hours;
    let finalPeriod = period || 'AM';

    if (timeFormat === '12h') {
      if (hours === 0) {
        finalHours = 12;
        finalPeriod = 'AM';
      } else if (hours < 12) {
        finalPeriod = 'AM';
      } else if (hours === 12) {
        finalPeriod = 'PM';
      } else {
        finalHours = hours - 12;
        finalPeriod = 'PM';
      }
    }

    const newTime = formatTime(finalHours, minutes, finalPeriod);
    setSelectedTime(newTime);
  };

  const handleConfirm = () => {
    onTimeChange(selectedTime);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setSelectedTime(time);
    setIsModalVisible(false);
  };

  const generateNumbers = (max: number, isHours = false) => {
    const numbers = [];
    for (let i = 0; i <= max; i++) {
      numbers.push(i);
    }
    // Add extra items for infinite scroll
    return [...numbers, ...numbers, ...numbers];
  };

  const generatePeriods = () => {
    return ['AM', 'PM', 'AM', 'PM', 'AM', 'PM'];
  };

  const handleScroll = (scrollViewRef: React.RefObject<ScrollView | null>, type: 'hours' | 'minutes' | 'period') => {
    return (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      
      if (type === 'hours') {
        const hours = index % (timeFormat === '12h' ? 12 : 24);
        setSelectedHours(hours);
        handleTimeSelect(hours, selectedMinutes, selectedPeriod);
      } else if (type === 'minutes') {
        const minutes = index % 60;
        setSelectedMinutes(minutes);
        handleTimeSelect(selectedHours, minutes, selectedPeriod);
      } else if (type === 'period') {
        const period = index % 2 === 0 ? 'AM' : 'PM';
        setSelectedPeriod(period);
        handleTimeSelect(selectedHours, selectedMinutes, period);
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
          const hoursIndex = selectedHours === 0 ? 12 : selectedHours;
          scrollToIndex(hoursScrollRef, hoursIndex - 1, 12);
        } else {
          scrollToIndex(hoursScrollRef, selectedHours, 24);
        }
        scrollToIndex(minutesScrollRef, selectedMinutes, 60);
        scrollToIndex(periodScrollRef, selectedPeriod === 'AM' ? 0 : 1, 2);
      }, 100);
    }
  }, [isModalVisible, timeFormat]);

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

  const hours = generateNumbers(timeFormat === '12h' ? 12 : 24, true);
  const minutes = generateNumbers(59);
  const periods = generatePeriods();

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={[styles.timeButton, { backgroundColor: colors.inputBg }]}
      >
        <Clock size={20} color={colors.text} />
        <Text style={[styles.timeText, { color: colors.text }]}>{time}</Text>
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
                selectedHours,
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