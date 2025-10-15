import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  size = 'medium',
  disabled = false,
}) => {
  const progress = useSharedValue(checked ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: 300 });
  }, [checked, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = progress.value * (size === 'small' ? 20 : size === 'large' ? 28 : 24);

    return {
      transform: [{ translateX }],
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['#E5E7EB', '#6366F1']
    );

    return {
      backgroundColor,
    };
  });

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: 40,
          height: 24,
          thumbSize: 20,
          padding: 2,
        };
      case 'large':
        return {
          width: 56,
          height: 32,
          thumbSize: 28,
          padding: 2,
        };
      default:
        return {
          width: 48,
          height: 28,
          thumbSize: 24,
          padding: 2,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onChange}
      disabled={disabled}
      style={[
        styles.container,
        {
          width: sizeStyles.width,
          height: sizeStyles.height,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.track,
          backgroundStyle,
          {
            width: sizeStyles.width,
            height: sizeStyles.height,
            borderRadius: sizeStyles.height / 2,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.thumb,
          animatedStyle,
          {
            width: sizeStyles.thumbSize,
            height: sizeStyles.thumbSize,
            borderRadius: sizeStyles.thumbSize / 2,
            top: sizeStyles.padding,
            left: sizeStyles.padding,
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  thumb: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
