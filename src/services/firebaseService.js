// src/services/firebaseService.js
// Firebase 的初始化邏輯
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig, PITCH_RECORDS_PATH, AT_BAT_SUMMARY_PATH } from '../config/firebaseConfig';

// 確保不重複初始化
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 使用 AsyncStorage 讓登入狀態可以持久保存 (這才是你要的長期登入)
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

// 路徑與狀態導出
export const firebaseStatus = {
    isReady: true,
    PITCH_RECORDS_PATH,
    AT_BAT_SUMMARY_PATH,
};

// 直接匯出實例
export { auth, db };