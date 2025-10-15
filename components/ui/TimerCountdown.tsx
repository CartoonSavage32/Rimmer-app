import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Timer } from '../../types';

interface TimerCountdownProps {
  timer: Timer;
  isDark?: boolean;
}

export const TimerCountdown: React.FC<TimerCountdownProps> = ({
  timer,
  isDark = false,
}) => {
  const [remainingTime, setRemainingTime] = useState(timer.remainingTime || timer.duration * 60);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setRemainingTime(timer.remainingTime || timer.duration * 60);
  }, [timer.remainingTime, timer.duration]);

  useEffect(() => {
    if (timer.isRunning) {
      // Pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timer.isRunning, pulseAnim]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const totalTime = timer.duration * 60;
    return (totalTime - remainingTime) / totalTime;
  };

  const getCircleColor = (): string => {
    const progress = getProgress();
    if (progress < 0.25) return '#10B981'; // Green
    if (progress < 0.5) return '#F59E0B'; // Yellow
    if (progress < 0.75) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  if (!timer.isRunning) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ scale: pulseAnim }],
            borderColor: getCircleColor(),
          },
        ]}
      >
        <View style={[styles.innerCircle, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]}>
          <Text style={[styles.timeText, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            {formatTime(remainingTime)}
          </Text>
          <Text style={[styles.timerName, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {timer.name}
          </Text>
        </View>
      </Animated.View>
      
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${getProgress() * 100}%`,
              backgroundColor: getCircleColor(),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  innerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  timerName: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
