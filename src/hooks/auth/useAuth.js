// src/hooks/auth/useAuth.js
// 身分管理 (你是誰？你登入了沒？)
import { useState, useEffect } from 'react';
import { auth } from '../../services/firebaseService';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

/**
 * 標準 Expo 匿名登入處理：
 * 1. Firebase Auth 使用 AsyncStorage persistence - 自動保留登入狀態
 * 2. 匿名用戶不能登出（authService.signOutUser 會阻擋）
 * 3. 只有正式帳號登出後才會觸發新的匿名登入
 */

// 模組級別的 flag，所有使用 useAuth 的組件共享
let isSigningIn = false;
let signInTimeout = null;

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            // 清除任何待處理的匿名登入
            if (signInTimeout) {
                clearTimeout(signInTimeout);
                signInTimeout = null;
            }

            if (currentUser) {
                // 有使用者時，重置 flag 並更新狀態
                isSigningIn = false;
                setUser(currentUser);
                setIsReady(true);
            } else {
                // 沒有使用者時，檢查是否正在登入中
                if (isSigningIn) {
                    console.log('已在登入中，跳過');
                    return;
                }

                // 使用 debounce 延遲匿名登入，避免快速切換
                // 給 Firestore listeners 時間清理
                signInTimeout = setTimeout(async () => {
                    if (isSigningIn) return; // 雙重檢查

                    isSigningIn = true;
                    console.log('觸發匿名登入...');

                    try {
                        await signInAnonymously(auth);
                        // 不需要手動 setUser，onAuthStateChanged 會再次觸發並處理
                    } catch (error) {
                        console.error("匿名登入失敗", error);
                        isSigningIn = false;
                        setIsReady(true);
                    }
                }, 300); // 延遲 300ms
            }
        });

        return () => {
            unsubscribe();
            if (signInTimeout) {
                clearTimeout(signInTimeout);
                signInTimeout = null;
            }
        };
    }, []);

    return { user, isReady };
};