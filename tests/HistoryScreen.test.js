// Mock Firebase and services TRANSITIVELY imported
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
    getApps: jest.fn(() => [{}]),
    getApp: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
        onAuthStateChanged: jest.fn((callback) => {
            return jest.fn(); // mock unsubscribe function
        })
    })),
    onAuthStateChanged: jest.fn(() => jest.fn()),
    signInAnonymously: jest.fn(),
    initializeAuth: jest.fn(),
    getReactNativePersistence: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
}));
jest.mock('../src/services/firebaseService', () => ({
    auth: { currentUser: { uid: 'test-uid' } },
    db: {}
}));

// Mock Target Hooks and Services
jest.mock('../src/hooks/api/useHistoryData');
jest.mock('../src/hooks/ui/useHistoryFilter', () => ({
    useHistoryFilter: jest.fn(),
}));
jest.mock('../src/services/atBatSummaryService', () => ({
    deleteAtBatSummary: jest.fn(),
    updateAtBatSummaryPitches: jest.fn(),
}));

jest.mock('../src/context/PreferencesContext', () => ({
    usePreferences: jest.fn(() => ({
        customSummaryFields: []
    })),
    PreferencesProvider: ({ children }) => children,
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import HistoryScreen from '../src/screens/HistoryScreen';
import { useHistoryData } from '../src/hooks/api/useHistoryData';
import { useHistoryFilter } from '../src/hooks/ui/useHistoryFilter';
import { deleteAtBatSummary, updateAtBatSummaryPitches } from '../src/services/atBatSummaryService';

// Mock react-native-paper
jest.mock('react-native-paper', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    return {
        useTheme: () => ({
            colors: {
                surface: 'white',
                primary: 'blue',
                background: 'white',
                onSurface: 'black',
                surfaceVariant: 'grey',
                onSurfaceVariant: 'grey',
            }
        }),
        Text: ({ children, style }) => <Text style={style}>{children}</Text>,
        Card: ({ children, onPress, style }) => (
            <TouchableOpacity onPress={onPress} style={style} testID="mock-card">
                {children}
            </TouchableOpacity>
        ),
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
        IconButton: (props) => <TouchableOpacity onPress={props.onPress} testID="icon-button" />,
        Badge: (props) => <View {...props} testID="badge" />,
    };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        SafeAreaView: ({ children }) => <View>{children}</View>,
        useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    };
});

// Mock icons
jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        Feather: ({ name }) => <View testID={`icon-${name}`} />,
    };
});

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
    const React = require('react');
    const { View } = require('react-native');
    return ({ name }) => <View testID={`mci-icon-${name}`} />;
});

// Mock HistoryDetailScreen
jest.mock('../src/screens/HistoryDetailScreen', () => {
    const React = require('react');
    const { View, Button } = require('react-native');
    return (props) => (
        <View testID="history-modal">
            {props.visible && (
                <View>
                    <Button title="Delete" onPress={() => props.onDeleteAtBat('doc123')} />
                    <Button title="Update" onPress={() => props.onUpdatePitches('doc456', [])} />
                    <Button title="Close" onPress={props.onClose} />
                </View>
            )}
        </View>
    );
});

const mockNavigate = jest.fn();

describe('HistoryScreen 測試', () => {
    let mockNavigation;

    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate.mockClear();
        mockNavigation = { navigate: mockNavigate };

        useHistoryFilter.mockImplementation((history) => ({
            filters: {},
            isFilterActive: false,
            filteredHistory: history,
            applyFilters: jest.fn(),
            clearFilters: jest.fn()
        }));
    });

    describe('【UI Render】', () => {
        it('渲染打席歷史紀錄畫面 (載入中)', () => {
            useHistoryData.mockReturnValue({
                loading: true,
                history: [],
            });

            const { getByTestId } = render(<HistoryScreen navigation={mockNavigation} />);
            expect(getByTestId('loading-indicator')).toBeTruthy();
        });

        it('渲染打席歷史紀錄畫面 (無資料)', () => {
            useHistoryData.mockReturnValue({
                loading: false,
                history: [],
            });

            const { getByText } = render(<HistoryScreen navigation={mockNavigation} />);
            expect(getByText(/打席歷史紀錄/)).toBeTruthy();
            expect(getByText('尚無歷史紀錄')).toBeTruthy();
        });

        it('渲染打席歷史紀錄列表 (有資料)', () => {
            useHistoryData.mockReturnValue({
                loading: false,
                history: [{
                    id: '1',
                    atBatLabel: '打席 1',
                    date: '2026-01-28',
                    totalPitches: 5,
                    summaryNote: '測試'
                }],
            });

            const { getByText, getByTestId } = render(<HistoryScreen navigation={mockNavigation} />);
            expect(getByText('打席 1')).toBeTruthy();
            expect(getByTestId('list-item-description')).toBeTruthy();
            expect(getByTestId('list-item-description').props.children).toContain('2026-01-28');
            expect(getByTestId('list-item-description').props.children).toContain('5 球');
            expect(getByTestId('list-item-description').props.children).toContain('測試');
        });

        it('打席標籤退回機制', () => {
            useHistoryData.mockReturnValue({
                loading: false,
                history: [{
                    id: '2',
                    atBatLabel: '',
                    finalOutcome: '三振',
                    date: '2026-01-28',
                    totalPitches: 3,
                    summaryNote: ''
                }],
            });

            const { getByText } = render(<HistoryScreen navigation={mockNavigation} />);
            expect(getByText('打席結果：三振')).toBeTruthy();
        });
    });

    describe('【Interaction】', () => {
        it('點擊打席紀錄卡片會導航至 HistoryDetail', () => {
            const mockItem = { id: '1', atBatLabel: '打擊' };
            useHistoryData.mockReturnValue({
                loading: false,
                history: [mockItem],
            });

            const { getByTestId, getByText } = render(<HistoryScreen navigation={mockNavigation} />);

            // Click card
            fireEvent.press(getByTestId('mock-card'));

            expect(mockNavigate).toHaveBeenCalledWith('HistoryDetail', { record: mockItem });
        });

    });
});
