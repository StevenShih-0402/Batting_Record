// tests/hooks/auth/useLogin.test.js
import { renderHook, act } from '@testing-library/react-native';
import { useLogin } from '../../../src/hooks/auth/useLogin';
import { useAlert } from '../../../src/context/AlertContext';
import {
    signInWithEmail,
    signUpWithEmail,
    sendVerification,
    sendResetPasswordEmail,
    signOutUser,
} from '../../../src/services/authService';

// Mock dependencies
jest.mock('../../../src/context/AlertContext', () => ({
    useAlert: jest.fn(),
}));

jest.mock('../../../src/services/authService', () => ({
    signInWithEmail: jest.fn(),
    signUpWithEmail: jest.fn(),
    sendVerification: jest.fn(),
    sendResetPasswordEmail: jest.fn(),
    signOutUser: jest.fn(),
    signInWithGoogle: jest.fn(),
    signInAsGuest: jest.fn()
}));

describe('useLogin 測試', () => {
    const mockShowError = jest.fn();
    const mockShowWarning = jest.fn();
    const mockShowMailSend = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        useAlert.mockReturnValue({
            showError: mockShowError,
            showWarning: mockShowWarning,
            showMailSend: mockShowMailSend
        });
    });

    describe('【表單驗證與錯誤處理 (handleEmailAuth)】', () => {
        it('未輸入電子郵件或密碼時，應呼叫 showWarning 提示，並回傳 false', async () => {
            const { result } = renderHook(() => useLogin());

            act(() => {
                result.current.state.setEmail('');       // 空 email
                result.current.state.setPassword('pw');
            });

            let res;
            await act(async () => {
                res = await result.current.actions.handleEmailAuth();
            });

            expect(mockShowWarning).toHaveBeenCalledWith("提示", "請輸入電子郵件和密碼");
            expect(res).toBe(false);

            mockShowWarning.mockClear();

            act(() => {
                result.current.state.setEmail('test@example.com');
                result.current.state.setPassword('');    // 空 password
            });

            await act(async () => {
                res = await result.current.actions.handleEmailAuth();
            });

            expect(mockShowWarning).toHaveBeenCalledWith("提示", "請輸入電子郵件和密碼");
            expect(res).toBe(false);
        });

        it('註冊模式下，若兩次輸入密碼不一致，應呼叫 showWarning 提示，並回傳 false', async () => {
            const { result } = renderHook(() => useLogin());

            act(() => {
                result.current.state.setEmail('test@example.com');
                result.current.state.setPassword('pw1');
                result.current.state.setConfirmPassword('pw2');
                result.current.state.setIsLoginMode(false); // 切換到註冊模式
            });

            let res;
            await act(async () => {
                res = await result.current.actions.handleEmailAuth();
            });

            expect(mockShowWarning).toHaveBeenCalledWith("錯誤", "兩次輸入的密碼不一致");
            expect(res).toBe(false);
        });
    });

    describe('【登入流程 (isLoginMode = true)】', () => {
        it('登入成功但信箱尚未驗證時，應呼叫 showWarning 提示未驗證，並回傳 false', async () => {
            signInWithEmail.mockResolvedValueOnce({ emailVerified: false });

            const { result } = renderHook(() => useLogin());

            act(() => {
                result.current.state.setEmail('test@example.com');
                result.current.state.setPassword('pw1');
                result.current.state.setIsLoginMode(true);
            });

            let res;
            await act(async () => {
                res = await result.current.actions.handleEmailAuth();
            });

            expect(signInWithEmail).toHaveBeenCalledWith('test@example.com', 'pw1');
            expect(mockShowWarning).toHaveBeenCalledWith("未驗證", "您的電子郵件尚未驗證，請先驗證信箱後再登入。");
            expect(res).toBe(false);
        });

        it('登入成功且信箱已驗證時，應回傳 true 表明可以導航或處理後續', async () => {
            signInWithEmail.mockResolvedValueOnce({ emailVerified: true });

            const { result } = renderHook(() => useLogin());

            act(() => {
                result.current.state.setEmail('test@example.com');
                result.current.state.setPassword('pw1');
                result.current.state.setIsLoginMode(true);
            });

            let res;
            await act(async () => {
                res = await result.current.actions.handleEmailAuth();
            });

            expect(res).toBe(true);
        });

        it('登入失敗發生例外時，應捕捉錯誤、呼叫 showError 顯示登入失敗、設定 loading 為 false，並回傳 false', async () => {
            const errorMsg = 'Wrong Password';
            signInWithEmail.mockRejectedValueOnce(new Error(errorMsg));

            const { result } = renderHook(() => useLogin());

            act(() => {
                result.current.state.setEmail('test@example.com');
                result.current.state.setPassword('pw1');
                result.current.state.setIsLoginMode(true);
            });

            let res;
            await act(async () => {
                res = await result.current.actions.handleEmailAuth();
            });

            expect(mockShowError).toHaveBeenCalledWith("登入失敗", errorMsg);
            expect(result.current.state.loading).toBe(false);
            expect(res).toBe(false);
        });
    });

    describe('【註冊流程 (isLoginMode = false)】', () => {
        it('註冊成功後，應呼叫 sendVerification 發送驗證信、呼叫 showMailSend 提示、呼叫 signOutUser，接著切換回登入模式並回傳 false', async () => {
            signUpWithEmail.mockResolvedValueOnce();
            sendVerification.mockResolvedValueOnce();
            signOutUser.mockResolvedValueOnce();

            const { result } = renderHook(() => useLogin());

            act(() => {
                result.current.state.setEmail('test@example.com');
                result.current.state.setPassword('pw1');
                result.current.state.setConfirmPassword('pw1');
                result.current.state.setIsLoginMode(false);
            });

            let res;
            await act(async () => {
                res = await result.current.actions.handleEmailAuth();
            });

            expect(signUpWithEmail).toHaveBeenCalledWith('test@example.com', 'pw1');
            expect(sendVerification).toHaveBeenCalled();
            expect(mockShowMailSend).toHaveBeenCalledWith("註冊成功", "已發送驗證信至您的信箱，請點擊連結啟用帳號後再登入。");
            expect(signOutUser).toHaveBeenCalled();

            expect(result.current.state.isLoginMode).toBe(true);
            expect(res).toBe(false);
        });

        it('註冊失敗發生例外時，應捕捉錯誤、呼叫 showError 顯示註冊失敗、設定 loading 為 false，並回傳 false', async () => {
            const errorMsg = 'Email already in use';
            signUpWithEmail.mockRejectedValueOnce(new Error(errorMsg));

            const { result } = renderHook(() => useLogin());

            act(() => {
                result.current.state.setEmail('test@example.com');
                result.current.state.setPassword('pw1');
                result.current.state.setConfirmPassword('pw1');
                result.current.state.setIsLoginMode(false);
            });

            let res;
            await act(async () => {
                res = await result.current.actions.handleEmailAuth();
            });

            expect(mockShowError).toHaveBeenCalledWith("註冊失敗", errorMsg);
            expect(result.current.state.loading).toBe(false);
            expect(res).toBe(false);
        });
    });

    describe('【社群登入 (handleSocialLogin)】', () => {
        it('當 loginFunction 未提供時，應呼叫 showWarning 提示尚未實作，並回傳 null', async () => {
            const { result } = renderHook(() => useLogin());

            let res;
            await act(async () => {
                res = await result.current.actions.handleSocialLogin('Apple', undefined);
            });

            expect(mockShowWarning).toHaveBeenCalledWith("提示", "Apple 登入功能尚未實作");
            expect(res).toBeNull();
        });

        it('loginFunction 成功時，應設定 loading 狀態，最終回傳 loginFunction 的結果', async () => {
            const mockLoginFunc = jest.fn().mockResolvedValueOnce('GoogleUser123');
            const { result } = renderHook(() => useLogin());

            let res;
            await act(async () => {
                res = await result.current.actions.handleSocialLogin('Google', mockLoginFunc);
            });

            expect(mockLoginFunc).toHaveBeenCalled();
            expect(res).toBe('GoogleUser123');
            expect(result.current.state.loading).toBe(false);
        });

        it('loginFunction 失敗時，應捕捉錯誤、呼叫 showError，並回傳 null', async () => {
            const errorMsg = 'Google Login Cancelled';
            const mockLoginFunc = jest.fn().mockRejectedValueOnce(new Error(errorMsg));
            const { result } = renderHook(() => useLogin());

            let res;
            await act(async () => {
                res = await result.current.actions.handleSocialLogin('Google', mockLoginFunc);
            });

            expect(mockShowError).toHaveBeenCalledWith("Google 登入失敗", errorMsg);
            expect(res).toBeNull();
            expect(result.current.state.loading).toBe(false);
        });
    });

    describe('【忘記密碼 (handleForgotPassword)】', () => {
        it('未輸入電子郵件時，應呼叫 showWarning 提示輸入', async () => {
            const { result } = renderHook(() => useLogin());

            act(() => {
                result.current.state.setEmail('');
            });

            await act(async () => {
                await result.current.actions.handleForgotPassword();
            });

            expect(mockShowWarning).toHaveBeenCalledWith("提示", "請輸入電子郵件以接收重設密碼信");
        });

        it('發送重設信成功時，應呼叫 sendResetPasswordEmail 並透過 showMailSend 提示成功', async () => {
            sendResetPasswordEmail.mockResolvedValueOnce();

            const { result } = renderHook(() => useLogin());

            act(() => {
                result.current.state.setEmail('test@example.com');
            });

            await act(async () => {
                await result.current.actions.handleForgotPassword();
            });

            expect(sendResetPasswordEmail).toHaveBeenCalledWith('test@example.com');
            expect(mockShowMailSend).toHaveBeenCalledWith("已發送", "重設密碼信件已發送至您的電子郵件");
        });

        it('發送重設信發生例外時，應捕捉錯誤並呼叫 showError 顯示發送失敗', async () => {
            const errorMsg = 'User not found';
            sendResetPasswordEmail.mockRejectedValueOnce(new Error(errorMsg));

            const { result } = renderHook(() => useLogin());

            act(() => {
                result.current.state.setEmail('test@example.com');
            });

            await act(async () => {
                await result.current.actions.handleForgotPassword();
            });

            expect(mockShowError).toHaveBeenCalledWith("發送失敗", errorMsg);
        });
    });
});
