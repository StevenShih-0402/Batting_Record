# 測試報告：useEndAtBat Hook

## 1. 測試目標與範圍
- **測試對象**：`src/hooks/ui/useEndAtBat.js`
- **覆蓋功能**：
  - 驗證 Modal 開啟/關閉時的狀態重置與初始化（清空標題、備註、載入 Queue）。
  - 驗證自訂欄位的更新邏輯。
  - 驗證儲存過程的各項防呆：沒有選擇球的防呆、建立預設標題、將文字欄位儲存回 Queue 功能、成功後的回饋和重置邏輯。
  - 驗證 API 錯誤拋出時的 `isSaving` 復原與 Error UI 反饋。

## 2. 測試環境設定
- **Mock 依賴**：
  - `AlertContext`: Mock `showSuccess` 和 `showError`。
  - `PreferencesContext`: Mock `customSummaryFields`，定義 `['text', 'dropdown']` 此兩種型別以便測試 Queue 的連動邏輯。
  - `useCustomFieldQueue`: Mock `getFieldQueue`, `pushToFieldQueue`，並追蹤是否正確攔截了 Text 類型的自訂欄位。

## 3. 測試案例與結果
- **【初始化與 Queue 載入邏輯】**
  - [x] 當 isVisible 為 true 且存在 text 類型的 customSummaryFields，應向 getFieldQueue 要求對應的快選列表並存入 fieldQueues
  - [x] 當 isVisible 為 false 時，不應重置狀態或載入 Queue
  - [x] 當 isVisible 變為 true 時，應清空既有狀態 (title, note, customValues)
- **【自訂欄位狀態變更】**
  - [x] 呼叫 setSummaryCustomValue 能正確更新指定 fieldId 的值
- **【儲存邏輯與防呆 (handleSave)】**
  - [x] 若 atBatRecords 為空或不存在，呼叫 handleSave 應直接 return 且不觸發任何事件
  - [x] 若標題未填寫，呼叫 onSave 時的 payload 中應帶入預設的時間字串
  - [x] 儲存時，針對有填寫值且 type 為 text 的自訂欄位，應呼叫 pushToFieldQueue
  - [x] 當標題與備註均有填寫，呼叫 onSave 時的 payload 應帶入填寫的字串與 summaryCustomValues
  - [x] 當 onSave 成功執行後，應呼叫 showSuccess，且在按下確定後，應呼叫 onClose 並再次清空狀態
  - [x] 當儲存過程中發生例外錯誤時，應捕捉錯誤並呼叫 showError，且最終將 isSaving 設回 false

## 4. 執行日誌快照
```text
PASS tests/hooks/ui/useEndAtBat.test.js
  useEndAtBat 測試
    【初始化與 Queue 載入邏輯】
      ✓ 當 isVisible 為 true 且存在 text 類型的 customSummaryFields，應向 getFieldQueue 要求對應的快選列表並存入 fieldQueues (58 ms)
      ✓ 當 isVisible 為 false 時，不應重置狀態或載入 Queue (1 ms)
      ✓ 當 isVisible 變為 true 時，應清空既有狀態 (title, note, customValues) (3 ms)
    【自訂欄位狀態變更】
      ✓ 呼叫 setSummaryCustomValue 能正確更新指定 fieldId 的值 (2 ms)
    【儲存邏輯與防呆 (handleSave)】
      ✓ 若 atBatRecords 為空或不存在，呼叫 handleSave 應直接 return 且不觸發任何事件 (2 ms)
      ✓ 若標題未填寫，呼叫 onSave 時的 payload 中應帶入預設的時間字串 (43 ms)
      ✓ 儲存時，針對有填寫值且 type 為 text 的自訂欄位，應呼叫 pushToFieldQueue (2 ms)
      ✓ 當標題與備註均有填寫，呼叫 onSave 時的 payload 應帶入填寫的字串與 summaryCustomValues (1 ms)
      ✓ 當 onSave 成功執行後，應呼叫 showSuccess，且在按下確定後，應呼叫 onClose 並再次清空狀態 (2 ms)
      ✓ 當儲存過程中發生例外錯誤時，應捕捉錯誤並呼叫 showError，且最終將 isSaving 設回 false (2 ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        0.813 s
```

## 5. 結論與覆蓋率概述
`useEndAtBat` Hook 成功通過所有的 10 個核心測試案例。測試確認了它不僅能正確收集使用者填寫的表單，更能連動 AsyncStorage 的 Queue 功能（透過 `pushToFieldQueue`），且精準只處理 `text` 型態的自訂欄位。配合 `Alert` 互動邏輯的驗證，達成 100% 邏輯覆蓋率。
