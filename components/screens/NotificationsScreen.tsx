import { Bell } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { designStyles, getDesignColors } from '../../constants/design';
import { useApp } from '../../context/AppContext';

export const NotificationsScreen: React.FC = () => {
  const { state } = useApp();
  const { isDark } = state;
  const colors = getDesignColors(isDark);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
            <Bell size={48} color={colors.textSecondary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No notifications yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Timer notifications will appear here
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: designStyles.spacing.xxl,
    paddingTop: designStyles.spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: designStyles.spacing.xxxl,
    paddingTop: 100,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: designStyles.spacing.xxl,
    ...designStyles.shadow.lg,
  },
  emptyTitle: {
    fontSize: designStyles.fontSize.xxl,
    fontWeight: '700',
    marginBottom: designStyles.spacing.sm,
  },
  emptySubtitle: {
    fontSize: designStyles.fontSize.md,
    textAlign: 'center',
    lineHeight: 24,
  },
});