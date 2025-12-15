// src/theme/PaperTheme.js
import { DefaultTheme } from 'react-native-paper'; 

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4F46E5', // Indigo-600
    primaryContainer: '#E0E7FF', // Indigo-100
    background: '#F9FAFB', // Gray-50
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6', // Gray-100
    error: '#EF4444', // Red-500

    outline: '#D1D5DB', // 適合邊界和分隔線的顏色 (例如 Gray-300)
    onSurfaceVariant: 'rgba(255, 255, 255, 0.5)', // 適合網格線的半透明顏色
  },
};

export default customTheme;