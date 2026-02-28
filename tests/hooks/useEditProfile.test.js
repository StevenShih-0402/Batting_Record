// tests/hooks/useEditProfile.test.js
import { renderHook, act } from '@testing-library/react-native';
import { useEditProfile } from '../../src/hooks/useEditProfile';
import { useAlert } from '../../src/context/AlertContext';
import { auth } from '../../src/services/firebaseService';
import {
    reauthenticateUser,
    updateUserProfile,
    updateUserPassword,
    deleteUserAccount,
    linkGoogleAccount,
    unlinkGoogleAccount,
    setPostLoginRedirect
} from '../../src/services/authService';
import { uploadProfileImage } from '../../src/services/storageService';
import * as ImagePicker from 'expo-image-picker';

// Mock dependencies
jest.mock('../../src/context/AlertContext', () => ({
    useAlert: jest.fn(),
}));

jest.mock('../../src/services/firebaseService', () => ({
    auth: {
        currentUser: null,
    },
}));

jest.mock('../../src/services/authService', () => ({
    reauthenticateUser: jest.fn(),
    updateUserProfile: jest.fn(),
    updateUserPassword: jest.fn(),
    deleteUserAccount: jest.fn(),
    linkGoogleAccount: jest.fn(),
    unlinkGoogleAccount: jest.fn(),
    setPostLoginRedirect: jest.fn(),
}));

jest.mock('../../src/services/storageService', () => ({
    uploadProfileImage: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
    requestMediaLibraryPermissionsAsync: jest.fn(),
    launchImageLibraryAsync: jest.fn(),
    MediaTypeOptions: { Images: 'Images' },
}));

describe('useEditProfile 測試', () => {
    const mockNavigation = { goBack: jest.fn() };
    const mockShowError = jest.fn();
    const mockShowSuccess = jest.fn();
    const mockShowWarning = jest.fn();
    const mockShowInfo = jest.fn();

    const mockUser = {
        uid: 'user123',
        displayName: 'Old Name',
        photoURL: 'https://old.photo',
        providerData: [{ providerId: 'password' }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        auth.currentUser = mockUser;

        useAlert.mockReturnValue({
            showError: mockShowError,
            showSuccess: mockShowSuccess,
            showWarning: mockShowWarning,
            showInfo: mockShowInfo,
        });
    });

    describe('【初始化 (Initialization)】', () => {
        it('應該根據目前登入的使用者資料初始化表單狀態', () => {
            const { result } = renderHook(() => useEditProfile(mockNavigation));

            expect(result.current.form.displayName).toBe(mockUser.displayName);
            expect(result.current.form.photoURL).toBe(mockUser.photoURL);
            expect(result.current.hasPasswordProvider).toBe(true);
            expect(result.current.isGoogleUser).toBe(false);
        });

        it('應該正確辨識 Google 用戶', () => {
            auth.currentUser = {
                ...mockUser,
                providerData: [{ providerId: 'google.com' }],
            };
            const { result } = renderHook(() => useEditProfile(mockNavigation));

            expect(result.current.isGoogleUser).toBe(true);
            expect(result.current.hasPasswordProvider).toBe(false);
        });
    });

    describe('【圖片選取 (pickImage)】', () => {
        it('當授予權限且選取圖片成功時，應更新 photoURL 狀態', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });
            ImagePicker.launchImageLibraryAsync.mockResolvedValue({
                canceled: false,
                assets: [{ uri: 'file://new-image.jpg' }],
            });

            const { result } = renderHook(() => useEditProfile(mockNavigation));

            await act(async () => {
                await result.current.form.pickImage();
            });

            expect(result.current.form.photoURL).toBe('file://new-image.jpg');
        });

        it('當權限不足時，應顯示警告訊息', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'denied' });

            const { result } = renderHook(() => useEditProfile(mockNavigation));

            await act(async () => {
                await result.current.form.pickImage();
            });

            expect(mockShowWarning).toHaveBeenCalledWith("權限不足", expect.any(String));
            expect(result.current.form.photoURL).toBe(mockUser.photoURL);
        });
    });

    describe('【儲存變更 (handleSave)】', () => {
        it('僅修改名稱時，應正確呼叫 updateUserProfile 並顯示成功訊息', async () => {
            updateUserProfile.mockResolvedValue();
            const { result } = renderHook(() => useEditProfile(mockNavigation));

            act(() => {
                result.current.form.setDisplayName('New Name');
            });

            await act(async () => {
                await result.current.actions.handleSave();
            });

            expect(updateUserProfile).toHaveBeenCalledWith({ displayName: 'New Name' });
            expect(mockShowSuccess).toHaveBeenCalledWith("成功", "個人資料已更新", expect.any(Array));
        });

        it('修改照片為本地路徑時，儲存前應先呼叫 uploadProfileImage', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });
            ImagePicker.launchImageLibraryAsync.mockResolvedValue({
                canceled: false,
                assets: [{ uri: 'file://local.jpg' }],
            });
            uploadProfileImage.mockResolvedValue('https://uploaded.photo');
            updateUserProfile.mockResolvedValue();

            const { result } = renderHook(() => useEditProfile(mockNavigation));

            await act(async () => {
                await result.current.form.pickImage();
            });

            await act(async () => {
                await result.current.actions.handleSave();
            });

            expect(uploadProfileImage).toHaveBeenCalledWith('file://local.jpg', mockUser.uid);
            expect(updateUserProfile).toHaveBeenCalledWith({ photoURL: 'https://uploaded.photo' });
        });

        it('修改密碼時，若未填寫當前密碼（且為 Password 用戶），應顯示警告訊息', async () => {
            const { result } = renderHook(() => useEditProfile(mockNavigation));

            act(() => {
                result.current.form.setPassword('new-password');
            });

            await act(async () => {
                await result.current.actions.handleSave();
            });

            expect(mockShowWarning).toHaveBeenCalledWith("驗證失敗", expect.any(String));
            expect(reauthenticateUser).not.toHaveBeenCalled();
        });

        it('修改密碼時，重驗證失敗時應顯示錯誤訊息', async () => {
            reauthenticateUser.mockRejectedValue(new Error('Wrong password'));
            const { result } = renderHook(() => useEditProfile(mockNavigation));

            act(() => {
                result.current.form.setPassword('new-password');
                result.current.form.setCurrentPassword('wrong-old');
            });

            await act(async () => {
                await result.current.actions.handleSave();
            });

            expect(reauthenticateUser).toHaveBeenCalledWith('wrong-old');
            expect(mockShowError).toHaveBeenCalledWith("驗證失敗", expect.any(String));
            expect(updateUserPassword).not.toHaveBeenCalled();
        });

        it('重驗證與密碼更新皆成功後，應清空密碼欄位並顯示成功訊息', async () => {
            reauthenticateUser.mockResolvedValue();
            updateUserPassword.mockResolvedValue();
            const { result } = renderHook(() => useEditProfile(mockNavigation));

            act(() => {
                result.current.form.setPassword('new-password');
                result.current.form.setCurrentPassword('correct-old');
            });

            await act(async () => {
                await result.current.actions.handleSave();
            });

            expect(updateUserPassword).toHaveBeenCalledWith('new-password');
            expect(result.current.form.password).toBe('');
            expect(result.current.form.currentPassword).toBe('');
            expect(mockShowSuccess).toHaveBeenCalled();
        });

        it('當 error 為 requires-recent-login 時，應正確提示', async () => {
            updateUserProfile.mockRejectedValue({ code: 'auth/requires-recent-login' });
            const { result } = renderHook(() => useEditProfile(mockNavigation));

            act(() => {
                result.current.form.setDisplayName('New Name');
            });

            await act(async () => {
                await result.current.actions.handleSave();
            });

            expect(mockShowWarning).toHaveBeenCalledWith("需要重新登入", expect.any(String));
        });
    });

    describe('【帳號連結操作】', () => {
        it('連結 Google 成功後應顯示成功訊息並返回', async () => {
            linkGoogleAccount.mockResolvedValue();
            const { result } = renderHook(() => useEditProfile(mockNavigation));

            await act(async () => {
                await result.current.actions.handleLinkGoogle();
            });

            expect(linkGoogleAccount).toHaveBeenCalled();
            expect(mockShowSuccess).toHaveBeenCalledWith("成功", expect.any(String), expect.any(Array));
        });

        it('引發解除連結彈窗，確認後應執行解連', async () => {
            auth.currentUser = { ...mockUser, providerData: [{ providerId: 'google.com' }] };
            unlinkGoogleAccount.mockResolvedValue();
            const { result } = renderHook(() => useEditProfile(mockNavigation));

            await act(async () => {
                result.current.actions.handleUnlinkGoogle();
            });

            expect(mockShowWarning).toHaveBeenCalledWith("解除連結", expect.any(String), expect.any(Array));

            // 模擬點擊確認解除
            const confirmBtn = mockShowWarning.mock.calls[0][2][1];
            await act(async () => {
                await confirmBtn.onPress();
            });

            expect(unlinkGoogleAccount).toHaveBeenCalled();
            expect(mockShowSuccess).toHaveBeenCalled();
        });
    });

    describe('【帳號刪除】', () => {
        it('應彈波警告並在確認後刪除帳號', async () => {
            deleteUserAccount.mockResolvedValue();
            const { result } = renderHook(() => useEditProfile(mockNavigation));

            act(() => {
                result.current.actions.handleDeleteAccount();
            });

            expect(mockShowWarning).toHaveBeenCalledWith("危險操作", expect.any(String), expect.any(Array));

            const confirmBtn = mockShowWarning.mock.calls[0][2][1];
            await act(async () => {
                await confirmBtn.onPress();
            });

            expect(setPostLoginRedirect).toHaveBeenCalledWith('Profile');
            expect(deleteUserAccount).toHaveBeenCalled();
            expect(mockShowSuccess).toHaveBeenCalledWith("帳號已刪除");
        });
    });
});
