// tests/screens/LoginScreen.test.js
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
jest.mock('firebase/firestore', () => ({ getFirestore: jest.fn() }));
jest.mock('firebase/storage', () => ({ getStorage: jest.fn() }));

jest.mock('@react-native-google-signin/google-signin', () => ({
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn(),
        signIn: jest.fn(),
    }
}));
jest.mock('../src/services/authService', () => ({
    signInWithGoogle: jest.fn(),
    signInAsGuest: jest.fn(),
    signInWithEmail: jest.fn(),
    signUpWithEmail: jest.fn(),
}));

import React from 'react';
import { View } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import LoginScreen from '../../src/screens/LoginScreen';
import { useLogin } from '../../src/hooks/auth/useLogin';

// Mock the hook
jest.mock('../src/hooks/auth/useLogin');

// Mock AlertContext
const mockShowSuccess = jest.fn();
jest.mock('../src/context/AlertContext', () => ({
    useAlert: () => ({
        showSuccess: mockShowSuccess,
        showError: jest.fn(),
        showWarning: jest.fn(),
    }),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
    const { View } = require('react-native');
    // eslint-disable-next-line react/display-name
    return {
        MaterialCommunityIcons: (props) => <View {...props} testID={`icon-${props.name}`} />,
    };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
    const { View } = require('react-native');
    return {
        SafeAreaView: ({ children }) => <View>{children}</View>,
    };
});

// Mock react-native-paper
jest.mock('react-native-paper', () => {
    const React = require('react');
    const { View, Text, TextInput, TouchableOpacity } = require('react-native');

    // eslint-disable-next-line react/display-name
    const MockTextInput = (props) => {
        return (
            <View>
                <Text>{props.label}</Text>
                <TextInput {...props} testID={`input-${props.label}`} />
                {props.right}
            </View>
        );
    };
    // eslint-disable-next-line react/display-name
    MockTextInput.Icon = (props) => <TouchableOpacity testID={`icon-button-${props.icon}`} onPress={props.onPress}><Text>{props.icon}</Text></TouchableOpacity>;

    return {
        Provider: ({ children }) => children,
        Text: (props) => <Text {...props} />,
        Button: (props) => <TouchableOpacity testID="main-btn" onPress={props.onPress}><Text>{props.children}</Text></TouchableOpacity>,
        Surface: ({ children }) => <View>{children}</View>,
        TextInput: MockTextInput,
        Divider: () => <View />,
        useTheme: () => ({ colors: { background: 'white', surface: 'white', primary: 'blue', outline: 'gray', onSurfaceVariant: 'black' } }),
    };
});

const mockNavigation = {
    navigate: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
};

describe('LoginScreen 測試', () => {
    const mockSetIsLoginMode = jest.fn();
    const mockSetShowPassword = jest.fn();
    const mockSetShowConfirmPassword = jest.fn();
    const mockHandleEmailAuth = jest.fn();

    const baseState = {
        loading: false,
        email: '',
        setEmail: jest.fn(),
        password: '',
        setPassword: jest.fn(),
        confirmPassword: '',
        setConfirmPassword: jest.fn(),
        isLoginMode: true,
        setIsLoginMode: mockSetIsLoginMode,
        showPassword: false,
        setShowPassword: mockSetShowPassword,
        showConfirmPassword: false,
        setShowConfirmPassword: mockSetShowConfirmPassword
    };

    const baseActions = {
        handleEmailAuth: mockHandleEmailAuth,
        handleSocialLogin: jest.fn(),
        signInWithGoogle: jest.fn(),
        handleForgotPassword: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useLogin.mockReturnValue({
            state: baseState,
            actions: baseActions,
        });
    });

    const renderScreen = () => {
        return render(<LoginScreen navigation={mockNavigation} />);
    };

    describe('【畫面渲染】', () => {
        it('預設顯示登入模式與隱藏確認密碼', () => {
            const { getByText, queryByText } = renderScreen();

            expect(getByText('歡迎回來')).toBeTruthy();
            expect(getByText('忘記密碼？')).toBeTruthy();
            expect(queryByText('確認密碼')).toBeNull(); // 確認密碼欄位不存在
        });
    });

    describe('【使用者互動】', () => {
        it('切換至註冊模式', () => {
            // 切換 state
            useLogin.mockReturnValue({
                state: { ...baseState, isLoginMode: false },
                actions: baseActions,
            });

            const { getByText, queryByText } = renderScreen();

            expect(getByText('建立新帳戶')).toBeTruthy();
            expect(getByText('確認密碼')).toBeTruthy(); // 確認密碼欄位出現
            expect(queryByText('忘記密碼？')).toBeNull(); // 忘記密碼隱藏
        });

        it('輸入密碼能切換顯示/隱藏', () => {
            const { getByTestId } = renderScreen();
            const iconBtn = getByTestId('icon-button-eye'); // 我們的 mock 使用了 eye 當作 testID 一部分
            fireEvent.press(iconBtn);

            expect(mockSetShowPassword).toHaveBeenCalledWith(true);
        });
    });

    describe('【功能邏輯】', () => {
        it('點擊主要按鈕觸發驗證', async () => {
            mockHandleEmailAuth.mockResolvedValueOnce(true);

            const { getByTestId } = renderScreen();
            fireEvent.press(getByTestId('main-btn'));

            expect(mockHandleEmailAuth).toHaveBeenCalled();
            await waitFor(() => {
                expect(mockNavigation.goBack).toHaveBeenCalled();
            });
        });
    });
});
