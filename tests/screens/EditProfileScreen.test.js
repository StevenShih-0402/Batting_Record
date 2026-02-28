// tests/screens/EditProfileScreen.test.js
// Mock Firebase and services
jest.mock('firebase/app', () => ({ initializeApp: jest.fn(), getApps: jest.fn(() => [{}]), getApp: jest.fn() }));
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({ onAuthStateChanged: jest.fn(() => jest.fn()) })),
    onAuthStateChanged: jest.fn(() => jest.fn()),
    signInAnonymously: jest.fn(),
    initializeAuth: jest.fn(),
    getReactNativePersistence: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({ getFirestore: jest.fn() }));
jest.mock('firebase/storage', () => ({ getStorage: jest.fn() }));
jest.mock('../src/services/firebaseService', () => ({
    auth: { currentUser: { uid: 'test-uid' } },
    db: {}
}));
jest.mock('@react-native-google-signin/google-signin', () => ({
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn(),
        signIn: jest.fn(),
    }
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import EditProfileScreen from '../../src/screens/EditProfileScreen';
import { useEditProfile } from '../../src/hooks/useEditProfile';
import { View, Text, TouchableOpacity, TextInput as NativeTextInput } from 'react-native';

jest.mock('../src/hooks/useEditProfile');

// Mock react-native-paper
jest.mock('react-native-paper', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity, TextInput: NativeTextInput } = require('react-native');

    // eslint-disable-next-line react/display-name
    const MockTextInput = (props) => (
        <View>
            <Text>{props.label}</Text>
            <NativeTextInput testID={`input-${props.label}`} value={props.value} onChangeText={props.onChangeText} editable={!props.disabled} />
        </View>
    );
    MockTextInput.Icon = () => <View />;

    return {
        ...jest.requireActual('react-native-paper'),
        useTheme: () => ({ colors: { background: 'white', primary: 'blue', secondary: 'grey', error: 'red', onSurfaceVariant: 'gray' } }),
        Provider: ({ children }) => children,
        TextInput: MockTextInput,
        Button: (props) => <TouchableOpacity testID={`btn-${props.children}`} onPress={props.onPress}><Text>{props.children}</Text></TouchableOpacity>,
        Avatar: { Image: () => <View />, Icon: () => <View /> },
        List: {
            Section: ({ children }) => <View>{children}</View>,
            Item: (props) => (
                <View>
                    <Text>{props.title}</Text>
                    <TouchableOpacity testID="mock-switch" onPress={props.onPress} />
                    {props.right && props.right()}
                </View>
            ),
            Icon: () => <View />,
        },
        Divider: () => <View />,
        Switch: (props) => <TouchableOpacity testID="switch-btn" onPress={() => props.onValueChange(!props.value)} ><Text>{props.value ? 'ON' : 'OFF'}</Text></TouchableOpacity>,
        HelperText: ({ children }) => <Text>{children}</Text>,
        Text: (props) => <Text {...props} />,
    };
});

// Mock SafeAreaView and relevant context
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }) => children,
}));

describe('EditProfileScreen 測試', () => {
    const mockNavigate = jest.fn();
    const mockHandleLinkGoogle = jest.fn();
    const mockHandleUnlinkGoogle = jest.fn();
    const mockHandleSave = jest.fn();

    const mockForm = {
        displayName: '',
        setDisplayName: jest.fn(),
        password: '',
        setPassword: jest.fn(),
        currentPassword: '',
        setCurrentPassword: jest.fn(),
        pickImage: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderScreen = () => render(<EditProfileScreen navigation={{ navigate: mockNavigate }} />);

    describe('【前端元素】', () => {
        it('基本資料欄位渲染', () => {
            useEditProfile.mockReturnValue({
                user: { email: 'test@example.com' },
                isGoogleUser: false,
                hasPasswordProvider: true,
                form: { ...mockForm, displayName: '測試用戶' },
                actions: {},
            });

            const { getByTestId } = renderScreen();

            const nameInput = getByTestId('input-顯示名稱');
            expect(nameInput.props.value).toBe('測試用戶');

            const emailInput = getByTestId('input-電子郵件');
            expect(emailInput.props.value).toBe('test@example.com');
            expect(emailInput.props.editable).toBe(false);
        });
    });

    describe('【介面邏輯】', () => {
        it('變更密碼前需輸入舊密碼', () => {
            useEditProfile.mockReturnValue({
                user: { email: 'test@example.com' },
                hasPasswordProvider: true,
                form: { ...mockForm, password: 'newpassword' }, // password length > 0
                actions: {},
            });

            const { getByTestId } = renderScreen();

            expect(getByTestId('input-請輸入目前的密碼 (驗證身分)')).toBeTruthy();
        });
    });

    describe('【使用者互動】', () => {
        it('綁定 Google 帳號', () => {
            useEditProfile.mockReturnValue({
                user: { email: 'test@example.com' },
                isGoogleUser: false,
                form: mockForm,
                actions: { handleLinkGoogle: mockHandleLinkGoogle, handleUnlinkGoogle: mockHandleUnlinkGoogle },
            });

            const { getByTestId } = renderScreen();
            fireEvent.press(getByTestId('switch-btn')); // Target Switch wrapper
            expect(mockHandleLinkGoogle).toHaveBeenCalled();
        });

        it('解除綁定 Google 帳號', () => {
            useEditProfile.mockReturnValue({
                user: { email: 'test@example.com' },
                isGoogleUser: true,
                form: mockForm,
                actions: { handleLinkGoogle: mockHandleLinkGoogle, handleUnlinkGoogle: mockHandleUnlinkGoogle },
            });

            const { getByTestId } = renderScreen();
            fireEvent.press(getByTestId('switch-btn')); // Target Switch wrapper
            expect(mockHandleUnlinkGoogle).toHaveBeenCalled();
        });
    });

    describe('【功能邏輯】', () => {
        it('點擊儲存變更', () => {
            useEditProfile.mockReturnValue({
                user: { email: 'test@example.com' },
                isGoogleUser: false,
                form: mockForm,
                actions: { handleSave: mockHandleSave },
            });

            const { getByTestId } = renderScreen();
            fireEvent.press(getByTestId('btn-儲存變更'));
            expect(mockHandleSave).toHaveBeenCalled();
        });
    });
});
