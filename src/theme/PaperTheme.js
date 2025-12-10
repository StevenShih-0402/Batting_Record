// src/theme/PaperTheme.js
import { DefaultTheme } from 'react-native-paper'; 

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4F46E5', // Indigo-600
    primaryContainer: '#E0E7FF', // Indigo-100
    background: '#F9FAFB', // Gray-50
    surfaceVariant: '#F3F4F6', // Gray-100
    error: '#EF4444', // Red-500
  },
};

export default customTheme;