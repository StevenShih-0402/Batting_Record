import React from 'react';
import { View } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import LoginScreen from '../src/screens/LoginScreen';
import { useLogin } from '../src/hooks/auth/useLogin';

// Mock the hook
jest.mock('../src/hooks/auth/useLogin');

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
    const { View } = require('react-native');
    // eslint-disable-next-line react/display-name
    return {
        MaterialCommunityIcons: (props) => <View {...props} testID={`icon-${props.name}`} />,
    };
});

// Mock react-native-vector-icons/MaterialCommunityIcons for Paper
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
    const { View } = require('react-native');
    // eslint-disable-next-line react/display-name
    return (props) => <View {...props} testID={`paper-icon-${props.name}`} />;
});

// Mock safe-area-context
jest.mock('react-native-safe-area-context', () => {
    const inset = { top: 0, right: 0, bottom: 0, left: 0 };
    return {
        SafeAreaProvider: jest.fn(({ children }) => children),
        SafeAreaView: jest.fn(({ children }) => children),
        useSafeAreaInsets: jest.fn(() => inset),
        SafeAreaInsetsContext: {
            Consumer: ({ children }) => children(inset),
        },
    };
});

// Mock Google Signin
jest.mock('@react-native-google-signin/google-signin', () => ({
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn(),
        signIn: jest.fn(),
    },
}));

// Mock authService to avoid firebase imports
jest.mock('../src/services/authService', () => ({
    signInWithGoogle: jest.fn(),
    signInAsGuest: jest.fn(),
    signInWithEmail: jest.fn(),
    signUpWithEmail: jest.fn(),
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => {
    const React = require('react');
    const { View, Text, TextInput, TouchableOpacity } = require('react-native');

    // eslint-disable-next-line react/display-name
    const MockTextInput = (props) => {
        // Render right prop if it exists (for Icon)
        return (
            <View>
                <TextInput {...props} testID={props.label} />
                {props.right}
            </View>
        );
    };
    // eslint-disable-next-line react/display-name
    MockTextInput.Icon = (props) => <View {...props} testID="icon-button" />;

    return {
        Provider: ({ children }) => children,
        Text: (props) => <Text {...props} />,
        Button: (props) => <TouchableOpacity {...props}><Text>{props.children}</Text></TouchableOpacity>,
        Surface: ({ children }) => <View>{children}</View>,
        TextInput: MockTextInput,
        Divider: () => <View />,
        useTheme: () => ({ colors: { background: 'white', surface: 'white', primary: 'blue', outline: 'gray', onSurfaceVariant: 'black' } }),
    };
});

// Mock navigation
const mockNavigation = {
    navigate: jest.fn(),
};

describe('LoginScreen', () => {
    // Setup default mock values
    const mockSetEmail = jest.fn();
    const mockSetPassword = jest.fn();
    const mockSetIsLoginMode = jest.fn();
    const mockSetShowPassword = jest.fn();
    const mockHandleEmailAuth = jest.fn();
    const mockHandleSocialLogin = jest.fn();
    const mockSignInWithGoogle = jest.fn();

    const defaultState = {
        loading: false,
        email: '',
        setEmail: mockSetEmail,
        password: '',
        setPassword: mockSetPassword,
        isLoginMode: true, // Default to Login mode
        setIsLoginMode: mockSetIsLoginMode,
        showPassword: false,
        setShowPassword: mockSetShowPassword,
    };

    const defaultActions = {
        handleEmailAuth: mockHandleEmailAuth,
        handleSocialLogin: mockHandleSocialLogin,
        signInWithGoogle: mockSignInWithGoogle,
    };

    beforeEach(() => {
        useLogin.mockReturnValue({
            state: defaultState,
            actions: defaultActions,
        });
        jest.clearAllMocks();
    });

    const renderScreen = () => {
        return render(
            <PaperProvider settings={{
                icon: (props) => <View {...props} testID={`paper-icon-${props.name}`} />
            }}>
                <LoginScreen navigation={mockNavigation} />
            </PaperProvider>
        );
    };

    describe('前端元素', () => {
        it('渲染登入畫面基本元件', () => {
            const { getByText, getByTestId } = renderScreen();

            // 標題顯示 "建立新帳戶" (本測例預設 isLoginMode=true)
            expect(getByText('歡迎回來')).toBeTruthy();

            // 顯示 Email 輸入框
            expect(getByTestId('電子郵件')).toBeTruthy();

            // 顯示 密碼 輸入框
            expect(getByTestId('密碼')).toBeTruthy();

            // 顯示 主要操作按鈕
            expect(getByText('登入')).toBeTruthy();

            // 顯示 切換模式按鈕
            expect(getByText('還沒有帳號？點此註冊')).toBeTruthy();
        });
    });

    describe('互動邏輯', () => {
        it('切換登入/註冊模式', () => {
            const { getByText } = renderScreen();

            // 點擊切換模式按鈕
            fireEvent.press(getByText('還沒有帳號？點此註冊'));

            // 觸發 setIsLoginMode 狀態更新
            expect(mockSetIsLoginMode).toHaveBeenCalledWith(false);
        });

        it('密碼顯示切換', () => {
            const { getByTestId } = renderScreen();
            const iconBtn = getByTestId('icon-button');
            fireEvent.press(iconBtn);
            expect(mockSetShowPassword).toHaveBeenCalledWith(true);
        });
    });

    describe('業務邏輯', () => {
        it('Email 輸入更新', () => {
            const { getByTestId } = renderScreen();
            fireEvent.changeText(getByTestId('電子郵件'), 'test@example.com');
            expect(mockSetEmail).toHaveBeenCalledWith('test@example.com');
        });

        it('密碼 輸入更新', () => {
            const { getByTestId } = renderScreen();
            fireEvent.changeText(getByTestId('密碼'), 'password123');
            expect(mockSetPassword).toHaveBeenCalledWith('password123');
        });

        it('執行 Email 認證 (登入/註冊)', () => {
            const { getByText } = renderScreen();
            fireEvent.press(getByText('登入'));
            expect(mockHandleEmailAuth).toHaveBeenCalled();
        });

        it('執行 Google 社群登入', () => {
            const { getByTestId } = renderScreen();
            // Find custom mocked button by testID
            const googleBtn = getByTestId('google-login-btn');
            fireEvent.press(googleBtn);
            // Correctly expect handleSocialLogin to be called with arguments
            expect(mockHandleSocialLogin).toHaveBeenCalledWith('Google', mockSignInWithGoogle);
        });
    });
});
