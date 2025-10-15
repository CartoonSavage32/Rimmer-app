# Reminder Timer App

A React Native timer reminder app built with Expo, featuring clean UI design, notification scheduling, and persistent data storage.

## Features

- ⏰ **Timer Management**: Create, edit, and manage multiple timers
- 🔔 **Smart Notifications**: Schedule notifications based on frequency (daily, weekdays, weekends)
- 🎨 **Theme Support**: Light, dark, and system theme options
- 💾 **Data Persistence**: Timers are saved locally using AsyncStorage
- 📱 **Cross-Platform**: Works on iOS and Android
- 🎯 **Clean UI**: Modern, intuitive interface following React Native best practices

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Context API** for state management
- **AsyncStorage** for data persistence
- **Expo Notifications** for push notifications
- **Lucide React Native** for icons
- **Date-fns** for date manipulation

## Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Switch.tsx
│   │   ├── Card.tsx
│   │   └── IconButton.tsx
│   ├── screens/            # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── CreateScreen.tsx
│   │   └── SettingsScreen.tsx
│   └── App.tsx            # Main app component
├── context/
│   └── AppContext.tsx     # Global state management
├── services/
│   └── NotificationService.ts  # Notification handling
├── types/
│   └── index.ts           # TypeScript type definitions
└── app/
    └── _layout.tsx        # App entry point
```

## Key Features Implementation

### State Management
- Uses React Context API with useReducer for predictable state updates
- Centralized state management for timers, settings, and UI state
- Automatic data persistence with AsyncStorage

### Notification System
- Requests notification permissions on app start
- Schedules notifications based on timer frequency
- Handles different notification patterns (daily, weekdays, weekends)
- Proper cleanup when timers are deleted or disabled

### Theme System
- Support for light, dark, and system themes
- Dynamic theme switching with persistent storage
- Consistent theming across all components

### Component Architecture
- Reusable UI components following DRY principles
- Consistent styling and behavior
- Type-safe props with TypeScript
- Proper accessibility support

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on device/simulator**:
```bash
   npm run ios     # iOS simulator
   npm run android # Android emulator
   ```

## Usage

1. **Create a Timer**:
   - Tap the "+" button on the home screen
   - Enter timer name and duration
   - Set notification times
   - Choose frequency (daily, weekdays, weekends)
   - Tap "Create Timer"

2. **Manage Timers**:
   - Toggle timers on/off using the switch
   - View scheduled times and frequency
   - Timers are automatically saved

3. **Settings**:
   - Change theme (light/dark/system)
   - Manage notification permissions
   - View app information

## Permissions

The app requests the following permissions:
- **Notifications**: Required for timer reminders
- **Vibration**: For notification feedback
- **Wake Lock**: To ensure notifications are delivered

## Best Practices Implemented

- **TypeScript**: Full type safety throughout the app
- **DRY Principle**: Reusable components and utilities
- **Separation of Concerns**: Clear separation between UI, business logic, and data
- **Error Handling**: Proper error handling and user feedback
- **Performance**: Optimized rendering and state updates
- **Accessibility**: Proper accessibility labels and navigation
- **Code Organization**: Clean, maintainable code structure

## Future Enhancements

- Custom frequency patterns
- Timer categories and tags
- Export/import functionality
- Widget support
- Analytics and insights
- Cloud sync capabilities

## License

MIT License - feel free to use this project as a starting point for your own timer apps!