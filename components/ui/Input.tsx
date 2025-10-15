import React from 'react';
import { StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import { useApp } from '../../context/AppContext';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  error?: string;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  error,
  disabled = false,
}) => {
  const { state } = useApp();
  const { isDark } = state;

  const containerStyles = [
    styles.container,
    style,
  ];

  const inputStyles = [
    styles.input,
    styles.inputTheme,
    multiline && styles.multiline,
    error && styles.error,
    disabled && styles.disabled,
    inputStyle,
  ];

  const labelStyles = [
    styles.label,
    styles.labelTheme,
  ];

  const errorStyles = [
    styles.errorText,
    styles.errorTextTheme,
  ];

  return (
    <View style={containerStyles}>
      {label && <Text style={labelStyles}>{label}</Text>}
      <TextInput
        style={inputStyles}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={!disabled}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {error && <Text style={errorStyles}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  labelTheme: {
    color: '#6B7280',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputTheme: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    color: '#111827',
  },
  multiline: {
    paddingTop: 12,
    minHeight: 80,
  },
  error: {
    borderColor: '#EF4444',
  },
  disabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  errorTextTheme: {
    color: '#EF4444',
  },
});
