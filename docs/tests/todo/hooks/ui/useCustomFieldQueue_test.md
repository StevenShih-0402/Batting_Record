# useCustomFieldQueue 測試規劃

**目標路徑:** `src/hooks/ui/useCustomFieldQueue.js`
**測試路徑:** `tests/hooks/ui/useCustomFieldQueue.test.js`

## 測試範圍 (Utils)

`useCustomFieldQueue` 實際上匯出了兩個純粹的異步函數 `getFieldQueue` 與 `pushToFieldQueue`，用以操作 `@react-native-async-storage/async-storage`。測試焦點為值的存取、陣列長度限制、以及內容去重邏輯。

### Mocking 策略
- 需要 Mock `@react-native-async-storage/async-storage` 的 `getItem` 與 `setItem`。

### 單元測試項目 (Unit Tests)

1. **【讀取 Queue 邏輯 (getFieldQueue)】**
    - `當 Storage 為空時，應回傳空陣列`
    - `當 Storage 內有資料時，應成功解析並回傳陣列`
    - `當 JSON 解析失敗或發生例外狀況時，應捕捉錯誤並回傳空陣列`

2. **【寫入 Queue 邏輯 (pushToFieldQueue)】**
    - `當傳入空值或只包含空白字元時，不應執行任何寫入動作`
    - `當寫入新值時，應忽略頭尾空白並將其插入陣列最前方`
    - `當寫入重複的值時，應將該值移至陣列最前方，且不增加總長度`
    - `當寫入後陣列長度超過 MAX_QUEUE_SIZE (10) 時，應移除最舊的項目保持在上限內`
    - `當寫入過程發生例外狀況時，應捕捉並顯示錯誤日誌，不會中斷程式執行`
