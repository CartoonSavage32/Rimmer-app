import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { notificationService } from '../services/NotificationService';
import { CreateScreen } from './screens/CreateScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export const App: React.FC = () => {
  const { state } = useApp();
  const { currentScreen, isDark, isLoading } = state;

  useEffect(() => {
    // Request notification permissions on app start
    notificationService.requestPermissions();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#FFFFFF' }]}>
        {/* You could add a loading spinner here */}
      </View>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'create':
        return <CreateScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#FFFFFF' }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#111827' : '#FFFFFF'}
      />
      {renderScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
