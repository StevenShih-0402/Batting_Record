// src/theme/PaperTheme.js
// 管理"美化介面，定義主題色調的顏色"
import { DefaultTheme } from 'react-native-paper'; 

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4F46E5',             // 標題 | 按鈕
    primaryContainer: '#e0f4ffff',  // screen 的壞球球數背景色
    background: '#F9FAFB',          // 第幾球的數字 | 文字輸入框
    surface: '#FFFFFF',             // 球的外框 | 歷史清單標題背景 | 下拉選單背景
    surfaceVariant: '#F3F4F6',      // 歷史清單的底色
    error: '#EF4444',               // 垃圾桶 Icon | 打席結果的文字

    outline: '#D1D5DB',                             // 九宮格外框線
    onSurfaceVariant: 'rgba(255, 255, 255, 0.5)',   // 九宮格內框線 | 打席累計球數
  },
};

export default customTheme;