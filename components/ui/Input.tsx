import React from 'react';
import { StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import { getDesignColors } from '../../constants/design';
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
  const colors = getDesignColors(isDark);

  const containerStyles = [
    styles.container,
    style,
  ];

  const inputStyles = [
    styles.input,
    {
      backgroundColor: colors.inputBg,
      borderColor: error ? colors.red : colors.border,
      color: colors.text,
    },
    multiline && styles.multiline,
    disabled && styles.disabled,
    inputStyle,
  ];

  const labelStyles = [
    styles.label,
    { color: colors.textSecondary },
  ];

  const errorStyles = [
    styles.errorText,
    { color: colors.red },
  ];

  return (
    <View style={containerStyles}>
      {label && <Text style={labelStyles}>{label}</Text>}
      <TextInput
        style={inputStyles}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
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
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: {
    paddingTop: 12,
    minHeight: 80,
  },
  disabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
