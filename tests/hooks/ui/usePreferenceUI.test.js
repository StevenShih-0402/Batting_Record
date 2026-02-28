// tests/hooks/ui/usePreferenceUI.test.js
import { renderHook, act } from '@testing-library/react-native';
import { usePreferenceUI } from '../../../src/hooks/ui/usePreferenceUI';
import { useAlert } from '../../../src/context/AlertContext';
import { usePreferences } from '../../../src/context/PreferencesContext';

jest.mock('../../../src/context/AlertContext', () => ({
    useAlert: jest.fn(),
}));

jest.mock('../../../src/context/PreferencesContext', () => ({
    usePreferences: jest.fn(),
}));

jest.mock('uuid', () => ({
    v4: () => 'mock-uuid-1234',
}));

describe('usePreferenceUI 測試', () => {
    const mockShowSuccess = jest.fn();
    const mockShowError = jest.fn();
    const mockSavePreferences = jest.fn();
    const mockNavigation = {
        goBack: jest.fn(),
    };

    const initialPitchTypes = ['直球', '滑球'];
    const initialPrimaryColor = '#000000';
    const initialCustomPitchFields = [{ id: 'p1', label: '球質', type: 'text' }];
    const initialCustomSummaryFields = [{ id: 's1', label: '天氣', type: 'text' }];

    beforeEach(() => {
        jest.clearAllMocks();

        useAlert.mockReturnValue({
            showSuccess: mockShowSuccess,
            showError: mockShowError,
        });

        usePreferences.mockReturnValue({
            pitchTypes: initialPitchTypes,
            primaryColor: initialPrimaryColor,
            customPitchFields: initialCustomPitchFields,
            customSummaryFields: initialCustomSummaryFields,
            savePreferences: mockSavePreferences,
            isLoading: false,
        });
    });

    describe('【初始化與取得 Context 資料】', () => {
        it('初始化時，localPitchTypes, localColor, localPitchFields, localSummaryFields 應與 PreferencesContext 提供的值相同', () => {
            const { result } = renderHook(() => usePreferenceUI(mockNavigation));

            expect(result.current.localPitchTypes).toEqual(initialPitchTypes);
            expect(result.current.localColor).toBe(initialPrimaryColor);
            expect(result.current.localPitchFields).toEqual(initialCustomPitchFields);
            expect(result.current.localSummaryFields).toEqual(initialCustomSummaryFields);
        });

        it('isLoading 與 isSaving 狀態應正確反映 (預設 isSaving 為 false)', () => {
            const { result } = renderHook(() => usePreferenceUI(mockNavigation));

            expect(result.current.isLoading).toBe(false);
            expect(result.current.isSaving).toBe(false);
        });
    });

    describe('【球種設定 (Pitch Types)】', () => {
        it('呼叫 addPitchType 時，若新球種包含空白，應消除兩側空白後加入 localPitchTypes，並清空 newPitchType', () => {
            const { result } = renderHook(() => usePreferenceUI(mockNavigation));

            act(() => {
                result.current.setNewPitchType('  變速球  ');
            });

            act(() => {
                result.current.addPitchType();
            });

            expect(result.current.localPitchTypes).toEqual(['直球', '滑球', '變速球']);
            expect(result.current.newPitchType).toBe('');
        });

        it('若新球種為空字串或只有空白，呼叫 addPitchType 不應改變 localPitchTypes', () => {
            const { result } = renderHook(() => usePreferenceUI(mockNavigation));

            act(() => {
                result.current.setNewPitchType('   ');
            });

            act(() => {
                result.current.addPitchType();
            });

            expect(result.current.localPitchTypes).toEqual(initialPitchTypes);
        });

        it('若新球種已存在於 localPitchTypes，呼叫 addPitchType 應觸發 showError 並中止新增', () => {
            const { result } = renderHook(() => usePreferenceUI(mockNavigation));

            act(() => {
                result.current.setNewPitchType('直球');
            });

            act(() => {
                result.current.addPitchType();
            });

            expect(mockShowError).toHaveBeenCalledWith('重複項目', '此球種已存在');
            expect(result.current.localPitchTypes).toEqual(initialPitchTypes); // 不變
        });

        it('呼叫 removePitchType 傳入指定索引，應能將對應球種從 localPitchTypes 中移除', () => {
            const { result } = renderHook(() => usePreferenceUI(mockNavigation));

            act(() => {
                result.current.removePitchType(0); // remove '直球'
            });

            expect(result.current.localPitchTypes).toEqual(['滑球']);
        });
    });

    describe('【自訂欄位設定 (Custom Fields - addCustomField / removeCustomField)】', () => {
        // Mock a setList function
        const mockEditorEmptyLabel = { label: '  ', type: 'text', options: [], reset: jest.fn() };
        const mockEditorEmptyOptions = { label: 'Test', type: 'dropdown', options: [], reset: jest.fn() };
        const mockEditorValid = { label: '  New Field  ', type: 'dropdown', options: ['A', 'B'], reset: jest.fn() };

        it('呼叫 addCustomField 時，若 editor 的 label 為空，應觸發 showError 並中止新增', () => {
            const { result } = renderHook(() => usePreferenceUI(mockNavigation));
            const mockSetList = jest.fn();

            act(() => {
                result.current.addCustomField(mockEditorEmptyLabel, mockSetList);
            });

            expect(mockShowError).toHaveBeenCalledWith('欄位名稱不得為空', '請輸入欄位名稱');
            expect(mockSetList).not.toHaveBeenCalled();
        });

        it('呼叫 addCustomField 時，若 type 為 dropdown 但 options 為空，應觸發 showError 並中止新增', () => {
            const { result } = renderHook(() => usePreferenceUI(mockNavigation));
            const mockSetList = jest.fn();

            act(() => {
                result.current.addCustomField(mockEditorEmptyOptions, mockSetList);
            });

            expect(mockShowError).toHaveBeenCalledWith('請新增選項', '下拉選單型欄位至少需要一個選項');
            expect(mockSetList).not.toHaveBeenCalled();
        });

        it('若驗證通過，應正確建立欄位物件並加入清單，並呼叫 editor.reset()', () => {
            const { result } = renderHook(() => usePreferenceUI(mockNavigation));

            act(() => {
                // 使用內建的 setState (setLocalPitchFields)
                result.current.addCustomField(mockEditorValid, result.current.setLocalPitchFields);
            });

            expect(result.current.localPitchFields).toEqual([
                ...initialCustomPitchFields,
                { id: 'mock-uuid-1234', label: 'New Field', type: 'dropdown', options: ['A', 'B'] }
            ]);
            expect(mockEditorValid.reset).toHaveBeenCalled();
        });

        it('呼叫 removeCustomField 傳入指定 setList 與 id，應能將該 id 的欄位從清單中移除', () => {
            const { result } = renderHook(() => usePreferenceUI(mockNavigation));

            act(() => {
                result.current.removeCustomField(result.current.setLocalPitchFields, 'p1');
            });

            expect(result.current.localPitchFields).toEqual([]);
        });
    });

    describe('【儲存邏輯 (handleSave)】', () => {
        it('當 savePreferences 成功回傳 true 時，應觸發 showSuccess，並呼叫 navigation.goBack()', async () => {
            mockSavePreferences.mockResolvedValueOnce(true);
            const { result } = renderHook(() => usePreferenceUI(mockNavigation));

            await act(async () => {
                await result.current.handleSave();
            });

            expect(mockSavePreferences).toHaveBeenCalledWith(
                initialPitchTypes,
                initialPrimaryColor,
                initialCustomPitchFields,
                initialCustomSummaryFields
            );
            expect(mockShowSuccess).toHaveBeenCalledWith('儲存成功', '偏好設定已更新');
            expect(mockNavigation.goBack).toHaveBeenCalled();
            expect(result.current.isSaving).toBe(false);
        });

        it('當 savePreferences 回傳 false 時，應觸發 showError', async () => {
            mockSavePreferences.mockResolvedValueOnce(false);
            const { result } = renderHook(() => usePreferenceUI(mockNavigation));

            await act(async () => {
                await result.current.handleSave();
            });

            expect(mockShowError).toHaveBeenCalledWith('儲存失敗', '請稍後再試');
            expect(mockNavigation.goBack).not.toHaveBeenCalled();
            expect(result.current.isSaving).toBe(false);
        });

        it('當 savePreferences 拋出例外錯誤時，應觸發 showError 顯示錯誤訊息', async () => {
            const errorMessage = 'Network error';
            mockSavePreferences.mockRejectedValueOnce(new Error(errorMessage));
            const { result } = renderHook(() => usePreferenceUI(mockNavigation));

            await act(async () => {
                await result.current.handleSave();
            });

            expect(mockShowError).toHaveBeenCalledWith('發生錯誤', errorMessage);
            expect(result.current.isSaving).toBe(false);
        });
    });
});
