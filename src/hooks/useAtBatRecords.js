// src/hooks/useAtBatRecords.js
// 核心業務邏輯 (重要!)
import { useAuth } from './auth/useAuth';
import { usePitchData } from './api/usePitchData';
import { useBaseballLogic } from './business/useBaseballLogic';

const useAtBatRecords = () => {
    // 1. 處理身分
    const { user, isReady: authReady } = useAuth();

    // 2. 處理原始數據與 CRUD
    const { 
        rawRecords, loading, 
        handleSavePitch, handleDeletePitch, handleUpdatePitch, handleSaveSummary 
    } = usePitchData(user, authReady);

    // 3. 注入棒球邏輯計算 (傳入原始資料，得到算好的結果)
    const { atBatRecords, atBatStatus } = useBaseballLogic(rawRecords);

    // 4. 回傳 UI 所需的一切
    return {
        loading,
        atBatRecords,
        atBatStatus,
        handleSavePitch,
        handleDeletePitch,
        handleUpdatePitch,
        handleSaveSummary: (data) => handleSaveSummary(data, atBatRecords), // 預封裝資料
        userReady: authReady,
    };
};

export default useAtBatRecords;