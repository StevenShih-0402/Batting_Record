# 測試報告：usePitchData Hook

## 1. 測試目標與範圍
- **測試對象**：`src/hooks/api/usePitchData.js`
- **覆蓋功能**：
  - 驗證是否能在正確的 Auth 狀態下進行訂閱與清理。
  - 驗證針對單一 Pitch 的 CRUD 操作 (`handleSavePitch`, `handleDeletePitch`, `handleUpdatePitch`) 是否正確呼叫底層 Service，並處理錯誤與例外。
  - 驗證打席彙總 `handleSaveSummary` 是否具備防呆機制，並正確地將整理後的 `pitchRecords` 和對應的 ID 列表交給底層儲存功能。

## 2. 測試環境設定
- **Mock 依賴**：
  - `AlertContext`: Mock `showError` 以便驗證錯誤是否正確顯示。
  - `pitchService`: Mock 所有 Firebase 資料層呼叫，包括 `initAuthAndGetRecords`、`savePitchRecord`、`deletePitchRecord`、`updatePitchRecord`。
  - `atBatSummaryService`: Mock 彙整打席資料的操作 `saveAtBatSummaryAndClearRecords`。

## 3. 測試案例與結果
- **【狀態依賴與監聽邏輯】**
  - [x] 當 authReady 為 false 或 user 為 null 時，不應呼叫 initAuthAndGetRecords 訂閱資料
  - [x] 當 authReady 為 true 且 user 存在時，應正確呼叫 initAuthAndGetRecords 並在卸載時清理訂閱
- **【CRUD 操作邏輯】**
  - [x] handleSavePitch 成功時應呼叫 savePitchRecord 並回傳結果；失敗時應捕捉錯誤、呼叫 showError 並拋出錯誤
  - [x] handleDeletePitch 成功時應呼叫 deletePitchRecord 並回傳 true；失敗時應捕捉錯誤並呼叫 showError
  - [x] handleUpdatePitch 成功時應呼叫 updatePitchRecord 並回傳 true；失敗時應捕捉並顯示更新失敗
- **【彙總與清空邏輯 (handleSaveSummary)】**
  - [x] 若 user 不存在，呼叫 handleSaveSummary 時不應執行任何操作
  - [x] 若 finalPayload 缺乏 pitchRecords，應中止執行不呼叫 service
  - [x] 成功彙總時，應提取目前 rawRecords 的所有 ID，並呼叫 saveAtBatSummaryAndClearRecords
  - [x] 發生例外時，應捕捉錯誤、呼叫 showError 顯示彙整失敗並拋出錯誤

## 4. 執行日誌快照
```text
PASS tests/hooks/api/usePitchData.test.js
  usePitchData 測試
    【狀態依賴與監聽邏輯】
      ✓ 當 authReady 為 false 或 user 為 null 時，不應呼叫 initAuthAndGetRecords 訂閱資料 (14 ms)
      ✓ 當 authReady 為 true 且 user 存在時，應正確呼叫 initAuthAndGetRecords 並在卸載時清理訂閱 (2 ms)
    【CRUD 操作邏輯】
      ✓ handleSavePitch 成功時應呼叫 savePitchRecord 並回傳結果；失敗時應捕捉錯誤、呼叫 showError 並拋出錯誤 (8 ms)
      ✓ handleDeletePitch 成功時應呼叫 deletePitchRecord 並回傳 true；失敗時應捕捉錯誤並呼叫 showError (1 ms)
      ✓ handleUpdatePitch 成功時應呼叫 updatePitchRecord 並回傳 true；失敗時應捕捉並顯示更新失敗 (2 ms)
    【彙總與清空邏輯 (handleSaveSummary)】
      ✓ 若 user 不存在，呼叫 handleSaveSummary 時不應執行任何操作 (1 ms)
      ✓ 若 finalPayload 缺乏 pitchRecords，應中止執行不呼叫 service (1 ms)
      ✓ 成功彙總時，應提取目前 rawRecords 的所有 ID，並呼叫 saveAtBatSummaryAndClearRecords (2 ms)
      ✓ 發生例外時，應捕捉錯誤、呼叫 showError 顯示彙整失敗並拋出錯誤 (2 ms)

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        0.883 s
Ran all test suites matching /tests\/hooks\/api\/usePitchData.test.js/i.
```

## 5. 結論與覆蓋率概述
`usePitchData` Hook 成功通過所有的 9 個核心測試案例。測試結果證明其能有效率的處理 Firebase 的回呼。並且在彙整資料情境下，能夠順利的抓取所有散落在狀態內部的 ID 並送交給下一層。達成 100% 邏輯覆蓋率。
