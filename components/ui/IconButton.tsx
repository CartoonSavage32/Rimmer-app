import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useApp } from '../../context/AppContext';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'ghost' | 'outlined';
  disabled?: boolean;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'medium',
  variant = 'default',
  disabled = false,
  style,
}) => {
  const { state } = useApp();
  const { isDark } = state;

  const buttonStyles = [
    styles.button,
    styles[`${size}Button`],
    styles[`${variant}Button`],
    disabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  smallButton: {
    width: 32,
    height: 32,
  },
  mediumButton: {
    width: 40,
    height: 40,
  },
  largeButton: {
    width: 48,
    height: 48,
  },
  defaultButton: {
    backgroundColor: '#F3F4F6',
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  disabled: {
    opacity: 0.5,
  },
});
