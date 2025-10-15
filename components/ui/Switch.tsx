import React from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../../context/AppContext';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  size = 'medium',
  style,
}) => {
  const { state } = useApp();
  const { isDark } = state;

  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const switchStyles = [
    styles.switch,
    styles[`${size}Switch`],
    styles.switchTheme,
    disabled && styles.disabled,
    style,
  ];

  const thumbStyles = [
    styles.thumb,
    styles[`${size}Thumb`],
    {
      transform: [
        {
          translateX: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [2, size === 'small' ? 18 : size === 'medium' ? 22 : 26],
          }),
        },
      ],
    },
  ];

  return (
    <TouchableOpacity
      style={switchStyles}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View style={thumbStyles} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switch: {
    borderRadius: 20,
    justifyContent: 'center',
  },
  smallSwitch: {
    width: 36,
    height: 20,
  },
  mediumSwitch: {
    width: 44,
    height: 24,
  },
  largeSwitch: {
    width: 52,
    height: 28,
  },
  switchTheme: {
    backgroundColor: '#D1D5DB',
  },
  disabled: {
    opacity: 0.5,
  },
  thumb: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  smallThumb: {
    width: 16,
    height: 16,
  },
  mediumThumb: {
    width: 20,
    height: 20,
  },
  largeThumb: {
    width: 24,
    height: 24,
  },
});
