// tests/screens/HistoryScreen.test.js
// Mock Firebase and services
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
    getApps: jest.fn(() => [{}]),
    getApp: jest.fn(),
}));
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

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import HistoryScreen from '../../src/screens/HistoryScreen';
import { useHistoryData } from '../../src/hooks/api/useHistoryData';
import { useHistoryFilter } from '../../src/hooks/ui/useHistoryFilter';
import { useAuth } from '../../src/hooks/auth/useAuth';
import { usePreferences } from '../../src/context/PreferencesContext';

jest.mock('../src/hooks/api/useHistoryData');
jest.mock('../src/hooks/ui/useHistoryFilter');
jest.mock('../src/hooks/auth/useAuth');
jest.mock('../src/context/PreferencesContext');
jest.mock('../src/services/atBatSummaryService', () => ({
    deleteAtBatSummary: jest.fn(),
    updateAtBatSummaryPitches: jest.fn(),
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    return {
        MD3DarkTheme: { colors: {} },
        useTheme: () => ({ colors: { surface: 'white', primary: 'blue', background: 'white', onSurface: 'black', surfaceVariant: 'grey', onSurfaceVariant: 'grey', primaryContainer: 'blue', onPrimaryContainer: 'white', onPrimary: 'white' } }),
        Text: ({ children, style }) => <Text style={style}>{children}</Text>,
        Card: ({ children, onPress, style }) => <TouchableOpacity onPress={onPress} testID="mock-card">{children}</TouchableOpacity>,
        List: {
            Item: ({ title, description }) => (
                <View>
                    <Text testID="list-item-title">{title}</Text>
                    <Text testID="list-item-description">{description}</Text>
                </View>
            ),
            Icon: () => <View testID="list-icon" />,
        },
        ActivityIndicator: (props) => <View {...props} testID="loading-indicator" />,
        Badge: (props) => <View {...props} testID="badge" />,
    };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock icons
jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return { Feather: ({ name }) => <Text testID={`icon-${name}`}>{name}</Text> };
});
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    // eslint-disable-next-line react/display-name
    return ({ name }) => <Text testID={`mci-icon-${name}`}>{name}</Text>;
});

const mockNavigate = jest.fn();

describe('HistoryScreen 測試', () => {
    let mockNavigation;

    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate.mockClear();
        mockNavigation = { navigate: mockNavigate };

        useAuth.mockReturnValue({
            user: { isAnonymous: false }
        });
        usePreferences.mockReturnValue({
            customSummaryFields: [{ id: 'custom1', label: '自訂欄位' }]
        });
        useHistoryData.mockReturnValue({
            loading: false,
            history: []
        });
        useHistoryFilter.mockReturnValue({
            filters: {},
            isFilterActive: false,
            filteredHistory: [],
            applyFilters: jest.fn(),
            clearFilters: jest.fn()
        });
    });

    describe('【畫面渲染】', () => {
        it('無資料狀態顯示', () => {
            const { getByText } = render(<HistoryScreen navigation={mockNavigation} />);
            expect(getByText('尚無歷史紀錄')).toBeTruthy();
        });

        it('歷史紀錄列表呈現與自訂欄位', () => {
            useHistoryFilter.mockReturnValue({
                filters: {},
                isFilterActive: false,
                filteredHistory: [{
                    id: '1',
                    date: '2026-02-28',
                    totalPitches: 5,
                    summaryNote: '備註測試',
                    atBatLabel: '打擊練習',
                    customSummaryValues: { custom1: '測試內容' }
                }],
                applyFilters: jest.fn(),
                clearFilters: jest.fn()
            });

            const { getByTestId } = render(<HistoryScreen navigation={mockNavigation} />);

            expect(getByTestId('list-item-title').props.children).toBe('打擊練習');

            const desc = getByTestId('list-item-description').props.children;
            expect(desc).toContain('日期：2026-02-28');
            expect(desc).toContain('球數：5 球');
            expect(desc).toContain('備註測試');
            expect(desc).toContain('自訂欄位: 測試內容');
        });
    });

    describe('【使用者互動】', () => {
        it('點擊卡片跳轉詳情頁', () => {
            const mockItem = { id: '1', atBatLabel: '打擊練習' };
            useHistoryFilter.mockReturnValue({
                filters: {},
                isFilterActive: false,
                filteredHistory: [mockItem],
                applyFilters: jest.fn(),
                clearFilters: jest.fn()
            });

            const { getByTestId } = render(<HistoryScreen navigation={mockNavigation} />);
            fireEvent.press(getByTestId('mock-card'));

            expect(mockNavigate).toHaveBeenCalledWith('HistoryDetail', { record: mockItem });
        });
    });

    describe('【前端元素】', () => {
        it('篩選按鈕狀態變化', () => {
            useHistoryFilter.mockReturnValue({
                filters: {},
                isFilterActive: true,
                filteredHistory: [],
                applyFilters: jest.fn(),
                clearFilters: jest.fn()
            });

            const { getByTestId } = render(<HistoryScreen navigation={mockNavigation} />);

            expect(getByTestId('badge')).toBeTruthy();
            expect(getByTestId('mci-icon-filter-check')).toBeTruthy();
        });
    });
});
