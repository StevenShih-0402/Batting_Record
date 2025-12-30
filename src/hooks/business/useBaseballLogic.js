// src/hooks/useBaseballLogic.js
// 棒球的球數判決業務邏輯 (ex. 三振、保送、界外的計算)
import { useMemo } from 'react';

export const useBaseballLogic = (rawRecords) => {
    // 使用 useMemo 確保只有當原始資料變動時才重新計算
    return useMemo(() => {
        // 如果 rawRecords 不存在，直接回傳初始狀態，避免後續陣列操作崩潰
        if (!rawRecords) {
            return { atBatRecords: [], atBatStatus: { balls: 0, strikes: 0, isFinished: false, atBatRecordsCount: 0 } };
        }
        
        // 1. 排序：時間升序
        const sortedAsc = [...rawRecords].sort(
            (a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
        );

        let balls = 0;
        let strikes = 0;
        let isAtBatFinished = false;

        // 2. 逐球計算狀態
        const processed = sortedAsc.map(record => {
            if (isAtBatFinished) {
                return { ...record, runningBalls: balls, runningStrikes: strikes };
            }

            let atBatEndOutcome = null;
            const res = record.result;

            if (res === '好球') {
                if (strikes < 2) strikes++;
                else { strikes++; atBatEndOutcome = '三振'; isAtBatFinished = true; }
            } else if (res === '壞球') {
                if (balls < 3) balls++;
                else { balls++; atBatEndOutcome = '保送'; isAtBatFinished = true; }
            } else if (res === '界外') {
                if (strikes < 2) strikes++;
            } else if (res === '打擊出去') {
                atBatEndOutcome = '打擊出去';
                isAtBatFinished = true;
            }

            return {
                ...record,
                runningBalls: balls,
                runningStrikes: strikes,
                atBatEndOutcome
            };
        });

        // 3. 轉換為顯示格式 (降序，最新在頂部)
        const displayRecords = [...processed].reverse();

        return {
            atBatRecords: displayRecords || [],
            atBatStatus: {
                balls,
                strikes,
                isFinished: isAtBatFinished,
                lastResult: displayRecords.length > 0 ? displayRecords[0].result : null,
                atBatRecordsCount: displayRecords.length,
            }
        };
    }, [rawRecords]);
};