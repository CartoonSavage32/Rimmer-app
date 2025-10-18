import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { Appearance } from 'react-native';
import { notificationService } from '../services/NotificationService';
import { AppSettings, NewTimer, Screen, Theme, Timer } from '../types';

interface AppState {
  timers: Timer[];
  settings: AppSettings;
  currentScreen: Screen;
  isDark: boolean;
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SCREEN'; payload: Screen }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'SET_TIMERS'; payload: Timer[] }
  | { type: 'ADD_TIMER'; payload: Timer }
  | { type: 'UPDATE_TIMER'; payload: Timer }
  | { type: 'DELETE_TIMER'; payload: string }
  | { type: 'TOGGLE_TIMER'; payload: string }
  | { type: 'START_TIMER'; payload: string }
  | { type: 'STOP_TIMER'; payload: string }
  | { type: 'SET_SETTINGS'; payload: AppSettings };

const initialState: AppState = {
  timers: [],
  settings: {
    theme: 'system',
    notificationsEnabled: false,
    timeFormat: '24h',
  },
  currentScreen: 'home',
  isDark: false,
  isLoading: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload };
    case 'SET_THEME':
      return { ...state, settings: { ...state.settings, theme: action.payload } };
    case 'SET_DARK_MODE':
      return { ...state, isDark: action.payload };
    case 'SET_TIMERS':
      return { ...state, timers: action.payload };
    case 'ADD_TIMER':
      return { ...state, timers: [...state.timers, action.payload] };
    case 'UPDATE_TIMER':
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.id === action.payload.id ? action.payload : timer
        ),
      };
    case 'DELETE_TIMER':
      return {
        ...state,
        timers: state.timers.filter(timer => timer.id !== action.payload),
      };
    case 'TOGGLE_TIMER':
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.id === action.payload
            ? { ...timer, enabled: !timer.enabled }
            : timer
        ),
      };
    case 'START_TIMER':
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.id === action.payload
            ? { 
                ...timer, 
                isRunning: true, 
                remainingTime: timer.duration * 60,
                updatedAt: new Date()
              }
            : timer
        ),
      };
    case 'STOP_TIMER':
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.id === action.payload
            ? { 
                ...timer, 
                isRunning: false, 
                remainingTime: undefined,
                updatedAt: new Date()
              }
            : timer
        ),
      };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addTimer: (timer: NewTimer) => Promise<void>;
  updateTimer: (timer: Timer) => Promise<void>;
  deleteTimer: (id: string) => Promise<void>;
  toggleTimer: (id: string) => Promise<void>;
  startTimer: (id: string) => void;
  stopTimer: (id: string) => void;
  setScreen: (screen: Screen) => void;
  setTheme: (theme: Theme) => Promise<void>;
  setTimeFormat: (format: '12h' | '24h') => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data on app start
  useEffect(() => {
    loadAppData();
  }, []);

  // Background timer management
  useEffect(() => {
    const interval = setInterval(() => {
      const runningTimers = state.timers.filter(timer => timer.isRunning);
      
      if (runningTimers.length > 0) {
        const updatedTimers = state.timers.map(timer => {
          if (timer.isRunning && timer.remainingTime !== undefined) {
            const newRemainingTime = Math.max(0, timer.remainingTime - 1);
            
            if (newRemainingTime === 0) {
              // Timer finished
              return {
                ...timer,
                isRunning: false,
                remainingTime: undefined,
                updatedAt: new Date()
              };
            }
            
            return {
              ...timer,
              remainingTime: newRemainingTime,
              updatedAt: new Date()
            };
          }
          return timer;
        });
        
        dispatch({ type: 'SET_TIMERS', payload: updatedTimers });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.timers]);

  // Update dark mode when theme changes
  useEffect(() => {
    updateDarkMode();
  }, [state.settings.theme]);

  // Listen for system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (state.settings.theme === 'system') {
        const isDark = colorScheme === 'dark';
        dispatch({ type: 'SET_DARK_MODE', payload: isDark });
      }
    });

    return () => subscription?.remove();
  }, [state.settings.theme]);

  const loadAppData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [timersData, settingsData] = await Promise.all([
        AsyncStorage.getItem('timers'),
        AsyncStorage.getItem('settings'),
      ]);

      if (timersData) {
        const timers = JSON.parse(timersData).map((timer: any) => ({
          ...timer,
          createdAt: new Date(timer.createdAt),
          updatedAt: new Date(timer.updatedAt),
        }));
        dispatch({ type: 'SET_TIMERS', payload: timers });
      }

      if (settingsData) {
        const settings = JSON.parse(settingsData);
        dispatch({ type: 'SET_SETTINGS', payload: settings });
      }
    } catch (error) {
      console.error('Error loading app data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateDarkMode = async () => {
    const { theme } = state.settings;
    let isDark = false;

    if (theme === 'dark') {
      isDark = true;
    } else if (theme === 'light') {
      isDark = false;
    } else {
      // System theme - detect the actual system color scheme
      const systemColorScheme = Appearance.getColorScheme();
      isDark = systemColorScheme === 'dark';
    }

    dispatch({ type: 'SET_DARK_MODE', payload: isDark });
  };

  const addTimer = async (newTimer: NewTimer) => {
    const timer: Timer = {
      ...newTimer,
      id: Date.now().toString(),
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch({ type: 'ADD_TIMER', payload: timer });
    
    try {
      await AsyncStorage.setItem('timers', JSON.stringify([...state.timers, timer]));
      await notificationService.scheduleTimerNotifications(timer);
    } catch (error) {
      console.error('Error saving timer:', error);
    }
  };

  const updateTimer = async (timer: Timer) => {
    const updatedTimer = { ...timer, updatedAt: new Date() };
    dispatch({ type: 'UPDATE_TIMER', payload: updatedTimer });
    
    try {
      const updatedTimers = state.timers.map(t => t.id === timer.id ? updatedTimer : t);
      await AsyncStorage.setItem('timers', JSON.stringify(updatedTimers));
      await notificationService.scheduleTimerNotifications(updatedTimer);
    } catch (error) {
      console.error('Error updating timer:', error);
    }
  };

  const deleteTimer = async (id: string) => {
    dispatch({ type: 'DELETE_TIMER', payload: id });
    
    try {
      const updatedTimers = state.timers.filter(t => t.id !== id);
      await AsyncStorage.setItem('timers', JSON.stringify(updatedTimers));
      await notificationService.cancelTimerNotifications(id);
    } catch (error) {
      console.error('Error deleting timer:', error);
    }
  };

  const toggleTimer = async (id: string) => {
    const timer = state.timers.find(t => t.id === id);
    if (!timer) return;

    const updatedTimer = { ...timer, enabled: !timer.enabled, updatedAt: new Date() };
    dispatch({ type: 'UPDATE_TIMER', payload: updatedTimer });
    
    try {
      const updatedTimers = state.timers.map(t => t.id === id ? updatedTimer : t);
      await AsyncStorage.setItem('timers', JSON.stringify(updatedTimers));
      
      if (updatedTimer.enabled) {
        await notificationService.scheduleTimerNotifications(updatedTimer);
      } else {
        await notificationService.cancelTimerNotifications(id);
      }
    } catch (error) {
      console.error('Error toggling timer:', error);
    }
  };

  const setScreen = (screen: Screen) => {
    dispatch({ type: 'SET_SCREEN', payload: screen });
  };

  const setTheme = async (theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
    
    try {
      const newSettings = { ...state.settings, theme };
      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const setTimeFormat = async (format: '12h' | '24h') => {
    const newSettings = { ...state.settings, timeFormat: format };
    dispatch({ type: 'SET_SETTINGS', payload: newSettings });
    
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving time format:', error);
    }
  };

  const startTimer = (id: string) => {
    dispatch({ type: 'START_TIMER', payload: id });
  };

  const stopTimer = (id: string) => {
    dispatch({ type: 'STOP_TIMER', payload: id });
  };

  const value: AppContextType = {
    state,
    dispatch,
    addTimer,
    updateTimer,
    deleteTimer,
    toggleTimer,
    startTimer,
    stopTimer,
    setScreen,
    setTheme,
    setTimeFormat,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
