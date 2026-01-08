// src/services/atBatService.js
// 將打席過程中的球點紀錄，轉換為最終儲存到資料庫的資料格式

/**
 * @param {string} title - 使用者輸入的打席標題 (新加入)
 * @param {string} note - 使用者輸入的備註
 * @param {Array} records - 原始投球紀錄數組
 */
export const formatAtBatData = (title, note, records = []) => {
    const safeRecords = Array.isArray(records) ? records : [];
    
    // 取得最後一球的狀態 (目前的球數)
    const latest = safeRecords.length > 0 ? safeRecords[0] : { runningBalls: 0, runningStrikes: 0 };
    
    // 取得第一球的時間作為開始時間 (通常紀錄在數組最後端)
    const firstPitch = safeRecords.length > 0 ? safeRecords[safeRecords.length - 1] : null;

    // 判斷打席最終結果 (這裡可以根據你的邏輯擴充，例如三振、保送、或是單純結束)
    let outcome = '已彙整';
    if (latest.runningStrikes >= 3) outcome = '三振';
    if (latest.runningBalls >= 4) outcome = '保送';

    return {
        atBatLabel: title || '未命名打席', // ✅ 新增：存入使用者自訂的標題
        finalOutcome: outcome,           // 優化：根據球數給予初步結果
        summaryNote: note || '',
        totalPitches: safeRecords.length,
        pitchRecords: safeRecords.map(r => ({
            pitchType: r?.pitchType || '',
            result: r?.result || '',
            speed: Number(r?.speed) || 0,
            cellNumber: Number(r?.cellNumber) || 0,
            gridX: r?.gridX || 0,         // 確保座標也被存入摘要，方便未來回放
            gridY: r?.gridY || 0,
            note: r?.note || '',
        })),
        finalBalls: latest?.runningBalls || 0,
        finalStrikes: latest?.runningStrikes || 0,
        startAt: firstPitch?.createdAt || new Date(), 
        updatedAt: new Date(),            // 增加更新時間紀錄
    };
};