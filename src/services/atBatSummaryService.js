// src/services/atBatSummaryService.js
import { collection, addDoc, serverTimestamp, doc, writeBatch } from 'firebase/firestore';
import { db, firebaseStatus } from './firebaseService';

/**
 * 4. 按下「結束打席」的時候彙整紀錄
 * 包含：寫入總結、批量刪除原始逐球紀錄
 */
export const saveAtBatSummaryAndClearRecords = async (summaryData, user, recordIds = []) => {
    // 在函式執行時才抓取路徑，避免循環依賴
    const pitchPath = firebaseStatus.PITCH_RECORDS_PATH;
    const summaryPath = firebaseStatus.AT_BAT_SUMMARY_PATH;
    
    if (!user || !firebaseStatus.isReady) {
        throw new Error("Database or User not ready.");
    }

    // 1. 寫入彙整紀錄
    await addDoc(collection(db, summaryPath), {
        ...summaryData,
        userId: user.uid,
        endAt: serverTimestamp(),
    });

    // 2. 批量刪除 pitch_records
    if (recordIds.length === 0) return;

    const batch = writeBatch(db);
    recordIds.forEach((id) => {
        const docRef = doc(db, pitchPath, id);
        batch.delete(docRef);
    });

    await batch.commit();
    console.log(`成功彙整並清空 ${recordIds.length} 筆紀錄`);
};