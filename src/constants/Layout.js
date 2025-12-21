// src/constants/Layout.js
// 管理與螢幕尺寸相關的"常數"
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Layout = {
  WINDOW: {
    WIDTH: width,               // 螢幕的寬度
    HEIGHT: height,             // 螢幕的高度
  },
  DRAWER_WIDTH: width,          // 側邊欄 (歷史清單) 的寬度，這邊設定為滿版
};