// tests/screens/HistoryFilterScreen.test.js
// Mock Firebase early to avoid ES module syntax issues
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
jest.mock('../../src/services/firebaseService', () => ({
    auth: { currentUser: { uid: 'test-uid' } },
    db: {}
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HistoryFilterScreen from '../../src/screens/HistoryFilterScreen';
import { usePreferences } from '../../src/context/PreferencesContext';

const mockGoBack = jest.fn();
const mockOnApply = jest.fn();
const mockOnClear = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ goBack: mockGoBack }),
    useRoute: () => ({ params: {} })
}));

jest.mock('../../src/context/PreferencesContext');

jest.mock('react-native-paper', () => {
    const React = require('react');
    const { Text, TouchableOpacity, TextInput } = require('react-native');

    // eslint-disable-next-line react/display-name
    const MockTextInput = (props) => <TextInput {...props} testID={`input-${props.label}`} value={props.value} onChangeText={props.onChangeText} />;

    return {
        MD3DarkTheme: { colors: {} },
        useTheme: () => ({ colors: { primary: 'blue', background: 'white', surface: 'white', onSurfaceVariant: 'gray', onSurface: 'black', error: 'red' } }),
        Text: (props) => <Text {...props}>{props.children}</Text>,
        TextInput: MockTextInput,
        Button: (props) => <TouchableOpacity testID={`btn-${props.children}`} onPress={props.onPress}><Text>{props.children}</Text></TouchableOpacity>
    };
});

describe('HistoryFilterScreen 測試', () => {

    const initialRouteProps = {
        params: {
            onApply: mockOnApply,
            onClear: mockOnClear,
            initialFilters: {
                title: '測試打席',
                startDate: '2026-01-01',
                endDate: '',
                minPitches: '',
                maxPitches: '',
                note: '',
                customFields: {}
            }
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();

        usePreferences.mockReturnValue({
            customSummaryFields: [
                { id: 'summary-weather', label: '天氣', type: 'text' }
            ]
        });
    });

    const renderScreen = () => render(<HistoryFilterScreen route={initialRouteProps} navigation={{ goBack: mockGoBack }} />);

    describe('【前端元素】', () => {
        it('渲染篩選器畫面', () => {
            const { getByText, getByTestId } = renderScreen();

            expect(getByText('篩選紀錄')).toBeTruthy();
            expect(getByTestId('input-標題')).toBeTruthy();
            expect(getByTestId('btn-開始日期')).toBeTruthy();
            expect(getByTestId('btn-結束日期')).toBeTruthy();
            expect(getByTestId('input-最少球數')).toBeTruthy();
            expect(getByTestId('input-最多球數')).toBeTruthy();
            expect(getByTestId('input-備註')).toBeTruthy();

            // Buttons
            expect(getByTestId('btn-清除')).toBeTruthy();
            expect(getByTestId('btn-套用')).toBeTruthy();

            // Checking initial value applied
            expect(getByTestId('input-標題').props.value).toBe('測試打席');
            // The value is displayed inside TextInput managed by the hook
            expect(getByTestId('input-開始日期').props.value).toBe('2026-01-01');
        });
    });

    describe('【互動邏輯】', () => {
        it('渲染並編輯自訂欄位篩選', () => {
            const { getByTestId } = renderScreen();

            // The label is "${field.label}" since the previous change.
            const weatherInput = getByTestId('input-天氣');
            expect(weatherInput).toBeTruthy();

            fireEvent.changeText(weatherInput, '晴天');
            expect(weatherInput.props.value).toBe('晴天');
        });

        it('輸入球數 (日期已改由 DatePicker，在此不測 Input Typing)', () => {
            const { getByTestId } = renderScreen();

            fireEvent.changeText(getByTestId('input-最少球數'), '3');
            fireEvent.changeText(getByTestId('input-最多球數'), '5');

            expect(getByTestId('input-最少球數').props.value).toBe('3');
            expect(getByTestId('input-最多球數').props.value).toBe('5');
        });
    });

    describe('【功能邏輯】', () => {
        it('點擊套用篩選', () => {
            const { getByTestId } = renderScreen();

            // Modify some inputs
            fireEvent.changeText(getByTestId('input-標題'), '新的測試打席');

            fireEvent.press(getByTestId('btn-套用'));

            expect(mockOnApply).toHaveBeenCalledWith({
                title: '新的測試打席',
                startDate: '2026-01-01', // from initial
                endDate: '',
                minPitches: '',
                maxPitches: '',
                note: '',
                customFields: {}
            });
            expect(mockGoBack).toHaveBeenCalled();
        });

        it('點擊清除篩選', () => {
            const { getByTestId } = renderScreen();

            fireEvent.press(getByTestId('btn-清除'));

            expect(mockOnClear).toHaveBeenCalled();
            expect(mockGoBack).toHaveBeenCalled();
        });
    });
});
