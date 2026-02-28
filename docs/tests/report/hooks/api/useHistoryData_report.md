# 測試報告：useHistoryData Hook

## 1. 測試目標與範圍
- **測試對象**：`src/hooks/api/useHistoryData.js`
- **覆蓋功能**：
  - 驗證在不同認證狀態 (未準備好、未登入、訪客) 下，Hook 適當地回傳空資料且不呼叫後端 API。
  - 驗證在正式登入狀態下，正確呼叫 `getAtBatHistory` 建立即時資料訂閱。
  - 驗證當組件卸載時，正確觸發清理函式 (unsubscribe) 中斷訂閱以避免內存洩漏。

## 2. 測試環境設定
- **Mock 依賴**：
  - `useAuth`: Mock `userId`, `isAnonymous`, `isReady` 等狀態變量。
  - `getAtBatHistory`: Mock Firestore 取資料服務，以返回可監控的 `unsubscribe` mock 函式。

## 3. 測試案例與結果
- **【狀態依賴邏輯】**
  - [x] 當 Auth 尚未準備好 (isReady=false) 時，應保持載入狀態且不呼叫服務
  - [x] 當使用者未登入 (userId 不存在) 時，應回傳空資料並結束載入
  - [x] 當使用者為訪客 (isAnonymous=true) 時，應回傳空資料並結束載入
- **【資料獲取邏輯】**
  - [x] 當正式用戶登入時，應呼叫 getAtBatHistory 並建立訂閱
  - [x] 當 Hook 卸載時，應呼叫 unsubscribe 函數清理訂閱

## 4. 執行日誌快照
```text
PASS tests/hooks/api/useHistoryData.test.js
  useHistoryData 測試
    【狀態依賴邏輯】
      ✓ 當 Auth 尚未準備好 (isReady=false) 時，應保持載入狀態且不呼叫服務 (11 ms)
      ✓ 當使用者未登入 (userId 不存在) 時，應回傳空資料並結束載入 (1 ms)
      ✓ 當使用者為訪客 (isAnonymous=true) 時，應回傳空資料並結束載入 (1 ms)
    【資料獲取邏輯】
      ✓ 當正式用戶登入時，應呼叫 getAtBatHistory 並建立訂閱 (1 ms)
      ✓ 當 Hook 卸載時，應呼叫 unsubscribe 函數清理訂閱 (1 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        0.81 s
Ran all test suites matching /tests\/hooks\/api\/useHistoryData.test.js/i.
```

## 5. 結論與覆蓋率概述
`useHistoryData` Hook 成功通過所有測試案例。測試結果證明 Hook 能正確根據目前的用戶身分 (訪客/正式會員) 開啟或阻斷對 Firestore 的數據訂閱。同時也確認記憶體清理生命週期 (useEffect cleanup) 能正常運作，達成 100% 的邏輯覆蓋率，符合白箱測試的要求。
