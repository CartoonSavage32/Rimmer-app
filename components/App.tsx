import React, { useEffect, useRef } from 'react';
import { BackHandler, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { notificationService } from '../services/NotificationService';
import { CreateScreen } from './screens/CreateScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export const App: React.FC = () => {
  const { state, navigateBack } = useApp();
  const { currentScreen, isDark, isLoading, navigationHistory } = state;
  const insets = useSafeAreaInsets();
  const backPressCount = useRef(0);
  const backPressTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Request notification permissions on app start
    notificationService.requestPermissions();
  }, []);

  useEffect(() => {
    const backAction = () => {
      // If not on home screen, navigate back
      if (currentScreen !== 'home') {
        navigateBack();
        return true;
      }

      // If on home screen, implement double-tap to exit
      if (currentScreen === 'home') {
        backPressCount.current += 1;
        
        if (backPressCount.current === 1) {
          // First back press - show a toast or just reset after timeout
          if (backPressTimeout.current) {
            clearTimeout(backPressTimeout.current);
          }
          
          backPressTimeout.current = setTimeout(() => {
            backPressCount.current = 0;
          }, 2000); // 2 second window for double tap
          
          return true; // Prevent default back action
        } else if (backPressCount.current === 2) {
          // Second back press within 2 seconds - exit app
          BackHandler.exitApp();
          return true;
        }
      }

      return false; // Allow default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      backHandler.remove();
      if (backPressTimeout.current) {
        clearTimeout(backPressTimeout.current);
      }
    };
  }, [currentScreen, navigateBack]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#FFFFFF' }]}>
        {/* You could add a loading spinner here */}
      </SafeAreaView>
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
      case 'running-timer':
        return <HomeScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#FFFFFF' }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#111827' : '#FFFFFF'}
        translucent={false}
      />
      {renderScreen()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
