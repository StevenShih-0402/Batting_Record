// src/hooks/auth/useAuth.js
// 身分管理 (你是誰？你登入了沒？)
import { useState, useEffect, useRef } from 'react';
import { auth } from '../../services/firebaseService';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

/**
 * 標準 Expo 匿名登入處理：
 * 1. Firebase Auth 使用 AsyncStorage persistence - 自動保留登入狀態
 * 2. 匿名用戶不能登出（authService.signOutUser 會阻擋）
 * 3. 只有正式帳號登出後才會觸發新的匿名登入
 */
export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isReady, setIsReady] = useState(false);

    // 防止多次呼叫 signInAnonymously
    const isSigningIn = useRef(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // 重置 flag
                isSigningIn.current = false;
                setUser(currentUser);
                setIsReady(true);
            } else {
                // 沒有使用者時，自動觸發匿名登入
                // 使用 flag 防止多次觸發
                if (isSigningIn.current) {
                    console.log('已在登入中，跳過');
                    return;
                }

                isSigningIn.current = true;
                try {
                    const result = await signInAnonymously(auth);
                    setUser(result.user);
                } catch (error) {
                    console.error("匿名登入失敗", error);
                    isSigningIn.current = false;
                } finally {
                    setIsReady(true);
                }
            }
        });
        return unsubscribe;
    }, []);

    return { user, isReady };
};