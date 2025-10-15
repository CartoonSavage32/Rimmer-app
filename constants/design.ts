export const getDesignColors = (isDark: boolean) => {
  if (isDark) {
    return {
      bg: '#111827', // gray-900
      surface: '#1F2937', // gray-800
      surfaceHover: '#374151', // gray-700
      text: '#F9FAFB', // gray-100
      textSecondary: '#9CA3AF', // gray-400
      border: '#374151', // gray-700
      primary: '#6366F1', // indigo-500
      primaryHover: '#4F46E5', // indigo-600
      accent: '#10B981', // emerald-500
      accentGlow: 'rgba(16, 185, 129, 0.5)', // emerald-500/50
      cardBg: 'rgba(31, 41, 55, 0.5)', // gray-800/50
      inputBg: '#374151', // gray-700
      tabActive: '#6366F1', // indigo-500
      tabInactive: '#1F2937', // gray-800
      red: '#EF4444', // red-500
      redHover: '#DC2626', // red-600
    };
  } else {
    return {
      bg: '#F8FAFC', // blue-50 to indigo-50 gradient equivalent
      surface: '#FFFFFF',
      surfaceHover: '#F9FAFB', // gray-50
      text: '#111827', // gray-900
      textSecondary: '#6B7280', // gray-600
      border: '#E5E7EB', // gray-200
      primary: '#6366F1', // indigo-500
      primaryHover: '#4F46E5', // indigo-600
      accent: '#10B981', // emerald-500
      accentGlow: 'rgba(16, 185, 129, 0.2)', // emerald-500/20
      cardBg: 'rgba(255, 255, 255, 0.8)', // white/80
      inputBg: '#F9FAFB', // gray-50
      tabActive: '#6366F1', // indigo-500
      tabInactive: '#FFFFFF',
      red: '#EF4444', // red-500
      redHover: '#DC2626', // red-600
    };
  }
};

export const designStyles = {
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.25,
      shadowRadius: 25,
      elevation: 8,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    xxxxl: 32,
  },
  screen: {
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    formContent: {
      paddingHorizontal: 16, // lg
      paddingBottom: 100,
    },
    section: {
      marginBottom: 24, // xxl
    },
    sectionLabel: {
      fontSize: 14, // sm
      fontWeight: '600' as const,
      marginBottom: 12, // md
      letterSpacing: 1,
    },
    input: {
      borderRadius: 20, // xl
      borderWidth: 1,
      paddingHorizontal: 16, // lg
      paddingVertical: 16, // lg
      fontSize: 16, // md
    },
  },
};
