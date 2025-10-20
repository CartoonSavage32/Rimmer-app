import { ChevronLeft, Pause, Play, RotateCcw } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { designStyles, getDesignColors } from '../../constants/design';
import { useApp } from '../../context/AppContext';

interface RunningTimerScreenProps {
  timerId: string;
  onClose: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const RunningTimerScreen: React.FC<RunningTimerScreenProps> = ({
  timerId,
  onClose,
}) => {
  const { state, startTimer, stopTimer } = useApp();
  const { isDark } = state;
  const colors = getDesignColors(isDark);

  const timer = state.timers.find(t => t.id === timerId);
  if (!timer) return null;

  const isRunning = timer.isRunning || false;
  const remainingTime = timer.remainingTime || timer.duration * 60;
  const totalTime = timer.duration * 60;
  const progress = ((totalTime - remainingTime) / totalTime) * 100;

  const animatedProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 1000,
      easing: Easing.linear,
    });
  }, [progress]);

  useEffect(() => {
    if (isRunning) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [isRunning]);

  const animatedCircleProps = useAnimatedProps(() => {
    const radius = 136;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - animatedProgress.value / 100);

    return {
      strokeDashoffset,
    };
  });

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handlePlayPause = async () => {
    if (isRunning) {
      await stopTimer(timerId);
    } else {
      await startTimer(timerId);
    }
  };

  const handleReset = async () => {
    await stopTimer(timerId);
    // Reset timer to original duration
    // This would need to be implemented in the context
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          onPress={handleClose}
          style={[styles.backButton, { backgroundColor: colors.surfaceHover }]}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Timer</Text>
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Animated.View style={[styles.circleContainer, animatedPulseStyle]}>
          <Svg width={288} height={288} style={styles.svg}>
            <Defs>
              <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#6366f1" />
                <Stop offset="100%" stopColor="#8b5cf6" />
              </LinearGradient>
            </Defs>
            <Circle
              cx="144"
              cy="144"
              r="136"
              stroke={colors.border}
              strokeWidth="8"
              fill="none"
            />
            <AnimatedCircle
              cx="144"
              cy="144"
              r="136"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 136}`}
              animatedProps={animatedCircleProps}
            />
          </Svg>

          <View style={styles.timerTextContainer}>
            <Text style={[styles.timerText, { color: colors.text }]}>
              {(() => {
                const hours = Math.floor(remainingTime / 3600);
                const minutes = Math.floor((remainingTime % 3600) / 60);
                const seconds = remainingTime % 60;

                if (hours > 0) {
                  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
                return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
              })()}
            </Text>
            <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>
              {timer.name}
            </Text>
          </View>
        </Animated.View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handlePlayPause}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            {isRunning ? (
              <Pause size={20} color="#FFFFFF" />
            ) : (
              <Play size={20} color="#FFFFFF" />
            )}
            <Text style={styles.primaryButtonText}>
              {isRunning ? 'Pause' : 'Start'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReset}
            style={[styles.secondaryButton, { backgroundColor: colors.surface }]}
          >
            <RotateCcw size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: designStyles.spacing.xxl,
    paddingTop: 15,
    paddingBottom: designStyles.spacing.lg,
    ...designStyles.shadow.md,
  },
  backButton: {
    position: 'absolute',
    left: designStyles.spacing.sm,
    top: 12,
    padding: designStyles.spacing.xs,
    borderRadius: designStyles.borderRadius.sm,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: designStyles.fontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: designStyles.spacing.xxl,
    paddingBottom: 120,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: designStyles.spacing.xxxl,
  },
  svg: {
    position: 'absolute',
  },
  timerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 60,
    fontWeight: '700',
    marginBottom: designStyles.spacing.sm,
    fontFamily: 'monospace',
  },
  timerLabel: {
    fontSize: designStyles.fontSize.sm,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    gap: designStyles.spacing.lg,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designStyles.spacing.sm,
    paddingHorizontal: designStyles.spacing.xxxl,
    paddingVertical: designStyles.spacing.lg,
    borderRadius: designStyles.borderRadius.xxl,
    ...designStyles.shadow.lg,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: designStyles.fontSize.lg,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: designStyles.spacing.lg,
    borderRadius: designStyles.borderRadius.xxl,
    ...designStyles.shadow.lg,
  },
});
