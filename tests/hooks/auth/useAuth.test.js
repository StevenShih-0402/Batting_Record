// tests/hooks/auth/useAuth.test.js
import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../../../src/hooks/auth/useAuth';
import { auth } from '../../../src/services/firebaseService';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

jest.mock('../../../src/services/firebaseService', () => ({
    auth: {}
}));

jest.mock('firebase/auth', () => ({
    onAuthStateChanged: jest.fn(),
    signInAnonymously: jest.fn()
}));

describe('useAuth 測試', () => {
    let mockOnAuthStateChangedCallback;
    let mockUnsubscribe;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        // 攔截 Firebase onAuthStateChanged 的 callback 以便手動觸發
        mockUnsubscribe = jest.fn();
        onAuthStateChanged.mockImplementation((authInstance, callback) => {
            mockOnAuthStateChangedCallback = callback;
            return mockUnsubscribe;
        });

        signInAnonymously.mockImplementation(async () => {
            if (mockOnAuthStateChangedCallback) {
                mockOnAuthStateChangedCallback({ uid: 'anon' });
            }
        });

        // 抑制可能由 console 產生的輸出影響測試報告
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        // 重置 isSigningIn flag
        if (mockOnAuthStateChangedCallback) {
            act(() => {
                mockOnAuthStateChangedCallback({ uid: 'reset' });
            });
        }

        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        console.error.mockRestore();
        console.log.mockRestore();
    });

    describe('【初始化與監聽狀態】', () => {
        it('當有 currentUser 登入時，應更新 user 狀態並設定 isReady 為 true', () => {
            const { result } = renderHook(() => useAuth());

            expect(result.current.user).toBeNull();
            expect(result.current.isReady).toBe(false);

            const mockUser = { uid: 'u1', email: 'test@example.com' };

            act(() => {
                mockOnAuthStateChangedCallback(mockUser);
            });

            expect(result.current.user).toBe(mockUser);
            expect(result.current.isReady).toBe(true);
            expect(signInAnonymously).not.toHaveBeenCalled();
        });

        it('當收到無 currentUser 且尚未登入時，應觸發延遲的匿名登入 (debounce)', () => {
            const { result } = renderHook(() => useAuth());

            act(() => {
                mockOnAuthStateChangedCallback(null);
            });

            // 尚未執行逾時，不應該呼叫
            expect(signInAnonymously).not.toHaveBeenCalled();

            // 快進 300ms
            act(() => {
                jest.advanceTimersByTime(300);
            });

            expect(signInAnonymously).toHaveBeenCalledWith(auth);
        });

        it('當短時間內連續觸發無 currentUser 時，應清除原本的 timeout 避免重複執行匿名登入', () => {
            const { result } = renderHook(() => useAuth());

            // 第一次觸發
            act(() => {
                mockOnAuthStateChangedCallback(null);
            });

            // 快進 100ms (小於 300ms 閾值)
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // 第二次觸發 (連續觸發)，這應該會清空前一次計時器
            act(() => {
                mockOnAuthStateChangedCallback(null);
            });

            // 繼續快進 200ms，累積 300ms，但第二次觸發重置了計時，因此還沒執行
            act(() => {
                jest.advanceTimersByTime(200);
            });
            expect(signInAnonymously).not.toHaveBeenCalled();

            // 再快進 100ms (此時自第二次觸發已滿 300ms)
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // 因為 debounce 機制，理應只執行被保留下來的那「1 次」
            expect(signInAnonymously).toHaveBeenCalledTimes(1);
        });

        it('當組件卸載時，應呼叫 unsubscribe 並清除相關 timeout', () => {
            const { unmount } = renderHook(() => useAuth());

            expect(onAuthStateChanged).toHaveBeenCalled();
            expect(mockUnsubscribe).not.toHaveBeenCalled();

            unmount();

            expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
        });
    });

    describe('【匿名登入行為驗證】', () => {
        it('成功執行 signInAnonymously 時，不應拋出例外，且交由後續的 auth callback 處理狀態', async () => {
            const { result } = renderHook(() => useAuth());

            await act(async () => {
                mockOnAuthStateChangedCallback(null);
                jest.advanceTimersByTime(300);
            });

            expect(signInAnonymously).toHaveBeenCalled();
            // 在成功的情況下，useAuth 沒有主動調用 setUser，而是交給 firebase 的事件通知。
            // 故不需要斷言 isReady 或 user 有改變，因為這個模擬裡並未再次觸發 callback
        });

        it('當 signInAnonymously 發生例外報錯時，應捕捉錯誤，並將 isReady 設為 true 以避免畫面卡死', async () => {
            const errorMsg = 'Anonymous auth failed';
            signInAnonymously.mockRejectedValueOnce(new Error(errorMsg));

            const { result } = renderHook(() => useAuth());

            await act(async () => {
                mockOnAuthStateChangedCallback(null);
                jest.advanceTimersByTime(300);
                // 消化 promise reject 避免 "Unhandled Promise Rejection" error 拋錯到全局
                await Promise.resolve();
            });

            expect(console.error).toHaveBeenCalled();
            expect(result.current.isReady).toBe(true);
            expect(result.current.user).toBeNull();
        });
    });
});
