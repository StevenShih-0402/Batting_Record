# usePitchData 測試規劃

**目標路徑:** `src/hooks/api/usePitchData.js`
**測試路徑:** `tests/hooks/api/usePitchData.test.js`

## 測試範圍 (Hooks)

`usePitchData` 負責管理打席中的單球紀錄 (Pitch) 的 CRUD 操作，以及最終的打席彙總。它將底層 Firebase 的 Service 封裝，並結合了 AlertContext 處理錯誤顯示。

### Context / Service Mocking 策略
- 需要 Mock `../../context/AlertContext`，捕捉 `showError` 的呼叫。
- 需要 Mock `../../services/pitchService` 提供 `initAuthAndGetRecords`, `savePitchRecord`, `deletePitchRecord`, `updatePitchRecord`。
- 需要 Mock `../../services/atBatSummaryService` 提供 `saveAtBatSummaryAndClearRecords`。

### 單元測試項目 (Unit Tests)

1. **【狀態依賴與監聽邏輯】**
    - `當 authReady 為 false 或 user 為 null 時，不應呼叫 initAuthAndGetRecords 訂閱資料`
    - `當 authReady 為 true 且 user 存在時，應正確呼叫 initAuthAndGetRecords 並在卸載時清理訂閱`

2. **【CRUD 操作邏輯】**
    - `handleSavePitch 成功時應呼叫 savePitchRecord 並回傳結果；失敗時應捕捉錯誤、呼叫 showError 並拋出錯誤`
    - `handleDeletePitch 成功時應呼叫 deletePitchRecord 並回傳 true；失敗時應捕捉錯誤並呼叫 showError`
    - `handleUpdatePitch 成功時應呼叫 updatePitchRecord 並回傳 true；失敗時應捕捉並顯示更新失敗`

3. **【彙總與清空邏輯 (handleSaveSummary)】**
    - `若 user 不存在，呼叫 handleSaveSummary 時不應執行任何操作`
    - `若 finalPayload 缺乏 pitchRecords，應中止執行不呼叫 service`
    - `成功彙總時，應提取目前 rawRecords 的所有 ID，並呼叫 saveAtBatSummaryAndClearRecords`
    - `發生例外時，應捕捉錯誤、呼叫 showError 顯示彙整失敗並拋出錯誤`
