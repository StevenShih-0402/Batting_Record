// tests/screens/PitchInputScreen.test.js
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
import PitchInputScreen from '../../src/screens/PitchInputScreen';
import { usePitchInput } from '../../src/hooks/ui/usePitchInput';
import { getFieldQueue, pushToFieldQueue } from '../../src/hooks/ui/useCustomFieldQueue';

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ goBack: mockGoBack }),
    useRoute: () => ({
        params: {
            title: '4 號位 (好球帶)',
            cellNumber: 4,
            onSave: jest.fn()
        }
    })
}));

jest.mock('../src/hooks/ui/usePitchInput');
jest.mock('../src/hooks/ui/useCustomFieldQueue');

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

jest.mock('../src/components/forms/NoteInput', () => {
    const { TextInput } = require('react-native');
    return function MockNoteInput(props) {
        return <TextInput testID={`noteinput-${props.label}`} value={props.value} onChangeText={props.onChangeText} />
    }
});

describe('PitchInputScreen 測試', () => {
    const mockHandleSave = jest.fn();
    const mockSetCustomValue = jest.fn();

    let basePitchInputMock;

    beforeEach(() => {
        jest.clearAllMocks();

        getFieldQueue.mockResolvedValue(['queue-item-1', 'queue-item-2']);
        pushToFieldQueue.mockResolvedValue();

        basePitchInputMock = {
            form: {
                pitchType: '直球',
                speed: '',
                result: '好球',
                note: ''
            },
            setPitchType: jest.fn(),
            setSpeed: jest.fn(),
            isSaving: false,
            handleSave: mockHandleSave,
            pitchTypes: ['直球', '滑球'],
            getResultOptions: jest.fn(() => ['好球', '壞球']),
            customPitchFields: [
                { id: 'custom-text', label: '心情', type: 'text' },
                { id: 'custom-dropdown', label: '狀態', type: 'dropdown', options: ['好', '壞'] }
            ],
            customValues: {
                'custom-text': '',
                'custom-dropdown': ''
            },
            setCustomValue: mockSetCustomValue
        };

        usePitchInput.mockReturnValue(basePitchInputMock);
    });

    const mockRoute = {
        params: {
            cellInfo: { label: '4 號位 (好球帶)', cellNumber: 4 },
            atBatStatus: { lastResult: null }
        }
    };

    const renderScreen = () => render(<PitchInputScreen route={mockRoute} navigation={{ goBack: mockGoBack }} />);

    describe('【前端元素】', () => {
        it('渲染單一球紀錄輸入畫面', async () => {
            const { getByText, getByTestId } = renderScreen();

            await waitFor(() => {
                expect(getByText('4 號位')).toBeTruthy();
                expect(getByTestId('dropdown-球種')).toBeTruthy();
                expect(getByTestId('dropdown-結果')).toBeTruthy();
                expect(getByTestId('input-球速')).toBeTruthy();
                expect(getByTestId('noteinput-undefined')).toBeTruthy(); // NoteInput receives undefined label because we mock it without passing proper label in component or we just look for noteinput
                expect(getByTestId('btn-儲存打席球數')).toBeTruthy();
            });
        });
    });

    describe('【互動邏輯】', () => {
        it('渲染動態自訂欄位 (文字與下拉)', async () => {
            const { getByTestId } = renderScreen();

            await waitFor(() => {
                expect(getByTestId('input-心情')).toBeTruthy();
                expect(getByTestId('dropdown-狀態')).toBeTruthy();

                // test options rendered
                expect(getByTestId('dropdown-狀態-opt-好')).toBeTruthy();
            });
        });

        it('點擊文字型欄位的 Queue 快速選項', async () => {
            const { getByTestId, findByTestId } = renderScreen();

            const queueChip = await findByTestId('chip-queue-item-1');
            fireEvent.press(queueChip);

            expect(mockSetCustomValue).toHaveBeenCalledWith('custom-text', 'queue-item-1');
        });
    });

    describe('【功能邏輯】', () => {
        it('點擊儲存並返回', async () => {
            mockHandleSave.mockResolvedValueOnce(true);
            basePitchInputMock.customValues['custom-text'] = 'test-queue-push';

            const { getByTestId } = renderScreen();

            fireEvent.press(getByTestId('btn-儲存打席球數'));

            await waitFor(() => {
                expect(pushToFieldQueue).toHaveBeenCalledWith('custom-text', 'test-queue-push');
                expect(mockHandleSave).toHaveBeenCalled();
            });
        });
    });
});
