// src/services/storageService.js
// Firebase Storage 相關操作

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseService';

/**
 * 上傳個人頭像至 Firebase Storage
 * @param {string} uri - 本地圖片 URI (file:// 或 content://)
 * @param {string} uid - 使用者 UID
 * @returns {Promise<string>} 上傳後的下載 URL
 */
export const uploadProfileImage = async (uri, uid) => {
    try {
        // 1. 將本地 URI 轉換為 Blob
        const response = await fetch(uri);
        const blob = await response.blob();

        // 2. 建立 Storage 參考路徑
        const storageRef = ref(storage, `profiles/${uid}/avatar.jpg`);

        // 3. 上傳檔案
        await uploadBytes(storageRef, blob);

        // 4. 取得下載 URL
        const downloadURL = await getDownloadURL(storageRef);

        return downloadURL;
    } catch (error) {
        console.error('上傳頭像失敗:', error);
        throw new Error('上傳頭像失敗，請稍後再試');
    }
};
