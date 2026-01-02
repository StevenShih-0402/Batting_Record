// src/config/firebaseConfig.js
// Firebase 的帳戶資訊與 Token

// **透過 process.env 讀取帶有 EXPO_PUBLIC_ 前綴的變數**
const APP_ID = process.env.EXPO_PUBLIC_APP_ID;

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID_FULL, // 使用 FULL 名稱
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// 組合路徑：利用 APP_ID 變數和路徑片段來構建
const PITCH_RECORDS_PATH = 
    `${process.env.EXPO_PUBLIC_ARTIFACTS_PREFIX}/${APP_ID}${process.env.EXPO_PUBLIC_PITCH_RECORDS_SUFFIX}`;
    
const AT_BAT_SUMMARY_PATH = 
    `${process.env.EXPO_PUBLIC_ARTIFACTS_PREFIX}/${APP_ID}${process.env.EXPO_PUBLIC_AT_BAT_SUMMARY_SUFFIX}`;

export { 
    firebaseConfig, 
    PITCH_RECORDS_PATH, 
    AT_BAT_SUMMARY_PATH 
};
