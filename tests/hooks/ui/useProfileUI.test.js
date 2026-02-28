// tests/hooks/ui/useProfileUI.test.js
import { renderHook, act } from '@testing-library/react-native';
import { useProfileUI } from '../../../src/hooks/ui/useProfileUI';
import { useAlert } from '../../../src/context/AlertContext';
import { signOutUser } from '../../../src/services/authService';

// Mock dependencies
jest.mock('../../../src/context/AlertContext', () => ({
    useAlert: jest.fn(),
}));

jest.mock('../../../src/services/authService', () => ({
    signOutUser: jest.fn(),
}));

describe('useProfileUI 測試', () => {
    const mockShowSuccess = jest.fn();
    const mockShowWarning = jest.fn();
    const mockShowError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useAlert.mockReturnValue({
            showSuccess: mockShowSuccess,
            showWarning: mockShowWarning,
            showError: mockShowError,
        });
    });

    describe('handleLogout', () => {
        it('當 signOutUser 成功回傳 true 時，應顯示「已登出」的成功訊息', async () => {
            signOutUser.mockResolvedValue(true);
            const { result } = renderHook(() => useProfileUI());

            await act(async () => {
                await result.current.handleLogout();
            });

            expect(signOutUser).toHaveBeenCalled();
            expect(mockShowSuccess).toHaveBeenCalledWith("已登出");
        });

        it('當 signOutUser 回傳 false 時（如訪客用戶），應顯示警告訊息', async () => {
            signOutUser.mockResolvedValue(false);
            const { result } = renderHook(() => useProfileUI());

            await act(async () => {
                await result.current.handleLogout();
            });

            expect(signOutUser).toHaveBeenCalled();
            expect(mockShowWarning).toHaveBeenCalledWith("提示", "訪客用戶無法登出，請先綁定 Google 或 Email 帳號");
        });

        it('當 signOutUser 執行過程發生例外錯誤時，應顯示錯誤訊息', async () => {
            const error = new Error("Firebase error");
            signOutUser.mockRejectedValue(error);
            const { result } = renderHook(() => useProfileUI());

            // 存取原本的 console.error 並 Mock 它以避免測試輸出雜亂
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            await act(async () => {
                await result.current.handleLogout();
            });

            expect(signOutUser).toHaveBeenCalled();
            expect(mockShowError).toHaveBeenCalledWith("錯誤", "登出失敗，請重試");
            expect(consoleSpy).toHaveBeenCalledWith(error);

            consoleSpy.mockRestore();
        });
    });
});
