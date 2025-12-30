// src/hooks/usePitchData.js
// Firebase 的 CRUD，與彙整打席紀錄的資料庫操作
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { initAuthAndGetRecords, savePitchRecord, deletePitchRecord, updatePitchRecord } from '../../services/pitchService'; 
import { saveAtBatSummaryAndClearRecords } from '../../services/atBatSummaryService';

export const usePitchData = (user, authReady) => {
    const [rawRecords, setRawRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    // 監聽資料
    useEffect(() => {
        if (!authReady || !user) return;
        
        const unsubscribe = initAuthAndGetRecords(setRawRecords, setLoading, user);
        return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
    }, [user, authReady]);

    // 操作函式 (CRUD)
    // 1. 儲存打席球數
    const handleSavePitch = async (data) => {
        try { return await savePitchRecord(data, user); }
        catch (e) { Alert.alert("錯誤", e.message); throw e; }
    };

    // 2. 刪除打席球數
    const handleDeletePitch = async (id) => {
        try { 
            await deletePitchRecord(id); 
            return true;                // 確保有回傳 true
        }
        catch (e) { Alert.alert("錯誤", e.message); }
    };

    // 3. 修改打席球數
    const handleUpdatePitch = async (id, updatedData) => {
        try { await updatePitchRecord(id, updatedData); return true; }
        catch (e) { Alert.alert("更新失敗", e.message); return false; }
    };

    // 自訂業務邏輯
    // 4. 彙整打席資料：只負責存檔與清空
    const handleSaveSummary = async (finalPayload) => {
        if (!user?.uid) return;

        // 增加這行防禦：確保 payload 存在，且裡面的紀錄不是 undefined
        if (!finalPayload || !finalPayload.pitchRecords) {
            console.warn("Payload 或 pitchRecords 丟失");
            return;
        }

        try {
            // ✅ 取得目前所有球的 ID
            const recordIds = rawRecords.map(r => r.id);

            // 直接呼叫封裝好的 Firebase Service
            // 確保 saveAtBatSummaryAndClearRecords 內部已經處理了 addDoc 邏輯
            await saveAtBatSummaryAndClearRecords(finalPayload, user, recordIds);
            return true;
        } catch (e) { 
            Alert.alert("彙整失敗", e.message); 
            throw e; 
        }
    };

    return { rawRecords, loading, handleSavePitch, handleDeletePitch, handleUpdatePitch, handleSaveSummary };
};