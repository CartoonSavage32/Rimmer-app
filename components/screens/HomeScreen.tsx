import { Bell, Clock, Edit, Play, Plus, Square } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Timer } from '../../types';
import { formatFrequency, formatTime } from '../../utils/timeUtils';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { IconButton } from '../ui/IconButton';
import { Switch } from '../ui/Switch';
import { TimerCountdown } from '../ui/TimerCountdown';
import { EditScreen } from './EditScreen';
import { NotificationsScreen } from './NotificationsScreen';

export const HomeScreen: React.FC = () => {
  const { state, toggleTimer, startTimer, stopTimer, setScreen } = useApp();
  const { timers, isDark, settings, currentScreen } = state;
  const [editingTimer, setEditingTimer] = useState<Timer | null>(null);

  const handleEditTimer = (timer: Timer) => {
    if (timer.isRunning) {
      // Don't allow editing running timers
      return;
    }
    setEditingTimer(timer);
  };

  const handleManualTrigger = (timer: Timer) => {
    if (timer.isRunning) {
      stopTimer(timer.id);
    } else {
      startTimer(timer.id);
    }
  };

  const renderTimer = ({ item: timer }: { item: Timer }) => (
    <Card key={timer.id} style={styles.timerCard} variant="elevated">
      {timer.isRunning && (
        <TimerCountdown timer={timer} isDark={isDark} />
      )}
      
      <View style={styles.timerHeader}>
        <View style={styles.timerInfo}>
          <Text style={[styles.timerName, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            {timer.name}
          </Text>
          <View style={styles.timerDuration}>
            <Clock size={14} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.durationText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {timer.duration} min
            </Text>
          </View>
        </View>
        <View style={styles.timerControls}>
          <IconButton
            icon={<Edit size={16} color={timer.isRunning ? '#9CA3AF' : (isDark ? '#9CA3AF' : '#6B7280')} />}
            onPress={() => handleEditTimer(timer)}
            variant="ghost"
            size="small"
            disabled={timer.isRunning}
          />
          <Switch
            value={timer.enabled}
            onValueChange={() => toggleTimer(timer.id)}
            size="medium"
          />
        </View>
      </View>
      
      <View style={styles.timerTimes}>
        {timer.times.map((time, idx) => (
          <View
            key={idx}
            style={[
              styles.timeChip,
              { backgroundColor: isDark ? '#374151' : '#FFFFFF' }
            ]}
          >
            <Bell size={12} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text style={[styles.timeText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
              {formatTime(time, settings.timeFormat)}
            </Text>
          </View>
        ))}
        <View
          style={[
            styles.frequencyChip,
            { backgroundColor: isDark ? '#374151' : '#FFFFFF' }
          ]}
        >
          <Text style={[styles.frequencyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {formatFrequency(timer.frequency, timer.customDays)}
          </Text>
        </View>
      </View>

      <View style={styles.timerActions}>
        <Button
          title={timer.isRunning ? 'Stop Timer' : 'Start Timer'}
          onPress={() => handleManualTrigger(timer)}
          variant={timer.isRunning ? 'outline' : 'primary'}
          size="small"
          icon={timer.isRunning ? 
            <Square size={16} color={isDark ? '#9CA3AF' : '#6B7280'} /> : 
            <Play size={16} color="#FFFFFF" />
          }
          style={styles.manualTriggerButton}
        />
      </View>
    </Card>
  );

  if (editingTimer) {
    return (
      <EditScreen
        timer={editingTimer}
        onClose={() => setEditingTimer(null)}
      />
    );
  }

  if (currentScreen === 'notifications') {
    return <NotificationsScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#FFFFFF' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#F9FAFB' : '#111827' }]}>
          Timers
        </Text>
        <View style={styles.headerActions}>
          <IconButton
            icon={<Bell size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />}
            onPress={() => setScreen('notifications')}
            variant="ghost"
          />
          <IconButton
            icon={<Clock size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />}
            onPress={() => setScreen('settings')}
            variant="ghost"
          />
        </View>
      </View>

      <View style={styles.content}>
        {timers.length === 0 ? (
          <View style={styles.emptyState}>
            <Clock size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
              No timers yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Create your first timer to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={timers}
            renderItem={renderTimer}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.timersList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

    <View style={styles.fabContainer}>
        <Button
          title=""
          onPress={() => setScreen('create')}
          style={styles.fab}
          icon={<Plus size={24} color="#FFFFFF" />}
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
  timersList: {
    paddingBottom: 100,
  },
  timerCard: {
    marginBottom: 16,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timerInfo: {
    flex: 1,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  timerDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 14,
  },
  timerTimes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  frequencyChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  frequencyText: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  timerActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  manualTriggerButton: {
    width: '100%',
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
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});
