// src/hooks/ui/useCustomFieldQueue.js
// 管理自訂欄位輸入歷史的 Queue，每個欄位最多保留 10 筆紀錄。
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_QUEUE_SIZE = 10;
const STORAGE_PREFIX = '@custom_field_queue_';

/**
 * 取得指定欄位的 Queue 歷史紀錄。
 * 回傳字串陣列（最新的在前面）。
 */
export const getFieldQueue = async (fieldId) => {
    try {
        const raw = await AsyncStorage.getItem(`${STORAGE_PREFIX}${fieldId}`);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

/**
 * 將新值加入 Queue；重複值會先移除再插入頂端，超過上限時刪除最舊的。
 */
export const pushToFieldQueue = async (fieldId, value) => {
    if (!value || !value.trim()) return;
    try {
        const current = await getFieldQueue(fieldId);
        const filtered = current.filter((item) => item !== value.trim());
        const updated = [value.trim(), ...filtered].slice(0, MAX_QUEUE_SIZE);
        await AsyncStorage.setItem(`${STORAGE_PREFIX}${fieldId}`, JSON.stringify(updated));
    } catch (error) {
        console.error('pushToFieldQueue error:', error);
    }
};
