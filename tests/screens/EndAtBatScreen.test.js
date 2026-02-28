// tests/screens/EndAtBatScreen.test.js
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
import EndAtBatScreen from '../../src/screens/EndAtBatScreen';
import { usePreferences } from '../../src/context/PreferencesContext';
import { useEndAtBat } from '../../src/hooks/ui/useEndAtBat';
import { getFieldQueue, pushToFieldQueue } from '../../src/hooks/ui/useCustomFieldQueue';

const mockGoBack = jest.fn();
const mockOnSave = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ goBack: mockGoBack }),
    useRoute: () => ({
        params: {}
    })
}));

jest.mock('../src/context/PreferencesContext');
jest.mock('../src/hooks/ui/useEndAtBat');
jest.mock('../src/hooks/ui/useCustomFieldQueue', () => ({
    getFieldQueue: jest.fn(),
    pushToFieldQueue: jest.fn()
}));

jest.mock('react-native-paper', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity, TextInput } = require('react-native');

    // eslint-disable-next-line react/display-name
    const MockTextInput = (props) => <TextInput {...props} testID={`input-${props.label}`} value={props.value} onChangeText={props.onChangeText} />;

    return {
        MD3DarkTheme: { colors: {} },
        useTheme: () => ({ colors: { primary: 'blue', background: 'white', surface: 'white', onSurfaceVariant: 'gray', onSurface: 'black', error: 'red' } }),
        Text: (props) => <Text {...props}>{props.children}</Text>,
        TextInput: MockTextInput,
        Button: (props) => <TouchableOpacity testID={`btn-${props.children}`} onPress={props.onPress}><Text>{props.children}</Text></TouchableOpacity>,
        IconButton: (props) => <TouchableOpacity testID={`icon-${props.icon}`} onPress={props.onPress} />,
        Chip: (props) => <TouchableOpacity testID={`chip-${props.children}`} onPress={props.onPress}><Text>{props.children}</Text></TouchableOpacity>
    };
});

jest.mock('../src/components/forms/NoteInput', () => {
    const { TextInput } = require('react-native');
    return function MockNoteInput(props) {
        return <TextInput testID={`noteinput-${props.label}`} value={props.value} onChangeText={props.onChangeText} />
    }
});

jest.mock('../src/components/forms/SelectionDropdown', () => {
    const { View, Text, TouchableOpacity } = require('react-native');
    return function MockSelectionDropdown(props) {
        return (
            <View testID={`dropdown-${props.label}`}>
                <Text>{props.label}</Text>
            </View>
        );
    }
});

describe('EndAtBatScreen 測試', () => {
    const mockHandleSave = jest.fn();
    const mockSetAtBatTitle = jest.fn();
    const mockSetSummaryNote = jest.fn();
    const mockSetSummaryCustomValue = jest.fn();

    const mockAtBatRecords = [
        { runningStrikes: 2, runningBalls: 3 } // simulate a full count
    ];

    let baseEndAtBatMock;

    beforeEach(() => {
        jest.clearAllMocks();

        usePreferences.mockReturnValue({});

        baseEndAtBatMock = {
            atBatTitle: '預設標題',
            setAtBatTitle: mockSetAtBatTitle,
            summaryNote: '預設備註',
            setSummaryNote: mockSetSummaryNote,
            isSaving: false,
            handleSave: mockHandleSave,
            customSummaryFields: [
                { id: 'summary-text', label: '天氣', type: 'text' },
                { id: 'summary-dropdown', label: '對手', type: 'dropdown', options: ['A隊', 'B隊'] }
            ],
            summaryCustomValues: {
                'summary-text': '晴天'
            },
            setSummaryCustomValue: mockSetSummaryCustomValue
        };

        useEndAtBat.mockReturnValue(baseEndAtBatMock);

        getFieldQueue.mockImplementation(async (fieldId) => {
            if (fieldId === 'summary-text') return ['晴天', '雨天'];
            return [];
        });
    });

    const renderScreen = () => {
        const route = {
            params: {
                onSave: mockOnSave,
                atBatRecords: mockAtBatRecords
            }
        };
        return render(<EndAtBatScreen route={route} navigation={{ goBack: mockGoBack }} />);
    };

    describe('【前端元素】', () => {
        it('渲染儲存打席紀錄 Modal', async () => {
            const { getByText, getByTestId } = renderScreen();

            expect(getByText('儲存打席紀錄')).toBeTruthy();
            expect(getByText('2 好 3 壞')).toBeTruthy(); // from mockAtBatRecords

            expect(getByTestId('input-標題')).toBeTruthy();
            expect(getByTestId('noteinput-總結備註')).toBeTruthy();
            expect(getByTestId('input-天氣')).toBeTruthy();
            expect(getByTestId('dropdown-對手')).toBeTruthy();

            expect(getByTestId('btn-儲存並清空')).toBeTruthy();
        });
    });

    describe('【互動邏輯】', () => {
        it('帶入 Queue 選項並點擊快選', async () => {
            const { getByTestId, findByTestId } = renderScreen();

            // Queue options should be loaded
            const chip1 = await findByTestId('chip-晴天');
            const chip2 = await findByTestId('chip-雨天');

            expect(chip1).toBeTruthy();
            expect(chip2).toBeTruthy();

            fireEvent.press(chip2);

            expect(mockSetSummaryCustomValue).toHaveBeenCalledWith('summary-text', '雨天');
        });
    });

    describe('【功能邏輯】', () => {
        it('點擊儲存並清空', async () => {
            // Need to simulate successful save callback via the mock parameter
            mockHandleSave.mockImplementation(async () => {
                const onSuccess = useEndAtBat.mock.calls[0][2];
                await onSuccess({ title: '新標題' });
            });

            const { getByTestId } = renderScreen();

            fireEvent.press(getByTestId('btn-儲存並清空'));

            await waitFor(() => {
                expect(pushToFieldQueue).toHaveBeenCalledWith('summary-text', '晴天'); // from customSummaryValues mock
                expect(mockHandleSave).toHaveBeenCalled();
                expect(mockOnSave).toHaveBeenCalled();
                expect(mockGoBack).toHaveBeenCalled();
            });
        });
    });
});
