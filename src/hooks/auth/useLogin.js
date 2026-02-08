// src/hooks/auth/useLogin.js
// 登入與註冊的業務邏輯

import { useState } from 'react';
import {
    signInWithGoogle,
    signInAsGuest,
    signInWithEmail,
    signUpWithEmail,
    sendVerification, // Added
    signOutUser,
} from '../../services/authService';
import { useAlert } from '../../context/AlertContext';

export const useLogin = () => {
    const { showError, showWarning, showMailSend } = useAlert(); // 1. 取得 alert 方法，加入 showMailSend

    // 定義狀態變數
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // 新增確認密碼
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 新增顯示確認密碼

    const handleEmailAuth = async () => {
        if (!email || !password) {
            showWarning("提示", "請輸入電子郵件和密碼");
            return false;
        }

        // 註冊時檢查確認密碼
        if (!isLoginMode) {
            if (password !== confirmPassword) {
                showWarning("錯誤", "兩次輸入的密碼不一致");
                return false;
            }
        }

        setLoading(true);
        try {
            if (isLoginMode) {
                // --- 登入流程 ---
                const user = await signInWithEmail(email, password);

                // 如果還沒用驗證信開通，跳出警告
                if (!user.emailVerified) {
                    showWarning("未驗證", "您的電子郵件尚未驗證，請先驗證信箱後再登入。");
                    return false;
                }

                // 驗證通過
                return true;
            } else {
                // --- 註冊流程 ---
                await signUpWithEmail(email, password);

                // 註冊成功後，發送驗證信
                await sendVerification();

                // 跳出驗證信通知
                showMailSend("註冊成功", "已發送驗證信至您的信箱，請點擊連結啟用帳號後再登入。");

                // 登出用戶，強迫使用者不能在未驗證前登入
                await signOutUser();

                setIsLoginMode(true); // 切換回登入模式
                return false; // 不導航
            }
        } catch (error) {
            setLoading(false);
            showError(isLoginMode ? "登入失敗" : "註冊失敗", error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (providerName, loginFunction) => {

        // 檢查登入功能是否實作 (方便後續擴充)
        if (!loginFunction) {
            showWarning("提示", `${providerName} 登入功能尚未實作`);
            return null;
        }

        setLoading(true);
        try {
            const result = await loginFunction();
            setLoading(false);
            return result;
        } catch (error) {
            setLoading(false);
            showError(`${providerName} 登入失敗`, error.message);
            return null;
        }
    };

    return {
        state: {
            loading,
            email,
            setEmail,
            password,
            setPassword,
            confirmPassword,       // Export
            setConfirmPassword,    // Export
            isLoginMode,
            setIsLoginMode,
            showPassword,
            setShowPassword,
            showConfirmPassword,     // Export
            setShowConfirmPassword   // Export
        },
        actions: {
            handleEmailAuth,
            handleSocialLogin,
            signInWithGoogle, // Export these for easy access in UI
            signInAsGuest
        }
    };
};
