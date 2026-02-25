/**
 * @param {string} title - 使用者輸入的打席標題
 * @param {string} note - 使用者輸入的備註
 * @param {Array} records - 原始投球紀錄數組
 * @param {Object} customSummaryValues - 自訂打席彙整欄位的值 { [fieldId]: value }
 */
export const formatAtBatData = (title, note, records = [], customSummaryValues = {}) => {
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
        atBatLabel: title || '未命名打席',
        finalOutcome: outcome,
        summaryNote: note || '',
        customSummaryValues,              // 自訂打席彙整欄位值
        totalPitches: safeRecords.length,
        pitchRecords: safeRecords.map(r => ({
            pitchType: r?.pitchType || '',
            result: r?.result || '',
            speed: Number(r?.speed) || 0,
            cellNumber: Number(r?.cellNumber) || 0,
            gridX: r?.gridX || 0,
            gridY: r?.gridY || 0,
            note: r?.note || '',
            customPitchValues: r?.customPitchValues || {}, // 自訂打席備註欄位值
        })),
        finalBalls: latest?.runningBalls || 0,
        finalStrikes: latest?.runningStrikes || 0,
        startAt: firstPitch?.createdAt || new Date(),
        updatedAt: new Date(),
    };
};
