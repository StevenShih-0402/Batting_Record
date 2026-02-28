// tests/screens/PitchEditScreen.test.js
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
import PitchEditScreen from '../../src/screens/PitchEditScreen';
import { usePitchEdit } from '../../src/hooks/ui/usePitchEdit';
import { usePreferences } from '../../src/context/PreferencesContext';

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ goBack: mockGoBack }),
    useRoute: () => ({
        params: {}
    })
}));

jest.mock('../src/hooks/ui/usePitchEdit');
jest.mock('../src/context/PreferencesContext');

jest.mock('react-native-paper', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity, TextInput } = require('react-native');

    // eslint-disable-next-line react/display-name
    const MockTextInput = (props) => <TextInput {...props} testID={`input-${props.label}`} value={props.value} onChangeText={props.onChangeText} />;

    return {
        MD3DarkTheme: { colors: {} },
        useTheme: () => ({ colors: { primary: 'blue', background: 'white', surface: 'white', onSurfaceVariant: 'gray', secondary: 'gray', onSecondary: 'white', error: 'red' } }),
        Text: (props) => <Text {...props}>{props.children}</Text>,
        TextInput: MockTextInput,
        Button: (props) => <TouchableOpacity testID={`btn-${props.children}`} onPress={props.onPress}><Text>{props.children}</Text></TouchableOpacity>,
        Chip: (props) => <TouchableOpacity testID={`chip-${props.children}`} onPress={props.onPress}><Text>{props.children}</Text></TouchableOpacity>,
        IconButton: (props) => <TouchableOpacity testID={`icon-${props.icon}`} onPress={props.onPress} />
    };
});

jest.mock('../src/components/forms/SelectionDropdown', () => {
    const { View, Text, TouchableOpacity } = require('react-native');
    return function MockSelectionDropdown(props) {
        return (
            <View testID={`dropdown-${props.label}`}>
                <Text>{props.label}</Text>
                {props.options.map(opt => (
                    <TouchableOpacity key={opt} testID={`dropdown-${props.label}-opt-${opt}`} onPress={() => props.onSelect(opt)}>
                        <Text>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    }
});

jest.mock('../src/components/forms/SpeedInput', () => {
    const { TextInput } = require('react-native');
    return function MockSpeedInput(props) {
        return <TextInput testID="input-球速" value={props.value} onChangeText={props.onChangeText} />
    }
});

jest.mock('../src/components/forms/NoteInput', () => {
    const { TextInput } = require('react-native');
    return function MockNoteInput(props) {
        return <TextInput testID="noteinput-備註" value={props.value} onChangeText={props.onChangeText} />
    }
});

describe('PitchEditScreen 測試', () => {
    const mockHandleSave = jest.fn();
    const mockSetCustomValue = jest.fn();
    const mockOnSave = jest.fn();
    const mockOnDelete = jest.fn();

    const mockRecord = {
        id: 'record-123',
        result: '好球',
        cellNumber: 4,
        atBatEndOutcome: null
    };

    let basePitchEditMock;

    beforeEach(() => {
        jest.clearAllMocks();

        usePreferences.mockReturnValue({
            pitchTypes: ['直球', '滑球'],
            customPitchFields: [
                { id: 'custom-text', label: '心情', type: 'text' },
                { id: 'custom-dropdown', label: '狀態', type: 'dropdown', options: ['好', '壞'] }
            ]
        });

        basePitchEditMock = {
            formState: {
                pitchType: '直球',
                speed: '140',
                note: 'test note'
            },
            setPitchType: jest.fn(),
            setSpeed: jest.fn(),
            setNote: jest.fn(),
            isSaving: false,
            handleSave: mockHandleSave,
            customPitchValues: {
                'custom-text': '不錯',
                'custom-dropdown': '好'
            },
            setCustomValue: mockSetCustomValue
        };

        usePitchEdit.mockReturnValue(basePitchEditMock);
    });

    const mockRoute = {
        params: {
            record: mockRecord,
            onSave: mockOnSave,
            onDelete: mockOnDelete
        }
    };

    const renderScreen = () => render(<PitchEditScreen route={mockRoute} navigation={{ goBack: mockGoBack }} />);

    describe('【前端元素】', () => {
        it('渲染單球編輯畫面含資料', async () => {
            const { getByText, getByTestId, findByText } = renderScreen();

            // Should display header
            expect(getByText('編輯投球紀錄')).toBeTruthy();

            // Should display current info
            expect(getByText('當前結果：好球')).toBeTruthy();
            expect(getByText('位置：4 號位')).toBeTruthy();

            // Should display custom fields
            expect(getByTestId('dropdown-球種')).toBeTruthy();
            expect(getByTestId('input-球速')).toBeTruthy();
            expect(getByTestId('noteinput-備註')).toBeTruthy();
            expect(getByTestId('dropdown-狀態')).toBeTruthy();
            expect(getByTestId('input-心情')).toBeTruthy();
        });
    });

    describe('【互動邏輯】', () => {
        it('修改自訂欄位值', async () => {
            const { getByTestId } = renderScreen();

            // 輸入 text
            fireEvent.changeText(getByTestId('input-心情'), '很差');
            expect(mockSetCustomValue).toHaveBeenCalledWith('custom-text', '很差');

            // 選擇 dropdown
            fireEvent.press(getByTestId('dropdown-狀態-opt-壞'));
            expect(mockSetCustomValue).toHaveBeenCalledWith('custom-dropdown', '壞');
        });
    });

    describe('【功能邏輯】', () => {
        it('點擊更新變更', async () => {
            mockHandleSave.mockImplementation(async () => {
                // simulate the success callback from usePitchEdit hook manually
                // The actual hook calls the onSave prop when handleSave is successful
                // Wait: usePitchEdit takes `onSuccess` callback. In the screen, it's defined inline:
                // async (savedRecord) => { if (onSave) await onSave(savedRecord); navigation.goBack(); }
                // So calling handleSave in the mock doesn't trigger the inline function.
                // We'll mock handleSave internally inside the component using fireEvent, but since we mock usePitchEdit completely, 
                // handleSave is just our jest.fn(). But we CAN trigger the callback right here.

                // Extract the success callback from the mock call
                // usePitchEdit is called with (record, isEdit, onSuccess)
                const onSuccess = usePitchEdit.mock.calls[0][2];
                await onSuccess(mockRecord);
            });

            const { getByTestId } = renderScreen();

            fireEvent.press(getByTestId('btn-更新'));

            await waitFor(() => {
                expect(mockHandleSave).toHaveBeenCalled();
                expect(mockOnSave).toHaveBeenCalledWith(mockRecord);
                expect(mockGoBack).toHaveBeenCalled();
            });
        });

        it('點擊刪除此球', async () => {
            const { getByTestId } = renderScreen();

            fireEvent.press(getByTestId('btn-刪除'));

            await waitFor(() => {
                expect(mockOnDelete).toHaveBeenCalledWith('record-123');
                expect(mockGoBack).toHaveBeenCalled();
            });
        });
    });
});
