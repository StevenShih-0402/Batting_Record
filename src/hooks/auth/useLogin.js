// src/hooks/auth/useLogin.js
// 登入與註冊的業務邏輯

import { useState } from 'react';
import {
    signInWithGoogle,
    signInAsGuest,
    signInWithEmail,
    signUpWithEmail,
} from '../../services/authService';
import { useAlert } from '../../context/AlertContext';

export const useLogin = () => {
    const { showError, showWarning } = useAlert(); // 1. 取得 alert 方法

    // 定義狀態變數
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const handleEmailAuth = async () => {
        if (!email || !password) {
            showWarning("提示", "請輸入電子郵件和密碼");
            return;
        }
        setLoading(true);
        try {
            if (isLoginMode) {
                await signInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            showError(isLoginMode ? "登入失敗" : "註冊失敗", error.message);
        }
    };

    const handleSocialLogin = async (providerName, loginFunction) => {
        if (!loginFunction) {
            showWarning("提示", `${providerName} 登入功能尚未實作`);
            return;
        }

        setLoading(true);
        try {
            await loginFunction();
            setLoading(false);
        } catch (error) {
            setLoading(false);
            showError(`${providerName} 登入失敗`, error.message);
        }
    };

    return {
        state: {
            loading,
            email,
            setEmail,
            password,
            setPassword,
            isLoginMode,
            setIsLoginMode,
            showPassword,
            setShowPassword
        },
        actions: {
            handleEmailAuth,
            handleSocialLogin,
            signInWithGoogle, // Export these for easy access in UI
            signInAsGuest
        }
    };
};
