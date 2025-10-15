import { Bell, Clock, Edit2, Plus, Settings } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { designStyles, getDesignColors } from '../../constants/design';
import { useApp } from '../../context/AppContext';
import { Timer } from '../../types';
import { formatFrequency, formatTime } from '../../utils/timeUtils';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { EditScreen } from './EditScreen';
import { NotificationsScreen } from './NotificationsScreen';
import { RunningTimerScreen } from './RunningTimerScreen';
import { SettingsScreen } from './SettingsScreen';

export const HomeScreen: React.FC = () => {
  const { state, toggleTimer, startTimer, stopTimer, setScreen } = useApp();
  const { timers, isDark, settings, currentScreen } = state;
  const [editingTimer, setEditingTimer] = useState<Timer | null>(null);
  const [runningTimerId, setRunningTimerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timers' | 'notifications' | 'settings'>('timers');
  
  const colors = getDesignColors(isDark);

  const handleEditTimer = (timer: Timer) => {
    if (timer.isRunning) {
      return;
    }
    setEditingTimer(timer);
  };

  const handleStartTimer = (timer: Timer) => {
    setRunningTimerId(timer.id);
  };

  const TimerCard = ({ timer }: { timer: Timer }) => (
    <TouchableOpacity
      style={[styles.timerCard, { backgroundColor: colors.cardBg }]}
      onPress={() => handleStartTimer(timer)}
      activeOpacity={0.8}
    >
      <View style={styles.timerCardContent}>
        <View style={styles.timerInfo}>
          <Text style={[styles.timerName, { color: colors.text }]}>
            {timer.name}
          </Text>
          <View style={styles.timerDuration}>
            <Clock size={16} color={colors.textSecondary} />
            <Text style={[styles.durationText, { color: colors.textSecondary }]}>
              {Math.floor(timer.duration)} min
            </Text>
          </View>
          <View style={styles.timerTimes}>
            <Bell size={16} color={colors.textSecondary} />
            <View style={styles.timeChips}>
              {timer.times.map((time, idx) => (
                <View
                  key={idx}
                  style={[styles.timeChip, { backgroundColor: colors.inputBg }]}
                >
                  <Text style={[styles.timeText, { color: colors.text }]}>
                    {formatTime(time, settings.timeFormat)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.timerControls}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleEditTimer(timer);
            }}
            style={[styles.controlButton, { backgroundColor: colors.surfaceHover }]}
            disabled={timer.isRunning}
          >
            <Edit2 size={16} color={timer.isRunning ? colors.textSecondary : colors.text} />
          </TouchableOpacity>
          <ToggleSwitch
            checked={timer.enabled}
            onChange={() => {
              toggleTimer(timer.id);
            }}
            size="medium"
          />
        </View>
      </View>
      <View style={[styles.frequencyChip, { backgroundColor: colors.primary }]}>
        <Text style={styles.frequencyText}>
          {formatFrequency(timer.frequency, timer.customDays)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (editingTimer) {
    return (
      <EditScreen
        timer={editingTimer}
        onClose={() => setEditingTimer(null)}
      />
    );
  }

  if (runningTimerId) {
    return (
      <RunningTimerScreen
        timerId={runningTimerId}
        onClose={() => setRunningTimerId(null)}
      />
    );
  }

  if (currentScreen === 'notifications') {
    return <NotificationsScreen />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'timers':
        return (
          <View style={styles.tabContent}>
            {timers.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
                  <Clock size={48} color={colors.textSecondary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No timers yet
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Create your first timer to stay focused and productive
                </Text>
              </View>
            ) : (
              <FlatList
                data={timers}
                renderItem={({ item }) => <TimerCard timer={item} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.timersList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        );
      case 'notifications':
        return <NotificationsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {activeTab === 'timers' ? 'Timers' : 
           activeTab === 'notifications' ? 'Notifications' : 'Settings'}
        </Text>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: colors.surface }]}>
        <View style={styles.navButtons}>
          <TouchableOpacity
            onPress={() => setActiveTab('timers')}
            style={[
              styles.navButton,
              activeTab === 'timers' && { backgroundColor: colors.primary }
            ]}
          >
            <Clock size={24} color={activeTab === 'timers' ? '#FFFFFF' : colors.text} />
            <Text style={[
              styles.navButtonText,
              { color: activeTab === 'timers' ? '#FFFFFF' : colors.text }
            ]}>
              Timers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('notifications')}
            style={[
              styles.navButton,
              activeTab === 'notifications' && { backgroundColor: colors.primary }
            ]}
          >
            <Bell size={24} color={activeTab === 'notifications' ? '#FFFFFF' : colors.text} />
            <Text style={[
              styles.navButtonText,
              { color: activeTab === 'notifications' ? '#FFFFFF' : colors.text }
            ]}>
              Notifications
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('settings')}
            style={[
              styles.navButton,
              activeTab === 'settings' && { backgroundColor: colors.primary }
            ]}
          >
            <Settings size={24} color={activeTab === 'settings' ? '#FFFFFF' : colors.text} />
            <Text style={[
              styles.navButtonText,
              { color: activeTab === 'settings' ? '#FFFFFF' : colors.text }
            ]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Action Button */}
      {activeTab === 'timers' && (
        <TouchableOpacity
          onPress={() => setScreen('create')}
          style={[styles.fab, { backgroundColor: colors.accent }]}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: designStyles.spacing.lg,
    paddingTop: 20,
    paddingBottom: designStyles.spacing.sm,
    marginHorizontal: designStyles.spacing.sm,
    marginTop: designStyles.spacing.xs,
    borderRadius: designStyles.borderRadius.lg,
    ...designStyles.shadow.sm,
  },
  title: {
    fontSize: designStyles.fontSize.lg,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: designStyles.spacing.lg,
    paddingBottom: 100,
  },
  timersList: {
    paddingTop: designStyles.spacing.sm,
  },
  timerCard: {
    borderRadius: designStyles.borderRadius.xl,
    padding: designStyles.spacing.lg,
    marginBottom: designStyles.spacing.md,
    ...designStyles.shadow.md,
  },
  timerCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: designStyles.spacing.md,
  },
  timerInfo: {
    flex: 1,
  },
  timerName: {
    fontSize: designStyles.fontSize.lg,
    fontWeight: '600',
    marginBottom: designStyles.spacing.sm,
  },
  timerDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designStyles.spacing.xs,
    marginBottom: designStyles.spacing.sm,
  },
  durationText: {
    fontSize: designStyles.fontSize.sm,
  },
  timerTimes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: designStyles.spacing.xs,
  },
  timeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designStyles.spacing.xs,
  },
  timeChip: {
    paddingHorizontal: designStyles.spacing.md,
    paddingVertical: designStyles.spacing.xs,
    borderRadius: designStyles.borderRadius.lg,
  },
  timeText: {
    fontSize: designStyles.fontSize.xs,
    fontWeight: '500',
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designStyles.spacing.md,
  },
  controlButton: {
    padding: designStyles.spacing.sm,
    borderRadius: designStyles.borderRadius.lg,
  },
  frequencyChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: designStyles.spacing.md,
    paddingVertical: designStyles.spacing.xs,
    borderRadius: designStyles.borderRadius.full,
  },
  frequencyText: {
    fontSize: designStyles.fontSize.xs,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: designStyles.spacing.xxxl,
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
  bottomNav: {
    borderTopLeftRadius: designStyles.borderRadius.xxl,
    borderTopRightRadius: designStyles.borderRadius.xxl,
    ...designStyles.shadow.xl,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: designStyles.spacing.xxl,
    paddingVertical: designStyles.spacing.lg,
  },
  navButton: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: designStyles.spacing.xs,
    paddingHorizontal: designStyles.spacing.xxl,
    paddingVertical: designStyles.spacing.md,
    borderRadius: designStyles.borderRadius.xxl,
    minWidth: 80,
  },
  navButtonText: {
    fontSize: designStyles.fontSize.xs,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: designStyles.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...designStyles.shadow.lg,
  },
});
