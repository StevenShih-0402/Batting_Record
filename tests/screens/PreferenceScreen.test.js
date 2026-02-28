// Mock Firebase modules directly to avoid ESM transformation issues in Jest
jest.mock('firebase/app', () => ({
    getApps: jest.fn(() => []),
    getApp: jest.fn(),
    initializeApp: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
    initializeAuth: jest.fn(),
    getReactNativePersistence: jest.fn(),
    getAuth: jest.fn(),
}));
jest.mock('firebase/storage', () => ({
    getStorage: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-uuid'),
}));
jest.mock('react-native-get-random-values', () => ({}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PreferenceScreen from '../../src/screens/PreferenceScreen';
import { usePreferenceUI } from '../../src/hooks/ui/usePreferenceUI';
import { useFieldEditor } from '../../src/hooks/ui/useFieldEditor';
import { useNavigation } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';

// Mock Hooks
jest.mock('../../src/hooks/ui/usePreferenceUI');
jest.mock('../../src/hooks/ui/useFieldEditor');
jest.mock('@react-navigation/native');

describe('PreferenceScreen 測試', () => {
    const mockNavigation = { goBack: jest.fn() };

    // Mock usePreferenceUI return values
    const mockPreferenceUI = {
        isLoading: false,
        isSaving: false,
        localColor: '#00E5FF',
        setLocalColor: jest.fn(),
        localPitchTypes: ['直球', '曲球'],
        newPitchType: '',
        setNewPitchType: jest.fn(),
        addPitchType: jest.fn(),
        removePitchType: jest.fn(),
        localPitchFields: [{ id: '1', label: '備註', type: 'text' }],
        setLocalPitchFields: jest.fn(),
        localSummaryFields: [{ id: '2', label: '狀態', type: 'dropdown', options: ['好', '壞'] }],
        setLocalSummaryFields: jest.fn(),
        addCustomField: jest.fn(),
        removeCustomField: jest.fn(),
        handleSave: jest.fn(),
    };

    // Mock useFieldEditor return values
    const mockFieldEditor = {
        label: '',
        setLabel: jest.fn(),
        type: 'text',
        setType: jest.fn(),
        newOption: '',
        setNewOption: jest.fn(),
        options: [],
        addOption: jest.fn(),
        removeOption: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigation.mockReturnValue(mockNavigation);
        usePreferenceUI.mockReturnValue(mockPreferenceUI);
        useFieldEditor.mockReturnValue(mockFieldEditor);
    });

    const renderScreen = () => render(
        <PaperProvider>
            <PreferenceScreen />
        </PaperProvider>
    );

    describe('【前端元素】', () => {
        it('應該正確渲染偏好設定所有的基本元件', () => {
            const { getByText } = renderScreen();

            expect(getByText('主題顏色')).toBeTruthy();
            expect(getByText('自訂球種')).toBeTruthy();
            expect(getByText('自訂打席備註欄位')).toBeTruthy();
            expect(getByText('自訂打席彙整欄位')).toBeTruthy();
            expect(getByText('儲存變更')).toBeTruthy();
        });
    });

    describe('【互動邏輯】', () => {
        it('渲染新增球種區域', () => {
            const { getByText } = renderScreen();
            expect(getByText('自訂球種')).toBeTruthy();
        });

        it('顯示已有的球種 Chip', () => {
            const { getByText } = renderScreen();
            expect(getByText('直球')).toBeTruthy();
            expect(getByText('曲球')).toBeTruthy();
        });
    });

    describe('【自訂欄位邏輯】', () => {
        it('渲染自訂欄位編輯器中的欄位名稱文字', () => {
            const { getAllByText } = renderScreen();
            const labels = getAllByText('欄位名稱');
            expect(labels.length).toBeGreaterThanOrEqual(2);
        });

        it('點擊新增此欄位按鈕應呼叫 addCustomField', () => {
            const { getAllByText } = renderScreen();
            const buttons = getAllByText('新增此欄位');
            fireEvent.press(buttons[0]);
            expect(mockPreferenceUI.addCustomField).toHaveBeenCalled();
        });
    });

    describe('【功能邏輯】', () => {
        it('點擊儲存變更應呼叫 handleSave', () => {
            const { getByText } = renderScreen();
            const saveBtn = getByText('儲存變更');
            fireEvent.press(saveBtn);
            expect(mockPreferenceUI.handleSave).toHaveBeenCalled();
        });
    });
});
