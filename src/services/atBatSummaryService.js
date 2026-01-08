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
    if (!userId) {
        setLoadingCallback(false);
        return () => {};
    }

    // 【修正重點】使用 firebaseStatus 裡的動態路徑，而不是寫死的字串
    // 確保這裡讀取的路徑跟 saveAtBatSummaryAndClearRecords 寫入的路徑是一模一樣的
    const summaryPath = firebaseStatus.AT_BAT_SUMMARY_PATH; 

    // 防呆：如果 DB 根本還沒好，直接跳出
    if (!firebaseStatus.isReady || !summaryPath) {
        console.warn("Database or Path not ready for history.");
        setLoadingCallback(false);
        return () => {};
    }

    const summaryRef = collection(db, summaryPath);

    const q = query(
        summaryRef, 
        where("userId", "==", userId), 
        orderBy("startAt", "desc") // 按時間排序
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const historyData = snapshot.docs.map(doc => {
            const data = doc.data();
            // 處理時間格式，增加一點容錯，避免 startAt 欄位丟失導致崩潰
            let dateStr = '未知日期';
            if (data.startAt && typeof data.startAt.toDate === 'function') {
                // 如果是 Firestore Timestamp
                dateStr = data.startAt.toDate().toLocaleDateString();
            } else if (data.startAt instanceof Date) {
                // 如果意外存成了 Date 物件
                dateStr = data.startAt.toLocaleDateString();
            }

            return {
                id: doc.id,
                ...data,
                date: dateStr
            };
        });
        
        console.log(`成功讀取 ${historyData.length} 筆歷史紀錄`); // 加個 log 方便你 debug
        setRecordsCallback(historyData);
        setLoadingCallback(false);
    }, (error) => {
        console.error("讀取歷史失敗:", error);
        // 如果是索引錯誤 (Missing or insufficient permissions / Index required)，Firebase Console 會跳連結
        // 記得點擊 Console 裡的連結去建立複合索引 (Composite Index)
        setLoadingCallback(false);
    });

    return unsubscribe;
};