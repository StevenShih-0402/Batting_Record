// src/hooks/api/useHistoryData.js
// 從 Firebase 讀取真實的打席彙整資料
import { useState, useEffect } from 'react';
import { getAtBatHistory } from '../../services/atBatSummaryService';
import { useAuth } from '../auth/useAuth';

export const useHistoryData = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, isReady } = useAuth();

    useEffect(() => {
        if (!isReady) return;
        if (!user || user.isAnonymous) {
            setHistory([]);
            setLoading(false);
            return;
        }

        const unsubscribe = getAtBatHistory(user.uid, setHistory, setLoading);
        return () => unsubscribe && unsubscribe();
    }, [user, isReady]);

    return { history, loading };
};