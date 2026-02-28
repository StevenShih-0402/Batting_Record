// tests/screens/BattingListScreen.test.js
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
jest.mock('../src/services/firebaseService', () => ({
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
import BattingListScreen from '../../src/screens/BattingListScreen';
import useAtBatRecords from '../../src/hooks/useAtBatRecords';
import { usePreferences } from '../../src/context/PreferencesContext';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate })
}));

jest.mock('../src/hooks/useAtBatRecords');
jest.mock('../src/context/PreferencesContext');

jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
        Feather: (props) => <Text testID={`icon-${props.name}`} />
    };
});

jest.mock('react-native-paper', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    return {
        MD3DarkTheme: { colors: {} },
        useTheme: () => ({ colors: { primary: 'blue', background: 'white', surface: 'white', outline: 'gray', onSurfaceVariant: 'gray', onSurface: 'black', surfaceVariant: 'lightgray', error: 'red' } }),
        Text: (props) => <Text {...props}>{props.children}</Text>,
        Button: (props) => <TouchableOpacity testID={`btn-${props.children}`} onPress={props.onPress} disabled={props.disabled}><Text>{props.children}</Text></TouchableOpacity>,
        ActivityIndicator: () => <View testID="activity-indicator" />,
        TouchableRipple: (props) => <TouchableOpacity testID={props.testID || 'list-item'} onPress={props.onPress}>{props.children}</TouchableOpacity>
    };
});

describe('BattingListScreen 測試', () => {

    const mockUpdatePitch = jest.fn();
    const mockDeletePitch = jest.fn();
    const mockSaveSummary = jest.fn();

    const mockRecords = [
        {
            id: 'record-1',
            result: '好球',
            pitchType: '直球',
            speed: 140,
            note: '測試備註',
            runningBalls: 0,
            runningStrikes: 1,
            customPitchValues: {
                'custom-1': '自訂值'
            }
        },
        {
            id: 'record-2',
            result: '壞球',
            atBatEndOutcome: '保送',
            runningBalls: 4,
            runningStrikes: 3
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        usePreferences.mockReturnValue({
            customPitchFields: [
                { id: 'custom-1', label: '心情' }
            ]
        });
    });

    const renderScreen = () => render(<BattingListScreen navigation={{ navigate: mockNavigate }} />);

    describe('【前端元素】', () => {
        it('渲染空狀態', () => {
            useAtBatRecords.mockReturnValue({
                loading: false,
                atBatRecords: [],
                atBatStatus: {},
                handleUpdatePitch: mockUpdatePitch,
                handleDeletePitch: mockDeletePitch,
                handleSaveSummary: mockSaveSummary
            });

            const { getByText } = renderScreen();
            expect(getByText('尚無打席紀錄。')).toBeTruthy();
        });

        it('渲染逐球紀錄列表', () => {
            useAtBatRecords.mockReturnValue({
                loading: false,
                atBatRecords: mockRecords,
                atBatStatus: {},
                handleUpdatePitch: mockUpdatePitch,
                handleDeletePitch: mockDeletePitch,
                handleSaveSummary: mockSaveSummary
            });

            const { getByText, getAllByTestId } = renderScreen();

            // Checking if Save Button is enabled
            expect(getByText('儲存紀錄 (彙整)')).toBeTruthy();

            // First item checks
            expect(getByText('好球')).toBeTruthy();
            expect(getByText(/直球/)).toBeTruthy();
            expect(getByText(/140.0 km\/h/)).toBeTruthy();
            expect(getByText(/備註: 測試備註/)).toBeTruthy();
            expect(getByText(/心情: 自訂值/)).toBeTruthy();
            expect(getByText('0-1')).toBeTruthy();

            // Second item checks
            expect(getByText('保送')).toBeTruthy();
            expect(getByText('END')).toBeTruthy();

            // Checking list items count
            const items = getAllByTestId('list-item');
            expect(items.length).toBe(2);
        });
    });

    describe('【互動邏輯與功能邏輯】', () => {
        beforeEach(() => {
            useAtBatRecords.mockReturnValue({
                loading: false,
                atBatRecords: mockRecords,
                atBatStatus: {},
                handleUpdatePitch: mockUpdatePitch,
                handleDeletePitch: mockDeletePitch,
                handleSaveSummary: mockSaveSummary
            });
        });

        it('點擊單一項目進行編輯', async () => {
            const { getAllByTestId } = renderScreen();

            const items = getAllByTestId('list-item');
            fireEvent.press(items[0]);

            expect(mockNavigate).toHaveBeenCalled();
            const args = mockNavigate.mock.calls[0];
            expect(args[0]).toBe('PitchEdit');
            expect(args[1].record).toEqual(mockRecords[0]);

            // Test callbacks
            const { onSave, onDelete } = args[1];
            await onSave({ speed: 150 });
            expect(mockUpdatePitch).toHaveBeenCalledWith('record-1', { speed: 150 });

            await onDelete();
            expect(mockDeletePitch).toHaveBeenCalledWith('record-1');
        });

        it('點擊儲存紀錄', async () => {
            const { getByTestId } = renderScreen();

            fireEvent.press(getByTestId('btn-儲存紀錄 (彙整)'));

            expect(mockNavigate).toHaveBeenCalled();
            const args = mockNavigate.mock.calls[0];
            expect(args[0]).toBe('EndAtBat');
            expect(args[1].atBatRecords).toEqual(mockRecords);

            // Test callback
            const { onSave } = args[1];
            await onSave({ title: 'test summary' });
            expect(mockSaveSummary).toHaveBeenCalledWith({ title: 'test summary' });
        });
    });
});
