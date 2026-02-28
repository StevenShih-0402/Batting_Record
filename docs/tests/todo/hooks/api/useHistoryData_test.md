# useHistoryData 測試規劃

**目標路徑:** `src/hooks/api/useHistoryData.js`
**測試路徑:** `tests/hooks/api/useHistoryData.test.js`

## 測試範圍 (Hooks)

此測試重點在於驗證 `useHistoryData` Hook 在各種認證狀態 (`useAuth`) 下的行為，以及是否正確呼叫和清理 `getAtBatHistory` 服務。

### Context / Hook Mocking 策略
- 需要 Mock `useAuth`，以控制 `isReady`, `user.uid` 和 `user.isAnonymous` 的回傳值。
- 需要 Mock `../../services/atBatSummaryService` 中的 `getAtBatHistory` 函數。

### 單元測試項目 (Unit Tests)

1. **【狀態依賴邏輯】**
    - `當 Auth 尚未準備好 (isReady=false) 時，應保持載入狀態且不呼叫服務`
    - `當使用者未登入 (userId 不存在) 時，應回傳空資料並結束載入`
    - `當使用者為訪客 (isAnonymous=true) 時，應回傳空資料並結束載入`

2. **【資料獲取邏輯】**
    - `當正式用戶登入時，應呼叫 getAtBatHistory 並建立訂閱`
    - `當 Hook 卸載時，應呼叫 unsubscribe 函數清理訂閱`
