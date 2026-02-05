// src/hooks/api/useHistoryData.js
// 從 Firebase 讀取真實的打席彙整資料
import { useState, useEffect } from 'react';
import { getAtBatHistory } from '../../services/atBatSummaryService';
import { useAuth } from '../auth/useAuth';

export const useHistoryData = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, isReady } = useAuth();

    // 只取出需要的 uid，避免整個 user 物件變化導致重新執行
    const userId = user?.uid;
    const isAnonymous = user?.isAnonymous;

    useEffect(() => {
        if (!isReady) return;

        // 匿名用戶或未登入，清空歷史
        if (!userId || isAnonymous) {
            setHistory([]);
            setLoading(false);
            return;
        }

        // 正式用戶，訂閱歷史資料
        const unsubscribe = getAtBatHistory(userId, setHistory, setLoading);
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [userId, isAnonymous, isReady]); // 只依賴 uid 和 isAnonymous，不依賴整個 user

    return { history, loading };
};