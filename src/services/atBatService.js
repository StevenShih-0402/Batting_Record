// src/services/atBatService.js
// 將打席過程中的球點紀錄，轉換為最終儲存到資料庫的資料格式

export const formatAtBatData = (note, records = []) => {
    const safeRecords = Array.isArray(records) ? records : [];
    
    // 取得最後一球的狀態 (目前的球數)
    const latest = safeRecords.length > 0 ? safeRecords[0] : { runningBalls: 0, runningStrikes: 0 };
    
    // 取得第一球的時間作為開始時間 (通常紀錄在數組最後端)
    const firstPitch = safeRecords.length > 0 ? safeRecords[safeRecords.length - 1] : null;

    return {
        finalOutcome: '已彙整',
        summaryNote: note || '',
        totalPitches: safeRecords.length,
        pitchRecords: safeRecords.map(r => ({
            pitchType: r?.pitchType || '',
            result: r?.result || '',
            speed: Number(r?.speed) || 0,
            cellNumber: Number(r?.cellNumber) || 0,
            note: r?.note || '',
        })),
        finalBalls: latest?.runningBalls || 0,
        finalStrikes: latest?.runningStrikes || 0,
        startAt: firstPitch?.createdAt || new Date(), 
    };
};