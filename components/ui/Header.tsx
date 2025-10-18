import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { designStyles, getDesignColors } from '../../constants/design';

interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  isDark: boolean;
  showBackButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBackPress,
  isDark,
  showBackButton = true,
}) => {
  const colors = getDesignColors(isDark);

  return (
    <View style={[styles.header, { backgroundColor: colors.surface }]}>
      {showBackButton && onBackPress && (
        <TouchableOpacity
          onPress={onBackPress}
          style={[styles.backButton, { backgroundColor: colors.surfaceHover }]}
        >
          <ChevronLeft size={20} color={colors.text} />
        </TouchableOpacity>
      )}
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: designStyles.spacing.lg,
    paddingTop: 15,
    paddingBottom: designStyles.spacing.sm,
    marginHorizontal: designStyles.spacing.sm,
    marginTop: designStyles.spacing.xs,
    borderRadius: designStyles.borderRadius.lg,
    ...designStyles.shadow.sm,
  },
  backButton: {
    position: 'absolute',
    left: designStyles.spacing.sm,
    top: 12,
    padding: designStyles.spacing.xs,
    borderRadius: designStyles.borderRadius.sm,
    zIndex: 1,
  },
  title: {
    fontSize: designStyles.fontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
});
