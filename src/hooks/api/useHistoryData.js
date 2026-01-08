// src/hooks/api/useHistoryData.js
// 從 Firebase 讀取真實的打席彙整資料
import { useState, useEffect } from 'react';
import { getAtBatHistory } from '../../services/atBatSummaryService';
import { getAuth } from 'firebase/auth';

export const useHistoryData = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) return;

        const unsubscribe = getAtBatHistory(user.uid, setHistory, setLoading);
        return () => unsubscribe && unsubscribe();
    }, [user]);

    return { history, loading };
};