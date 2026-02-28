// tests/services/firebaseService.test.js
// Mock Firebase early
jest.mock('firebase/app', () => ({
    getApps: jest.fn(() => []),
    getApp: jest.fn(),
    initializeApp: jest.fn(() => ({ name: 'mock-app' })),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({ type: 'firestore' })),
}));

jest.mock('firebase/auth', () => ({
    initializeAuth: jest.fn(() => ({ type: 'auth' })),
    getReactNativePersistence: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
    getStorage: jest.fn(() => ({ type: 'storage' })),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({}));
jest.mock('../../src/config/firebaseConfig', () => ({
    firebaseConfig: { apiKey: 'fake' },
    BATTING_RECORDS_PATH: 'records',
    AT_BAT_SUMMARY_PATH: 'summaries'
}));

import { initializeApp, getApps, getApp } from 'firebase/app';
import { auth, db, storage, firebaseStatus } from '../../src/services/firebaseService';

describe('firebaseService 測試', () => {

    describe('【初始化邏輯】', () => {
        it('第一次調用應初始化 App', () => {
            expect(initializeApp).toHaveBeenCalled();
        });

        it('導出實例應正確連動', () => {
            expect(auth.type).toBe('auth');
            expect(db.type).toBe('firestore');
            expect(storage.type).toBe('storage');
        });
    });

    describe('【導出值驗證】', () => {
        it('導出正確的 Firestore 路徑', () => {
            expect(firebaseStatus.BATTING_RECORDS_PATH).toBe('records');
            expect(firebaseStatus.AT_BAT_SUMMARY_PATH).toBe('summaries');
            expect(firebaseStatus.isReady).toBe(true);
        });
    });
});
