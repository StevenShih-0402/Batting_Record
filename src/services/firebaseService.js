// src/services/firebaseService.js
// Firebase 的初始化邏輯
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, inMemoryPersistence } from 'firebase/auth';
import { firebaseConfig, PITCH_RECORDS_PATH, AT_BAT_SUMMARY_PATH } from '../config/firebaseConfig';

let firebaseApp, auth, db;

try {
    firebaseApp = initializeApp(firebaseConfig);
    auth = initializeAuth(firebaseApp, {
        persistence: inMemoryPersistence 
    });
    db = getFirestore(firebaseApp);
} catch (e) {
    console.error("Firebase Initialization Error:", e.message);
    // 降級處理：提供假物件防止閃退
    auth = { onAuthStateChanged: (cb) => { cb(null); return () => {}; }, currentUser: null };
    db = { app: null }; 
}

// 初始化狀態與路徑導出
export const firebaseStatus = {
    isReady: !!db.app,
    auth: auth,
    db: db,
    PITCH_RECORDS_PATH,
    AT_BAT_SUMMARY_PATH,
};

export { auth, db };