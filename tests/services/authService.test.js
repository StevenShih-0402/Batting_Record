// Mock Modules early
jest.mock('@react-native-google-signin/google-signin', () => ({
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn().mockResolvedValue(true),
        signIn: jest.fn().mockResolvedValue({ data: { idToken: 'fake_token' } }),
        signOut: jest.fn().mockResolvedValue(),
    }
}));

jest.mock('firebase/app', () => ({
    getApps: jest.fn(() => []),
    getApp: jest.fn(),
    initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
    GoogleAuthProvider: { credential: jest.fn() },
    signInWithCredential: jest.fn(),
    linkWithCredential: jest.fn(),
    signInAnonymously: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    updateProfile: jest.fn(),
    updatePassword: jest.fn(),
    deleteUser: jest.fn(),
    sendEmailVerification: jest.fn(),
    unlink: jest.fn(),
    initializeAuth: jest.fn(),
    getReactNativePersistence: jest.fn(),
    getAuth: jest.fn(),
    signOut: jest.fn(),
}));

jest.mock('../../src/services/firebaseService', () => ({
    auth: {
        currentUser: null,
        signOut: jest.fn(),
    }
}));

import { signInWithGoogle, signOutUser, signUpWithEmail, signInWithEmail, updateUserProfile } from '../../src/services/authService';
import { auth } from '../../src/services/firebaseService';
import { signInWithCredential, linkWithCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

describe('authService 測試', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        auth.currentUser = null;
    });

    describe('【Google 登入流程】', () => {
        it('Google 登入並成功綁定匿名帳號', async () => {
            auth.currentUser = { isAnonymous: true };
            linkWithCredential.mockResolvedValue({ user: { uid: 'u1' } });

            const result = await signInWithGoogle();
            expect(linkWithCredential).toHaveBeenCalled();
            expect(result.isUpgrade).toBe(true);
        });

        it('Google 帳號既有資料時切換登入', async () => {
            auth.currentUser = { isAnonymous: true };
            const error = new Error('Already in use');
            error.code = 'auth/credential-already-in-use';
            linkWithCredential.mockRejectedValue(error);
            signInWithCredential.mockResolvedValue({ user: { uid: 'u1' } });

            const result = await signInWithGoogle();
            expect(signInWithCredential).toHaveBeenCalled();
            expect(result.isUpgrade).toBe(false);
        });
    });

    describe('【Email 登入與註冊】', () => {
        it('Email 登入驗證檢查 - 未驗證應登出', async () => {
            signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u1', emailVerified: false } });

            const user = await signInWithEmail('test@test.com', 'password');
            expect(auth.signOut).toHaveBeenCalled();
            expect(user.uid).toBe('u1');
        });

        it('Email 註冊錯誤處理', async () => {
            const error = new Error('In use');
            error.code = 'auth/email-already-in-use';
            createUserWithEmailAndPassword.mockRejectedValue(error);

            await expect(signUpWithEmail('test@test.com', 'pwd')).rejects.toThrow('此 Email 已被註冊');
        });
    });

    describe('【個人資料管理】', () => {
        it('更新顯示名稱', async () => {
            auth.currentUser = { uid: 'u1' };
            await updateUserProfile({ displayName: 'New Name' });
            expect(updateProfile).toHaveBeenCalled();
        });
    });

    describe('【登出邏輯】', () => {
        it('匿名用戶禁止登出', async () => {
            auth.currentUser = { isAnonymous: true };
            const result = await signOutUser();
            expect(result).toBe(false);
            expect(auth.signOut).not.toHaveBeenCalled();
        });
    });
});
