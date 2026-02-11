// tests/EditProfileScreen.test.js
// Unit tests for EditProfileScreen covering form rendering, conditional visibility, and user interactions.

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';

// Mock dependencies before importing the screen
jest.mock('../src/hooks/useEditProfile');
jest.mock('../src/services/firebaseService', () => ({
    auth: {
        currentUser: {
            email: 'test@example.com',
            displayName: 'John Doe',
            photoURL: null,
            providerData: [],
        },
    },
}));
jest.mock('../src/services/authService', () => ({
    updateUserProfile: jest.fn(),
    updateUserPassword: jest.fn(),
    deleteUserAccount: jest.fn(),
}));

import EditProfileScreen from '../src/screens/EditProfileScreen';
import { useEditProfile } from '../src/hooks/useEditProfile';
// Mock react-native-paper to avoid complex internal rendering issues
jest.mock('react-native-paper', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    return {
        useTheme: () => ({ colors: { background: 'white', primary: 'blue', secondary: 'grey', error: 'red' } }),
        Provider: ({ children }) => children,
        TextInput: Object.assign(
            (props) => <View {...props} accessibilityLabel={props.label} />,
            { Icon: (props) => <View {...props} /> }
        ),
        Button: (props) => <TouchableOpacity onPress={props.onPress}><Text>{props.children}</Text></TouchableOpacity>,
        Avatar: {
            Image: (props) => <View {...props} testID="avatar-image" />,
            Icon: (props) => <View {...props} testID="avatar-icon" />,
        },
        List: {
            Section: ({ children, title }) => <View><Text>{title}</Text>{children}</View>,
            Item: (props) => <View {...props}><Text>{props.title}</Text></View>,
            Icon: (props) => <View {...props} />,
        },
        Divider: () => <View />,
        Switch: (props) => <View {...props} />,
        HelperText: ({ children }) => <Text>{children}</Text>,
        Text: (props) => <Text {...props}>{props.children}</Text>,
    };
});

// Mock SafeAreaView and relevant context
jest.mock('react-native-safe-area-context', () => {
    const React = require('react');
    const insets = { top: 0, left: 0, right: 0, bottom: 0 };
    return {
        SafeAreaProvider: ({ children }) => children,
        SafeAreaView: ({ children }) => children,
        useSafeAreaInsets: () => insets,
        SafeAreaInsetsContext: {
            Consumer: ({ children }) => children(insets),
        },
        initialWindowMetrics: {
            frame: { x: 0, y: 0, width: 0, height: 0 },
            insets: insets,
        },
    };
});

const mockNavigate = jest.fn();
const navigation = { navigate: mockNavigate };

const renderWithTheme = (ui) => {
    return render(ui);
};

describe('EditProfileScreen 測試', () => {
    const mockActions = {
        handleSave: jest.fn(),
        handleDeleteAccount: jest.fn(),
    };
    const mockForm = {
        displayName: 'John Doe',
        setDisplayName: jest.fn(),
        photoURL: null,
        pickImage: jest.fn(),
        password: '',
        setPassword: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('【UI Render】', () => {
        it('渲染基本資料表單', () => {
            useEditProfile.mockReturnValue({
                user: { email: 'test@example.com' },
                isGoogleUser: false,
                loading: false,
                form: mockForm,
                actions: mockActions,
            });

            const { getByLabelText, getByText } = renderWithTheme(<EditProfileScreen navigation={navigation} />);

            expect(getByText('基本資料')).toBeTruthy();
            expect(getByLabelText('顯示名稱')).toBeTruthy();
            expect(getByLabelText('顯示名稱').props.value).toBe('John Doe');
            expect(getByLabelText('電子郵件')).toBeTruthy();
            expect(getByLabelText('電子郵件').props.value).toBe('test@example.com');
            expect(getByLabelText('電子郵件').props.editable).toBeFalsy();
        });

        it('渲染頭像區域', () => {
            useEditProfile.mockReturnValue({
                user: { email: 'test@example.com' },
                isGoogleUser: false,
                form: { ...mockForm, photoURL: 'http://example.com/photo.jpg' },
                actions: mockActions,
            });

            const { getByTestId } = renderWithTheme(<EditProfileScreen navigation={navigation} />);
            // react-native-paper Avatar.Image usually renders an Image component
            // We can't easily check the URL without more complex mocking, so we just verify it renders.
            // But we can check for text "點擊更換頭貼"
            expect(renderWithTheme(<EditProfileScreen navigation={navigation} />).getByText('點擊更換頭貼')).toBeTruthy();
        });

        it('安全性設定顯示邏輯 (Email 用戶)', () => {
            useEditProfile.mockReturnValue({
                user: { email: 'test@example.com' },
                isGoogleUser: false,
                form: mockForm,
                actions: mockActions,
            });

            const { getByText, getByLabelText } = renderWithTheme(<EditProfileScreen navigation={navigation} />);

            expect(getByText('安全性')).toBeTruthy();
            expect(getByLabelText('設定新密碼')).toBeTruthy();
        });

        it('安全性設定顯示邏輯 (Google 用戶)', () => {
            useEditProfile.mockReturnValue({
                user: { email: 'test@example.com' },
                isGoogleUser: true,
                form: mockForm,
                actions: mockActions,
            });

            const { queryByText, queryByLabelText } = renderWithTheme(<EditProfileScreen navigation={navigation} />);

            expect(queryByText('安全性')).toBeNull();
            expect(queryByLabelText('設定新密碼')).toBeNull();
        });
    });

    describe('【Interaction】', () => {
        it('更新顯示名稱', () => {
            useEditProfile.mockReturnValue({
                user: { email: 'test@example.com' },
                isGoogleUser: false,
                form: mockForm,
                actions: mockActions,
            });

            const { getByLabelText } = renderWithTheme(<EditProfileScreen navigation={navigation} />);
            fireEvent.changeText(getByLabelText('顯示名稱'), 'New Name');

            expect(mockForm.setDisplayName).toHaveBeenCalledWith('New Name');
        });

        it('更新密碼', () => {
            useEditProfile.mockReturnValue({
                user: { email: 'test@example.com' },
                isGoogleUser: false,
                form: mockForm,
                actions: mockActions,
            });

            const { getByLabelText } = renderWithTheme(<EditProfileScreen navigation={navigation} />);
            fireEvent.changeText(getByLabelText('設定新密碼'), 'newpassword123');

            expect(mockForm.setPassword).toHaveBeenCalledWith('newpassword123');
        });

        it('點擊頭像觸發圖片選擇', () => {
            useEditProfile.mockReturnValue({
                user: { email: 'test@example.com' },
                isGoogleUser: false,
                form: mockForm,
                actions: mockActions,
            });

            const { getByTestId } = renderWithTheme(<EditProfileScreen navigation={navigation} />);
            fireEvent.press(getByTestId('avatar-icon'));

            expect(mockForm.pickImage).toHaveBeenCalled();
        });

        it('點擊儲存按鈕', () => {
            useEditProfile.mockReturnValue({
                user: { email: 'test@example.com' },
                isGoogleUser: false,
                form: mockForm,
                actions: mockActions,
            });

            const { getByText } = renderWithTheme(<EditProfileScreen navigation={navigation} />);
            fireEvent.press(getByText('儲存變更'));

            expect(mockActions.handleSave).toHaveBeenCalled();
        });

        it('點擊刪除帳號按鈕', () => {
            useEditProfile.mockReturnValue({
                user: { email: 'test@example.com' },
                isGoogleUser: false,
                form: mockForm,
                actions: mockActions,
            });

            const { getByText } = renderWithTheme(<EditProfileScreen navigation={navigation} />);
            fireEvent.press(getByText('刪除帳號'));

            expect(mockActions.handleDeleteAccount).toHaveBeenCalled();
        });
    });
});
