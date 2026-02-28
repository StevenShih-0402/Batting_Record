// tests/screens/ProfileScreen.test.js
// Mock Firebase and services
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
    getApps: jest.fn(() => [{}]),
    getApp: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
        onAuthStateChanged: jest.fn(() => jest.fn())
    })),
    onAuthStateChanged: jest.fn(() => jest.fn()),
    signInAnonymously: jest.fn(),
    initializeAuth: jest.fn(),
    getReactNativePersistence: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
}));
jest.mock('firebase/storage', () => ({
    getStorage: jest.fn(),
}));
jest.mock('../src/services/firebaseService', () => ({
    auth: { currentUser: { uid: 'test-uid' } },
    db: {}
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import ProfileScreen from '../../src/screens/ProfileScreen';
import { useAuth } from '../../src/hooks/auth/useAuth';
import { useAlert } from '../../src/context/AlertContext';

// Mock Dependencies
jest.mock('../src/hooks/auth/useAuth');
jest.mock('../src/context/AlertContext');

jest.mock('../src/services/authService', () => ({
    signOutUser: jest.fn()
}));

const { signOutUser } = require('../../src/services/authService');

const mockNavigate = jest.fn();
const navigation = { navigate: mockNavigate };

const renderWithTheme = (ui) => {
    return render(<PaperProvider>{ui}</PaperProvider>);
};

describe('ProfileScreen 測試', () => {
    const mockShowSuccess = jest.fn();
    const mockShowWarning = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        useAlert.mockReturnValue({
            showSuccess: mockShowSuccess,
            showWarning: mockShowWarning,
            showError: jest.fn()
        });
    });

    describe('【畫面渲染】', () => {
        it('訪客用戶 UI 呈現', () => {
            useAuth.mockReturnValue({
                user: { isAnonymous: true, uid: '1234567890' }
            });

            const { getByText, queryByText } = renderWithTheme(<ProfileScreen navigation={navigation} />);

            expect(getByText('訪客用戶')).toBeTruthy();
            expect(getByText('登入 / 註冊帳戶')).toBeTruthy();

            // 不應包含一般用戶選項
            expect(queryByText('編輯個人資料')).toBeNull();
            expect(queryByText('偏好設定')).toBeNull();
            expect(queryByText('登出')).toBeNull();
        });

        it('一般登入用戶 UI 呈現', () => {
            useAuth.mockReturnValue({
                user: { isAnonymous: false, displayName: 'TestUser', uid: '1234567890' }
            });

            const { getByText, queryByText } = renderWithTheme(<ProfileScreen navigation={navigation} />);

            expect(getByText('TestUser')).toBeTruthy();
            expect(getByText('編輯個人資料')).toBeTruthy();
            expect(getByText('偏好設定')).toBeTruthy();
            expect(getByText('登出')).toBeTruthy();
        });
    });

    describe('【使用者互動】', () => {
        it('登出功能正常觸發', async () => {
            useAuth.mockReturnValue({
                user: { isAnonymous: false, uid: '123' }
            });
            signOutUser.mockResolvedValueOnce(true);

            const { getByText } = renderWithTheme(<ProfileScreen navigation={navigation} />);
            fireEvent.press(getByText('登出'));

            await waitFor(() => {
                expect(signOutUser).toHaveBeenCalled();
                expect(mockShowSuccess).toHaveBeenCalledWith('已登出');
            });
        });

        it('訪客登出防呆機制', async () => {
            // 模擬有登出按鈕但 signOutUser 回傳 false 的情境 (防呆攔截)
            useAuth.mockReturnValue({
                user: { isAnonymous: false, uid: '123' }
            });
            signOutUser.mockResolvedValueOnce(false);

            const { getByText } = renderWithTheme(<ProfileScreen navigation={navigation} />);
            fireEvent.press(getByText('登出'));

            await waitFor(() => {
                expect(signOutUser).toHaveBeenCalled();
                expect(mockShowWarning).toHaveBeenCalledWith("提示", "訪客用戶無法登出，請先綁定 Google 或 Email 帳號");
            });
        });
    });
});
