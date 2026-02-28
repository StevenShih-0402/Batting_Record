// tests/screens/HistoryDetailScreen.test.js
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
import HistoryDetailScreen from '../../src/screens/HistoryDetailScreen';
import { usePreferences } from '../../src/context/PreferencesContext';
import { useAlert } from '../../src/context/AlertContext';
import { deleteAtBatSummary, updateAtBatSummaryPitches } from '../../src/services/atBatSummaryService';

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ goBack: mockGoBack, navigate: mockNavigate }),
    useRoute: () => ({ params: {} })
}));

jest.mock('../src/context/PreferencesContext');
jest.mock('../src/context/AlertContext');
jest.mock('../src/services/atBatSummaryService', () => ({
    deleteAtBatSummary: jest.fn(),
    updateAtBatSummaryPitches: jest.fn()
}));

jest.mock('../src/components/common/PitchGrid', () => {
    const React = require('react');
    const { View } = require('react-native');
    return function MockPitchGrid({ onLayout }) {
        // trigger onLayout manually to simulate layout measurement
        React.useEffect(() => {
            if (onLayout) onLayout({ nativeEvent: { layout: { width: 300, height: 300 } } });
        }, []);
        return <View testID="pitch-grid" />;
    };
});

jest.mock('../src/components/PitchHistoryDots', () => {
    const { View, Text } = require('react-native');
    return function MockPitchHistoryDots() {
        return <View testID="pitch-history-dots" />;
    };
});


jest.mock('react-native-paper', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity, TextInput } = require('react-native');

    return {
        MD3DarkTheme: { colors: {} },
        useTheme: () => ({ colors: { primary: 'blue', background: 'white', surface: 'white', onSurfaceVariant: 'gray', onSurface: 'black', error: 'red' } }),
        Text: (props) => <Text {...props} testID={props.testID}>{props.children}</Text>,
        Button: (props) => <TouchableOpacity testID={`btn-${props.children}`} onPress={props.onPress}><Text>{props.children}</Text></TouchableOpacity>,
        IconButton: (props) => <TouchableOpacity testID={`icon-${props.icon}`} onPress={props.onPress} />,
        Divider: () => <View testID="divider" />,
        Surface: (props) => <View {...props} testID={props.testID || 'surface'}>{props.children}</View>
    };
});

describe('HistoryDetailScreen 測試', () => {

    const mockShowWarning = jest.fn();

    const mockRecord = {
        id: 'record-123',
        atBatLabel: '1 局上 第一棒',
        pitchRecords: [
            {
                id: 'pitch-1',
                result: '好球',
                speed: '140',
                pitchType: '直球',
                cellNumber: 4,
                customPitchValues: {
                    'custom-text': '不錯'
                }
            }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();

        usePreferences.mockReturnValue({
            customPitchFields: [
                { id: 'custom-text', label: '心情', type: 'text' }
            ]
        });

        useAlert.mockReturnValue({
            showWarning: mockShowWarning,
            showSuccess: jest.fn()
        });
    });

    const renderScreen = (params = { record: mockRecord }) => render(<HistoryDetailScreen route={{ params }} navigation={{ goBack: mockGoBack, navigate: mockNavigate }} />);

    describe('【前端元素】', () => {
        it('無資料時渲染', () => {
            const { getByText } = renderScreen({ record: null });
            expect(getByText('無資料')).toBeTruthy();
        });

        it('有資料時渲染九宮格與自訂欄位', async () => {
            const { getByText, getByTestId } = renderScreen();

            // Header
            expect(getByText('1 局上 第一棒')).toBeTruthy();

            // PitchGrid components
            expect(getByTestId('pitch-grid')).toBeTruthy();
            await waitFor(() => {
                expect(getByTestId('pitch-history-dots')).toBeTruthy();
            });

            // Pitch Row
            expect(getByText('投球詳細數據 (1)')).toBeTruthy();
            expect(getByText('好球')).toBeTruthy();
            expect(getByText('140 km/h')).toBeTruthy();
            expect(getByText('直球 (4 號位)')).toBeTruthy();
            expect(getByText('心情: 不錯')).toBeTruthy();
        });
    });

    describe('【互動邏輯與功能邏輯】', () => {
        it('點擊編輯單顆球', () => {
            const { getByTestId, getAllByTestId } = renderScreen();

            const editButtons = getAllByTestId('icon-pencil');
            fireEvent.press(editButtons[0]);

            expect(mockNavigate).toHaveBeenCalled();
            const navigateArgs = mockNavigate.mock.calls[0];
            expect(navigateArgs[0]).toBe('PitchEdit');
            expect(navigateArgs[1].record).toEqual(mockRecord.pitchRecords[0]);
        });

        it('單顆球的刪除觸發', async () => {
            const { getAllByTestId } = renderScreen();

            fireEvent.press(getAllByTestId('icon-pencil')[0]);

            const navigateArgs = mockNavigate.mock.calls[0];
            const onDeleteCallback = navigateArgs[1].onDelete;

            mockShowWarning.mockImplementation((title, msg, buttons) => {
                buttons[1].onPress();
            });

            onDeleteCallback();

            expect(mockShowWarning).toHaveBeenCalled();

            await waitFor(() => {
                expect(updateAtBatSummaryPitches).toHaveBeenCalledWith('record-123', []);
            });
        });

        it('刪除整筆打席紀錄', async () => {
            const { getByTestId } = renderScreen();

            mockShowWarning.mockImplementation((title, msg, buttons) => {
                buttons[1].onPress();
            });

            fireEvent.press(getByTestId('btn-刪除此打席紀錄'));

            expect(mockShowWarning).toHaveBeenCalled();

            await waitFor(() => {
                expect(deleteAtBatSummary).toHaveBeenCalledWith('record-123');
                expect(mockGoBack).toHaveBeenCalled();
            });
        });

        it('從 PitchEdit 回傳 onSave 並更新畫面', async () => {
            const { getAllByTestId, getByText } = renderScreen();

            fireEvent.press(getAllByTestId('icon-pencil')[0]);

            const navigateArgs = mockNavigate.mock.calls[0];
            const onSaveCallback = navigateArgs[1].onSave;

            await onSaveCallback({ speed: '150', pitchType: '滑球' });

            expect(updateAtBatSummaryPitches).toHaveBeenCalled();

            // 驗證本地更新 (因為 re-render)
            await waitFor(() => {
                expect(getByText('150 km/h')).toBeTruthy();
                expect(getByText('滑球 (4 號位)')).toBeTruthy();
            });
        });
    });
});
