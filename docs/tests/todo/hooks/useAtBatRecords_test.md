# useAtBatRecords 測試規劃

**目標路徑:** `src/hooks/useAtBatRecords.js`
**測試路徑:** `tests/hooks/useAtBatRecords.test.js`

## 測試範圍 (Hooks)

`useAtBatRecords` 負責將認證狀態 (`useAuth`)、遠端打席資料 (`usePitchData`) 以及複雜的棒球邏輯 (`useBaseballLogic`) 整合在一起，並提供 UI 操作用的 `handleSaveSummaryAction` 函數與狀態。核心任務是資料整合與處理流程的驗證。

### Context / Hook Mocking 策略
- 需要 Mock `useAuth` 提供不同的登入與載入狀態。
- 需要 Mock `usePitchData` 以回傳模擬的 `rawRecords` 和各項存取操作 (如 `handleSavePitch`, `baseSaveSummary` 等)。
- 需要 Mock `useBaseballLogic` 以固定回傳運算完的 `atBatRecords` 與 `atBatStatus`，避免測試受到複雜邏輯干擾。
- 需要 Mock `formatAtBatData` 驗證資料加工 Payload 是否正確。

### 單元測試項目 (Unit Tests)

1. **【整合狀態邏輯】**
    - `組件初始化時，應正確回傳 authReady、loading、運算後的 records 以及 status`
    - `應將 usePitchData 提供的操作方法 (保存、刪除、更新球數) 正確對外暴露`

2. **【資料轉換與提交流程 (handleSaveSummaryAction)】**
    - `呼叫 handleSaveSummary 時，應透過 formatAtBatData 正確組裝 Payload 並傳遞給 baseSaveSummary`
    - `當 baseSaveSummary 成功時，應回報正確的結果`
