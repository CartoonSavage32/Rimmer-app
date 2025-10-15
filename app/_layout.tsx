import React from 'react';
import { App } from '../components/App';
import { AppProvider } from '../context/AppContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
