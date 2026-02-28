// tests/hooks/api/useHistoryData.test.js
import { renderHook, act } from '@testing-library/react-native';
import { useHistoryData } from '../../../src/hooks/api/useHistoryData';
import { useAuth } from '../../../src/hooks/auth/useAuth';
import { getAtBatHistory } from '../../../src/services/atBatSummaryService';

// 模擬依賴
jest.mock('../../../src/hooks/auth/useAuth', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../../src/services/atBatSummaryService', () => ({
    getAtBatHistory: jest.fn(),
}));

describe('useHistoryData 測試', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('【狀態依賴邏輯】', () => {
        it('當 Auth 尚未準備好 (isReady=false) 時，應保持載入狀態且不呼叫服務', () => {
            useAuth.mockReturnValue({ isReady: false, user: null });

            const { result } = renderHook(() => useHistoryData());

            expect(result.current.history).toEqual([]);
            expect(result.current.loading).toBe(true);
            expect(getAtBatHistory).not.toHaveBeenCalled();
        });

        it('當使用者未登入 (userId 不存在) 時，應回傳空資料並結束載入', () => {
            useAuth.mockReturnValue({ isReady: true, user: null });

            const { result } = renderHook(() => useHistoryData());

            expect(result.current.history).toEqual([]);
            expect(result.current.loading).toBe(false);
            expect(getAtBatHistory).not.toHaveBeenCalled();
        });

        it('當使用者為訪客 (isAnonymous=true) 時，應回傳空資料並結束載入', () => {
            useAuth.mockReturnValue({ isReady: true, user: { uid: 'guest123', isAnonymous: true } });

            const { result } = renderHook(() => useHistoryData());

            expect(result.current.history).toEqual([]);
            expect(result.current.loading).toBe(false);
            expect(getAtBatHistory).not.toHaveBeenCalled();
        });
    });

    describe('【資料獲取邏輯】', () => {
        it('當正式用戶登入時，應呼叫 getAtBatHistory 並建立訂閱', () => {
            useAuth.mockReturnValue({ isReady: true, user: { uid: 'user123', isAnonymous: false } });

            const mockUnsubscribe = jest.fn();
            getAtBatHistory.mockReturnValue(mockUnsubscribe);

            renderHook(() => useHistoryData());

            expect(getAtBatHistory).toHaveBeenCalledTimes(1);
            expect(getAtBatHistory).toHaveBeenCalledWith(
                'user123',
                expect.any(Function), // setHistory
                expect.any(Function)  // setLoading
            );
        });

        it('當 Hook 卸載時，應呼叫 unsubscribe 函數清理訂閱', () => {
            useAuth.mockReturnValue({ isReady: true, user: { uid: 'user789', isAnonymous: false } });

            const mockUnsubscribe = jest.fn();
            getAtBatHistory.mockReturnValue(mockUnsubscribe);

            const { unmount } = renderHook(() => useHistoryData());

            // 卸載前尚未呼叫
            expect(mockUnsubscribe).not.toHaveBeenCalled();

            // 執行卸載
            unmount();

            // 卸載後應呼叫清理函數
            expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
        });
    });
});
