// src/services/atBatSummaryService.js
// 按下「結束打席」的時候彙整紀錄的業務邏輯，包含 寫入總結 與 批量刪除原始逐球紀錄
import { collection, addDoc, serverTimestamp, doc, writeBatch, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, firebaseStatus } from './firebaseService';

// ---- StrikeZoonScreen ----
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

// ---- HistoryScreen ----
// 獲取歷史摘要紀錄 (彙整後的資料)
export const getAtBatHistory = (userId, setRecordsCallback, setLoadingCallback) => {
    if (!userId) return;

    // 指向你在 config.js 定義的 AT_BAT_SUMMARY_PATH
    const summaryRef = collection(db, "atBatSummaries"); // 這裡請換成你實際的 Collection 名稱
    const q = query(
        summaryRef, 
        where("userId", "==", userId), 
        orderBy("startAt", "desc") // 按時間排序
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const historyData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // 轉換 Firebase Timestamp 為 JS Date
            date: doc.data().startAt?.toDate().toLocaleDateString() || '未知日期'
        }));
        setRecordsCallback(historyData);
        setLoadingCallback(false);
    }, (error) => {
        console.error("讀取歷史失敗:", error);
        setLoadingCallback(false);
    });

    return unsubscribe;
};