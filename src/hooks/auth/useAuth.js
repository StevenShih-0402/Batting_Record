// src/hooks/useAuth.js
// 身分管理 (你是誰？你登入了沒？)
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { firebaseStatus } from '../../services/firebaseService';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!firebaseStatus.isReady) return;

        const unsubscribe = onAuthStateChanged(firebaseStatus.auth, async (u) => {
            if (!u) {
                try {
                    await signInAnonymously(firebaseStatus.auth);
                } catch (err) {
                    console.error("匿名登入失敗:", err);
                }
            } else {
                setUser(u);
                setIsReady(true);
            }
        });

        return () => unsubscribe();
    }, [firebaseStatus.isReady]);

    return { user, isReady };
};