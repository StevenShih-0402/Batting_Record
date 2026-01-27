import { useState } from 'react';
import { Alert } from 'react-native';
import {
    signInWithGoogle,
    signInAsGuest,
    signInWithEmail,
    signUpWithEmail,
} from '../services/authService';

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const handleEmailAuth = async () => {
        if (!email || !password) {
            Alert.alert("提示", "請輸入電子郵件和密碼");
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
            Alert.alert(isLoginMode ? "登入失敗" : "註冊失敗", error.message);
        }
    };

    const handleSocialLogin = async (providerName, loginFunction) => {
        if (!loginFunction) {
            Alert.alert("提示", `${providerName} 登入功能尚未實作`);
            return;
        }

        setLoading(true);
        try {
            await loginFunction();
            setLoading(false);
        } catch (error) {
            setLoading(false);
            Alert.alert(`${providerName} 登入失敗`, error.message);
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
