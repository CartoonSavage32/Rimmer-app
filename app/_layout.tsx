import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { App } from '../components/App';
import { AppProvider } from '../context/AppContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </SafeAreaProvider>
  );
}
