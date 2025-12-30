// src/hooks/useAtBatRecords.js
// 核心業務邏輯 (重要!)
import { useAuth } from './auth/useAuth';
import { usePitchData } from './api/usePitchData';
import { useBaseballLogic } from './business/useBaseballLogic';

import { formatAtBatData } from '../services/atBatService';

const useAtBatRecords = () => {
    // 1. 處理身分
    const { user, isReady: authReady } = useAuth();

    // 2. 處理原始數據與 CRUD
    const { 
        rawRecords, loading, 
        handleSavePitch, handleDeletePitch, handleUpdatePitch, handleSaveSummary: baseSaveSummary 
    } = usePitchData(user, authReady);

    // 3. 注入棒球邏輯計算 (傳入原始資料，得到算好的結果)
    const { atBatRecords, atBatStatus } = useBaseballLogic(rawRecords);

    // 4. 在這裡加工要儲存的資料
    const handleSaveSummaryAction = async (uiData) => {
        // uiData 是 { summaryNote: "..." }
        const finalPayload = formatAtBatData(uiData.summaryNote, atBatRecords);
        // 呼叫 API 層存入大禮包
        return await baseSaveSummary(finalPayload);
    };

    // 5. 回傳 UI 所需的一切
    return {
        loading,
        atBatRecords,
        atBatStatus,
        handleSavePitch,
        handleDeletePitch,
        handleUpdatePitch,
        handleSaveSummary: handleSaveSummaryAction, // UI 層會拿到這個加工過的版本
        userReady: authReady,
    };
};

export default useAtBatRecords;