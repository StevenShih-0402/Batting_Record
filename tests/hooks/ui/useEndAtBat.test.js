// tests/hooks/ui/useEndAtBat.test.js
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useEndAtBat } from '../../../src/hooks/ui/useEndAtBat';
import { useAlert } from '../../../src/context/AlertContext';
import { usePreferences } from '../../../src/context/PreferencesContext';
import { getFieldQueue, pushToFieldQueue } from '../../../src/hooks/ui/useCustomFieldQueue';

// Mock dependencies
jest.mock('../../../src/context/AlertContext', () => ({
    useAlert: jest.fn(),
}));

jest.mock('../../../src/context/PreferencesContext', () => ({
    usePreferences: jest.fn(),
}));

jest.mock('../../../src/hooks/ui/useCustomFieldQueue', () => ({
    getFieldQueue: jest.fn(),
    pushToFieldQueue: jest.fn(),
}));

describe('useEndAtBat 測試', () => {
    const mockShowSuccess = jest.fn();
    const mockShowError = jest.fn();
    const mockOnSave = jest.fn();
    const mockOnClose = jest.fn();

    const mockCustomFields = [
        { id: 'f1', label: '天氣', type: 'text' },
        { id: 'f2', label: '對手', type: 'dropdown', options: ['A隊', 'B隊'] }
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        useAlert.mockReturnValue({
            showSuccess: mockShowSuccess,
            showError: mockShowError
        });

        usePreferences.mockReturnValue({
            customSummaryFields: mockCustomFields
        });

        // 預設 getFieldQueue 行為
        getFieldQueue.mockImplementation(async (fieldId) => {
            if (fieldId === 'f1') return ['晴天', '雨天'];
            return [];
        });

        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    describe('【初始化與 Queue 載入邏輯】', () => {
        it('當 isVisible 為 true 且存在 text 類型的 customSummaryFields，應向 getFieldQueue 要求對應的快選列表並存入 fieldQueues', async () => {
            const { result } = renderHook(() => useEndAtBat(true, [], mockOnSave, mockOnClose));

            await waitFor(() => {
                expect(getFieldQueue).toHaveBeenCalledWith('f1');
                expect(result.current.fieldQueues).toEqual({ 'f1': ['晴天', '雨天'] });
            });
        });

        it('當 isVisible 為 false 時，不應重置狀態或載入 Queue', () => {
            const { result } = renderHook(() => useEndAtBat(false, [], mockOnSave, mockOnClose));

            expect(getFieldQueue).not.toHaveBeenCalled();
            expect(result.current.fieldQueues).toEqual({}); // 未載入
        });

        it('當 isVisible 變為 true 時，應清空既有狀態 (title, note, customValues)', async () => {
            // 先以 isVisible=false 渲染並塞值
            const { result, rerender } = renderHook(
                ({ isVisible }) => useEndAtBat(isVisible, [], mockOnSave, mockOnClose),
                { initialProps: { isVisible: false } }
            );

            act(() => {
                result.current.setAtBatTitle('舊標題');
                result.current.setSummaryNote('舊備註');
                result.current.setSummaryCustomValue('f1', '舊值');
            });

            expect(result.current.atBatTitle).toBe('舊標題');
            expect(result.current.summaryCustomValues['f1']).toBe('舊值');

            // 變成 true，觸發 useEffect 內部的重置邏輯
            rerender({ isVisible: true });

            await waitFor(() => {
                expect(result.current.atBatTitle).toBe('');
                expect(result.current.summaryNote).toBe('');
                expect(result.current.summaryCustomValues).toEqual({});
            });
        });
    });

    describe('【自訂欄位狀態變更】', () => {
        it('呼叫 setSummaryCustomValue 能正確更新指定 fieldId 的值', () => {
            const { result } = renderHook(() => useEndAtBat(true, [], mockOnSave, mockOnClose));

            act(() => {
                result.current.setSummaryCustomValue('f1', '多雲');
            });

            expect(result.current.summaryCustomValues['f1']).toBe('多雲');
        });
    });

    describe('【儲存邏輯與防呆 (handleSave)】', () => {
        it('若 atBatRecords 為空或不存在，呼叫 handleSave 應直接 return 且不觸發任何事件', async () => {
            const { result: r1 } = renderHook(() => useEndAtBat(true, [], mockOnSave, mockOnClose)); // 空陣列
            await act(async () => {
                await r1.current.handleSave();
            });
            expect(mockOnSave).not.toHaveBeenCalled();

            const { result: r2 } = renderHook(() => useEndAtBat(true, null, mockOnSave, mockOnClose)); // 不存在
            await act(async () => {
                await r2.current.handleSave();
            });
            expect(mockOnSave).not.toHaveBeenCalled();
        });

        it('若標題未填寫，呼叫 onSave 時的 payload 中應帶入預設的時間字串', async () => {
            const { result } = renderHook(() => useEndAtBat(true, [{ id: 'fake_record' }], mockOnSave, mockOnClose));

            let passedPayload;
            mockOnSave.mockImplementation(async (payload) => {
                passedPayload = payload;
            });

            await act(async () => {
                await result.current.handleSave(); // title 一開始就是空字串
            });

            // 驗證標題包含 : (時間格式特徵)
            expect(passedPayload.atBatTitle).toMatch(/:/);
        });

        it('儲存時，針對有填寫值且 type 為 text 的自訂欄位，應呼叫 pushToFieldQueue', async () => {
            const { result } = renderHook(() => useEndAtBat(true, [{ id: 'fake_record' }], mockOnSave, mockOnClose));

            act(() => {
                result.current.setSummaryCustomValue('f1', '下雪 (text)'); // text type
                result.current.setSummaryCustomValue('f2', 'A隊'); // dropdown type
            });

            await act(async () => {
                await result.current.handleSave();
            });

            // 只有 f1 是 text 應該被 push
            expect(pushToFieldQueue).toHaveBeenCalledWith('f1', '下雪 (text)');
            expect(pushToFieldQueue).not.toHaveBeenCalledWith('f2', expect.anything());
        });

        it('當標題與備註均有填寫，呼叫 onSave 時的 payload 應帶入填寫的字串與 summaryCustomValues', async () => {
            const { result } = renderHook(() => useEndAtBat(true, [{ id: 'fake_record' }], mockOnSave, mockOnClose));

            act(() => {
                result.current.setAtBatTitle('大會盃決賽');
                result.current.setSummaryNote('打得不錯');
                result.current.setSummaryCustomValue('f1', '陰天');
            });

            let passedPayload;
            mockOnSave.mockImplementation(async (payload) => {
                passedPayload = payload;
            });

            await act(async () => {
                await result.current.handleSave();
            });

            expect(passedPayload).toEqual({
                atBatTitle: '大會盃決賽',
                summaryNote: '打得不錯',
                customSummaryValues: { 'f1': '陰天' }
            });
        });

        it('當 onSave 成功執行後，應呼叫 showSuccess，且在按下確定後，應呼叫 onClose 並再次清空狀態', async () => {
            const { result } = renderHook(() => useEndAtBat(true, [{ id: 'fake_record' }], mockOnSave, mockOnClose));

            let confirmAction;
            mockShowSuccess.mockImplementation((title, msg, buttons) => {
                confirmAction = buttons[0].onPress;
            });

            // 模擬填寫資料
            act(() => {
                result.current.setAtBatTitle('已儲存的標題');
                result.current.setSummaryCustomValue('f1', '已儲存');
            });

            await act(async () => {
                await result.current.handleSave();
            });

            expect(mockShowSuccess).toHaveBeenCalled();

            // 模擬用戶按下確定
            act(() => {
                confirmAction();
            });

            expect(mockOnClose).toHaveBeenCalled();
            // 狀態應被清空
            expect(result.current.atBatTitle).toBe('');
            expect(result.current.summaryCustomValues).toEqual({});
        });

        it('當儲存過程中發生例外錯誤時，應捕捉錯誤並呼叫 showError，且最終將 isSaving 設回 false', async () => {
            const { result } = renderHook(() => useEndAtBat(true, [{ id: 'fake_record' }], mockOnSave, mockOnClose));

            mockOnSave.mockRejectedValueOnce(new Error('Network error'));

            await act(async () => {
                await result.current.handleSave(); // 內部 isSaving 會經由 true -> catch -> finally false
            });

            expect(mockShowError).toHaveBeenCalledWith('儲存失敗', '請檢查網路連線後再試一次。');
            expect(result.current.isSaving).toBe(false);
        });
    });
});
