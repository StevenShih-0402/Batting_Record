// tests/hooks/api/usePitchData.test.js
import { renderHook, act } from '@testing-library/react-native';
import { usePitchData } from '../../../src/hooks/api/usePitchData';
import { useAlert } from '../../../src/context/AlertContext';
import { initAuthAndGetRecords, savePitchRecord, deletePitchRecord, updatePitchRecord } from '../../../src/services/pitchService';
import { saveAtBatSummaryAndClearRecords } from '../../../src/services/atBatSummaryService';

// Mock dependencies
jest.mock('../../../src/context/AlertContext', () => ({
    useAlert: jest.fn(),
}));

jest.mock('../../../src/services/pitchService', () => ({
    initAuthAndGetRecords: jest.fn(),
    savePitchRecord: jest.fn(),
    deletePitchRecord: jest.fn(),
    updatePitchRecord: jest.fn(),
}));

jest.mock('../../../src/services/atBatSummaryService', () => ({
    saveAtBatSummaryAndClearRecords: jest.fn(),
}));

describe('usePitchData 測試', () => {
    const mockShowError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useAlert.mockReturnValue({ showError: mockShowError });
        // 抑制可能由 throw e 產生的 console.error
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
        console.warn.mockRestore();
    });

    describe('【狀態依賴與監聽邏輯】', () => {
        it('當 authReady 為 false 或 user 為 null 時，不應呼叫 initAuthAndGetRecords 訂閱資料', () => {
            renderHook(() => usePitchData(null, false));
            expect(initAuthAndGetRecords).not.toHaveBeenCalled();

            renderHook(() => usePitchData({ uid: 'user1' }, false));
            expect(initAuthAndGetRecords).not.toHaveBeenCalled();

            renderHook(() => usePitchData(null, true));
            expect(initAuthAndGetRecords).not.toHaveBeenCalled();
        });

        it('當 authReady 為 true 且 user 存在時，應正確呼叫 initAuthAndGetRecords 並在卸載時清理訂閱', () => {
            const mockUnsubscribe = jest.fn();
            initAuthAndGetRecords.mockReturnValue(mockUnsubscribe);
            const mockUser = { uid: 'user1' };

            const { unmount } = renderHook(() => usePitchData(mockUser, true));

            expect(initAuthAndGetRecords).toHaveBeenCalledWith(
                expect.any(Function), // setRawRecords
                expect.any(Function), // setLoading
                mockUser
            );

            expect(mockUnsubscribe).not.toHaveBeenCalled();
            unmount();
            expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
        });
    });

    describe('【CRUD 操作邏輯】', () => {
        it('handleSavePitch 成功時應呼叫 savePitchRecord 並回傳結果；失敗時應捕捉錯誤、呼叫 showError 並拋出錯誤', async () => {
            const mockData = { pitchType: 'Fastball' };
            const mockUser = { uid: 'user1' };

            savePitchRecord.mockResolvedValueOnce('mock_id_123'); // 成功情境

            const { result } = renderHook(() => usePitchData(mockUser, true));

            let res;
            await act(async () => {
                res = await result.current.handleSavePitch(mockData);
            });

            expect(savePitchRecord).toHaveBeenCalledWith(mockData, mockUser);
            expect(res).toBe('mock_id_123');
            expect(mockShowError).not.toHaveBeenCalled();

            // 失敗情境
            const errorMsg = 'Save Failed';
            savePitchRecord.mockRejectedValueOnce(new Error(errorMsg));

            await act(async () => {
                await expect(result.current.handleSavePitch(mockData)).rejects.toThrow(errorMsg);
            });

            expect(mockShowError).toHaveBeenCalledWith("錯誤", errorMsg);
        });

        it('handleDeletePitch 成功時應呼叫 deletePitchRecord 並回傳 true；失敗時應捕捉錯誤並呼叫 showError', async () => {
            const pitchId = 'pitch1';

            deletePitchRecord.mockResolvedValueOnce(); // 成功情境

            const { result } = renderHook(() => usePitchData({}, true));

            let res;
            await act(async () => {
                res = await result.current.handleDeletePitch(pitchId);
            });

            expect(deletePitchRecord).toHaveBeenCalledWith(pitchId);
            expect(res).toBe(true);

            // 失敗情境
            const errorMsg = 'Delete Failed';
            deletePitchRecord.mockRejectedValueOnce(new Error(errorMsg));

            await act(async () => {
                res = await result.current.handleDeletePitch(pitchId);
            });

            expect(mockShowError).toHaveBeenCalledWith("錯誤", errorMsg);
            expect(res).toBeUndefined();
        });

        it('handleUpdatePitch 成功時應呼叫 updatePitchRecord 並回傳 true；失敗時應捕捉並顯示更新失敗', async () => {
            const pitchId = 'pitch1';
            const payload = { speed: '150' };

            updatePitchRecord.mockResolvedValueOnce(); // 成功

            const { result } = renderHook(() => usePitchData({}, true));

            let res;
            await act(async () => {
                res = await result.current.handleUpdatePitch(pitchId, payload);
            });

            expect(updatePitchRecord).toHaveBeenCalledWith(pitchId, payload);
            expect(res).toBe(true);

            // 失敗情境
            const errorMsg = 'Update Failed';
            updatePitchRecord.mockRejectedValueOnce(new Error(errorMsg));

            await act(async () => {
                res = await result.current.handleUpdatePitch(pitchId, payload);
            });

            expect(mockShowError).toHaveBeenCalledWith("更新失敗", errorMsg);
            expect(res).toBe(false);
        });
    });

    describe('【彙總與清空邏輯 (handleSaveSummary)】', () => {
        it('若 user 不存在，呼叫 handleSaveSummary 時不應執行任何操作', async () => {
            const { result } = renderHook(() => usePitchData(null, true));

            await act(async () => {
                await result.current.handleSaveSummary({ pitchRecords: [] });
            });

            expect(saveAtBatSummaryAndClearRecords).not.toHaveBeenCalled();
        });

        it('若 finalPayload 缺乏 pitchRecords，應中止執行不呼叫 service', async () => {
            const mockUser = { uid: 'u1' };
            const { result } = renderHook(() => usePitchData(mockUser, true));

            await act(async () => {
                await result.current.handleSaveSummary({ title: 'test' }); // 沒有 pitchRecords
            });

            expect(console.warn).toHaveBeenCalledWith("Payload 或 pitchRecords 丟失");
            expect(saveAtBatSummaryAndClearRecords).not.toHaveBeenCalled();
        });

        it('成功彙總時，應提取目前 rawRecords 的所有 ID，並呼叫 saveAtBatSummaryAndClearRecords', async () => {
            const mockUser = { uid: 'u1' };

            // 透過 initAuthAndGetRecords 的 call 來模擬內部的 state 更新
            let setRecordsCallback;
            initAuthAndGetRecords.mockImplementation((setRecords) => {
                setRecordsCallback = setRecords;
                return jest.fn();
            });

            const { result } = renderHook(() => usePitchData(mockUser, true));

            // 模擬有資料
            act(() => {
                if (setRecordsCallback) {
                    setRecordsCallback([{ id: 'p1' }, { id: 'p2' }]);
                }
            });

            const payload = { pitchRecords: [{ id: 'p1' }, { id: 'p2' }] };
            saveAtBatSummaryAndClearRecords.mockResolvedValueOnce();

            let res;
            await act(async () => {
                res = await result.current.handleSaveSummary(payload);
            });

            expect(saveAtBatSummaryAndClearRecords).toHaveBeenCalledWith(
                payload,
                mockUser,
                ['p1', 'p2']
            );
            expect(res).toBe(true);
        });

        it('發生例外時，應捕捉錯誤、呼叫 showError 顯示彙整失敗並拋出錯誤', async () => {
            const mockUser = { uid: 'u1' };
            const { result } = renderHook(() => usePitchData(mockUser, true));

            const payload = { pitchRecords: [] };
            const errorMsg = 'Summary Failed';
            saveAtBatSummaryAndClearRecords.mockRejectedValueOnce(new Error(errorMsg));

            await act(async () => {
                await expect(result.current.handleSaveSummary(payload)).rejects.toThrow(errorMsg);
            });

            expect(mockShowError).toHaveBeenCalledWith("彙整失敗", errorMsg);
        });
    });
});
