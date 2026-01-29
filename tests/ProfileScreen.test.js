// tests/ProfileScreen.test.js
// Unit tests for ProfileScreen covering all user states and interactions.

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import ProfileScreen from '../src/screens/ProfileScreen';
import { useAuth } from '../src/hooks/auth/useAuth';
import { signOut } from 'firebase/auth';

// Mock dependencies
jest.mock('../src/hooks/auth/useAuth');
jest.mock('firebase/auth', () => ({
    signOut: jest.fn(),
}));
jest.mock('../src/services/firebaseService', () => ({
    auth: {},
}));

const mockNavigate = jest.fn();
const navigation = { navigate: mockNavigate };

const renderWithTheme = (ui) => {
    return render(<PaperProvider>{ui}</PaperProvider>);
};

describe('ProfileScreen 測試', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('【UI Render】', () => {
        it('訪客用戶顯示正確資訊', () => {
            useAuth.mockReturnValue({
                user: { isAnonymous: true, uid: '123' }
            });

            const { getByText, queryByText } = renderWithTheme(<ProfileScreen navigation={navigation} />);

            expect(getByText('訪客用戶')).toBeTruthy();
            expect(getByText('登入 / 註冊帳戶')).toBeTruthy();
            expect(queryByText('登出')).toBeNull();
            expect(queryByText('編輯個人資料')).toBeNull();
        });

        it('已登入用戶顯示正確資訊 (有頭貼)', () => {
            useAuth.mockReturnValue({
                user: {
                    isAnonymous: false,
                    displayName: 'TestUser',
                    photoURL: 'http://test.com/img.jpg',
                    uid: '456'
                }
            });

            const { getByText } = renderWithTheme(<ProfileScreen navigation={navigation} />);

            expect(getByText('TestUser')).toBeTruthy();
            expect(getByText('編輯個人資料')).toBeTruthy();
            expect(getByText('登出')).toBeTruthy();
        });

        it('已登入用戶顯示正確資訊 (無頭貼)', () => {
            useAuth.mockReturnValue({
                user: {
                    isAnonymous: false,
                    displayName: null,
                    photoURL: null,
                    uid: '789'
                }
            });

            const { getByText } = renderWithTheme(<ProfileScreen navigation={navigation} />);

            expect(getByText('未命名用戶')).toBeTruthy();
            expect(getByText('編輯個人資料')).toBeTruthy();
        });

        it('Email 未驗證顯示警告', () => {
            useAuth.mockReturnValue({
                user: {
                    isAnonymous: false,
                    emailVerified: false,
                    uid: 'email-123'
                }
            });

            const { getByText } = renderWithTheme(<ProfileScreen navigation={navigation} />);

            expect(getByText('驗證電子郵件')).toBeTruthy();
        });
    });

    describe('【Interaction】', () => {
        it('點擊登入導向 Login 頁面', () => {
            useAuth.mockReturnValue({
                user: { isAnonymous: true, uid: '123' }
            });

            const { getByText } = renderWithTheme(<ProfileScreen navigation={navigation} />);
            fireEvent.press(getByText('登入 / 註冊帳戶'));

            expect(mockNavigate).toHaveBeenCalledWith('Login');
        });

        it('點擊編輯導向 EditProfile 頁面', () => {
            useAuth.mockReturnValue({
                user: { isAnonymous: false, uid: '456' }
            });

            const { getByText } = renderWithTheme(<ProfileScreen navigation={navigation} />);
            fireEvent.press(getByText('編輯個人資料'));

            expect(mockNavigate).toHaveBeenCalledWith('EditProfile');
        });

        it('點擊登出執行 SignOut', async () => {
            const alertSpy = jest.spyOn(Alert, 'alert');
            useAuth.mockReturnValue({
                user: { isAnonymous: false, uid: '456' }
            });

            const { getByText } = renderWithTheme(<ProfileScreen navigation={navigation} />);
            fireEvent.press(getByText('登出'));

            expect(signOut).toHaveBeenCalled();
            // Wait for handleLogout to finish since it's async
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(alertSpy).toHaveBeenCalledWith("已登出");
        });
    });
});
