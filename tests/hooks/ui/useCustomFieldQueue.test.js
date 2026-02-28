// tests/hooks/ui/useCustomFieldQueue.test.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFieldQueue, pushToFieldQueue } from '../../../src/hooks/ui/useCustomFieldQueue';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
}));

describe('useCustomFieldQueue 測試', () => {
    const fieldId = 'test_field_id';
    const STORAGE_PREFIX = '@custom_field_queue_';
    const storageKey = `${STORAGE_PREFIX}${fieldId}`;

    beforeEach(() => {
        jest.clearAllMocks();
        // 抑制 console.error 使測試報告乾淨
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    describe('【讀取 Queue 邏輯 (getFieldQueue)】', () => {
        it('當 Storage 為空時，應回傳空陣列', async () => {
            AsyncStorage.getItem.mockResolvedValueOnce(null);
            const result = await getFieldQueue(fieldId);

            expect(AsyncStorage.getItem).toHaveBeenCalledWith(storageKey);
            expect(result).toEqual([]);
        });

        it('當 Storage 內有資料時，應成功解析並回傳陣列', async () => {
            const mockData = ['Item1', 'Item2'];
            AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockData));

            const result = await getFieldQueue(fieldId);

            expect(AsyncStorage.getItem).toHaveBeenCalledWith(storageKey);
            expect(result).toEqual(mockData);
        });

        it('當 JSON 解析失敗或發生例外狀況時，應捕捉錯誤並回傳空陣列', async () => {
            // 解析失敗
            AsyncStorage.getItem.mockResolvedValueOnce('Invalid JSON {{}');
            let result = await getFieldQueue(fieldId);
            expect(result).toEqual([]);

            // 存取例外
            AsyncStorage.getItem.mockRejectedValueOnce(new Error('AsyncStorage Error'));
            result = await getFieldQueue(fieldId);
            expect(result).toEqual([]);
        });
    });

    describe('【寫入 Queue 邏輯 (pushToFieldQueue)】', () => {
        it('當傳入空值或只包含空白字元時，不應執行任何寫入動作', async () => {
            await pushToFieldQueue(fieldId, '');
            await pushToFieldQueue(fieldId, '   ');
            await pushToFieldQueue(fieldId, null);
            await pushToFieldQueue(fieldId, undefined);

            expect(AsyncStorage.getItem).not.toHaveBeenCalled();
            expect(AsyncStorage.setItem).not.toHaveBeenCalled();
        });

        it('當寫入新值時，應忽略頭尾空白並將其插入陣列最前方', async () => {
            AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(['OldItem']));

            await pushToFieldQueue(fieldId, ' NewItem ');

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                storageKey,
                JSON.stringify(['NewItem', 'OldItem'])
            );
        });

        it('當寫入重複的值時，應將該值移至陣列最前方，且不增加總長度', async () => {
            AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(['Item1', 'Duplicate', 'Item2']));

            await pushToFieldQueue(fieldId, 'Duplicate');

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                storageKey,
                JSON.stringify(['Duplicate', 'Item1', 'Item2'])
            );
        });

        it('當寫入後陣列長度超過 MAX_QUEUE_SIZE (10) 時，應移除最舊的項目保持在上限內', async () => {
            const currentQueue = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
            AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(currentQueue));

            await pushToFieldQueue(fieldId, '11');

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                storageKey,
                JSON.stringify(['11', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
            );
        });

        it('當寫入過程發生例外狀況時，應捕捉並顯示錯誤日誌，不會中斷程式執行', async () => {
            AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([]));
            AsyncStorage.setItem.mockRejectedValueOnce(new Error('SetItem Failed'));

            // 嘗試呼叫，不應拋出未捕捉的錯誤
            await expect(pushToFieldQueue(fieldId, 'Valid')).resolves.not.toThrow();

            // 確保錯誤有被捕捉並印出
            expect(console.error).toHaveBeenCalled();
        });
    });
});
