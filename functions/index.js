/**
 * src/functions/index.js
 * 強制指定 V1 版本，解決 undefined 問題
 */

// 【關鍵修改】這裡多加了 "/v1"，強制使用第一代語法，避開版本衝突
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage().bucket();

/**
 * 當 User 被刪除時觸發
 */
exports.cleanupUserData = functions.auth.user().onDelete(async (user) => {
    // 加上這行防呆，萬一 user 物件真的沒傳進來
    if (!user) {
        console.log("觸發刪除事件，但未取得 user 物件");
        return;
    }

    const { uid } = user;
    console.log(`[清理啟動] 使用者 ${uid} 已刪除，開始清除資料...`);

    // 1. 定義要清理的集合
    const collections = ['pitch_records', 'at_bat_summaries']; 

    // 2. 清理 Firestore
    const firestorePromises = collections.map(async (colName) => {
        try {
            const snapshot = await db.collection(colName)
                .where('userId', '==', uid)
                .get();

            if (snapshot.empty) return null;

            const batch = db.batch();
            snapshot.docs.forEach((doc) => batch.delete(doc.ref));
            return batch.commit();
        } catch (err) {
            console.error(`清理集合 ${colName} 失敗:`, err);
            return null;
        }
    });

    // 3. 清理 Storage
    const folderPath = `users/${uid}/`;
    const storagePromise = storage.deleteFiles({ prefix: folderPath })
        .catch(err => {
            console.log(`Storage 無檔案或清理略過: ${err.message}`);
        });

    try {
        await Promise.all([...firestorePromises, storagePromise]);
        console.log(`[清理完成] 使用者 ${uid} 資料已淨化。`);
    } catch (error) {
        console.error(`[清理失敗] 全域錯誤:`, error);
    }
});