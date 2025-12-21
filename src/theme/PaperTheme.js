// src/theme/PaperTheme.js
// 管理"美化介面，定義主題色調的顏色"
import { MD3DarkTheme } from 'react-native-paper'; // 建議戶外使用 DarkTheme 作為基底

export const customTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // 【動作與重點】
    primary: '#00E5FF',            // 儲存按鈕、主要的 Icon
    
    // 【畫布與基調】
    background: '#000000',         // 整個螢幕的底色
    surface: '#1A1A1A',            // Modal 彈窗底色、輸入框底色
    surfaceVariant: '#2A2A2A',     // 歷史清單的每一列紀錄 (Item) 的底色
    
    // 【線條與邊框】
    outline: '#FFFFFF',            // 九宮格最外框 (最顯眼)
    onSurfaceVariant: '#888888',   // 九宮格內十字線、或是清單中的次要文字
    
    // 【文字顏色】
    onSurface: '#FFFFFF',          // 一般文字
    onPrimary: '#000000',          // 放在 Primary 按鈕上面的文字顏色 (對比色)
    
    // 【狀態】
    error: '#FF5252',              // 刪除按鈕、三振、警告
  },
};

export default customTheme;