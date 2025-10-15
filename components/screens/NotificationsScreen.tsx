import { Bell, X } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { IconButton } from '../ui/IconButton';

export const NotificationsScreen: React.FC = () => {
  const { state, setScreen } = useApp();
  const { isDark } = state;

  // Mock notification data - in a real app, this would come from a notification service
  const notifications = [
    {
      id: '1',
      title: 'Timer Completed',
      message: 'Morning Meditation timer has finished',
      time: '2 minutes ago',
      type: 'timer_complete',
    },
    {
      id: '2',
      title: 'Timer Reminder',
      message: 'Evening Exercise timer is starting in 5 minutes',
      time: '1 hour ago',
      type: 'timer_reminder',
    },
    {
      id: '3',
      title: 'Timer Completed',
      message: 'Work Break timer has finished',
      time: '3 hours ago',
      type: 'timer_complete',
    },
  ];

  const renderNotification = (notification: any) => (
    <Card key={notification.id} style={styles.notificationCard} variant="elevated">
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            {notification.title}
          </Text>
          <Text style={[styles.notificationTime, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {notification.time}
          </Text>
        </View>
        <Text style={[styles.notificationMessage, { color: isDark ? '#D1D5DB' : '#374151' }]}>
          {notification.message}
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#FFFFFF' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#F9FAFB' : '#111827' }]}>
          Notifications
        </Text>
        <IconButton
          icon={<X size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />}
          onPress={() => setScreen('home')}
          variant="ghost"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
              No notifications yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Timer notifications will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map(renderNotification)}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Mark All as Read"
          onPress={() => {/* TODO: Mark all notifications as read */}}
          variant="outline"
          style={styles.markAllButton}
        />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  notificationsList: {
    paddingBottom: 100,
  },
  notificationCard: {
    marginBottom: 12,
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  notificationTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  markAllButton: {
    width: '100%',
  },
});
