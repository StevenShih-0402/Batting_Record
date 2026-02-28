# useEndAtBat 測試規劃

**目標路徑:** `src/hooks/ui/useEndAtBat.js`
**測試路徑:** `tests/hooks/ui/useEndAtBat.test.js`

## 測試範圍 (Hooks)

`useEndAtBat` 管理 EndAtBatModal 內的狀態，例如 `atBatTitle`, `summaryNote` 以及自訂欄位值 `summaryCustomValues`。
在打開 Modal (`isVisible=true`) 時，它會初始化狀態並載入對應欄位的過往輸入紀錄 (Queue)。
在按下儲存時 (`handleSave`)，他會將新輸入的文字推送到 Queue 中，組裝 payload 後呼叫傳入的 `onSave` 函數，最後透過 `AlertContext` 提供成功或失敗的回饋。

### Context / Service Mocking 策略
- 需要 Mock `../../context/AlertContext` 提供 `showSuccess`, `showError` 函式。
- 需要 Mock `../../context/PreferencesContext` 提供 `customSummaryFields`。
- 需要 Mock `useCustomFieldQueue` 模組，提供 `getFieldQueue`, `pushToFieldQueue`。

### 單元測試項目 (Unit Tests)

1. **【初始化與 Queue 載入邏輯】**
    - `當 isVisible 變為 true 時，應清空既有狀態 (title, note, customValues)`
    - `當 isVisible 為 true 且存在 text 類型的 customSummaryFields，應向 getFieldQueue 要求對應的快選列表並存入 fieldQueues`
    - `當 isVisible 為 false 時，不應重置狀態或載入 Queue`

2. **【自訂欄位狀態變更】**
    - `呼叫 setSummaryCustomValue 能正確更新指定 fieldId 的值`

3. **【儲存邏輯與防呆 (handleSave)】**
    - `若 atBatRecords 為空或不存在，呼叫 handleSave 應直接 return 且不觸發任何事件`
    - `儲存時，針對有填寫值且 type 為 text 的自訂欄位，應呼叫 pushToFieldQueue`
    - `若標題未填寫，呼叫 onSave 時的 payload 中應帶入預設的時間字串`
    - `若標題與備註均有填寫，呼叫 onSave 時的 payload 應帶入填寫的字串與 summaryCustomValues`
    - `當 onSave 成功執行後，應呼叫 showSuccess`
    - `當用戶在 showSuccess 對話框按下確定後，應呼叫 onClose 並再次清空狀態`
    - `當儲存過程中發生例外錯誤時，應捕捉錯誤並呼叫 showError，且最終將 isSaving 設回 false`
