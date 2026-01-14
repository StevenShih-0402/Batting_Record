// src/hooks/auth/useAuth.js
// 身分管理 (你是誰？你登入了沒？)
import { useState, useEffect } from 'react';
import { auth } from '../../services/firebaseService';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setIsReady(true);
            } else {
                // 如果沒有使用者，自動觸發匿名登入
                try {
                    const result = await signInAnonymously(auth);
                    setUser(result.user);
                } catch (error) {
                    console.error("匿名登入失敗", error);
                } finally {
                    setIsReady(true);
                }
            }
        });
        return unsubscribe;
    }, []);

    return { user, isReady };
};