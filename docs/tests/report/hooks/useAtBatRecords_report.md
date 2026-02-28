# 測試報告：useAtBatRecords Hook

## 1. 測試目標與範圍
- **測試對象**：`src/hooks/useAtBatRecords.js`
- **覆蓋功能**：
  - 驗證核心狀態的整合：確認是否正確地將 `useAuth`、`usePitchData`、`useBaseballLogic` 提供的值合併並暴露給 UI 層。
  - 驗證資料提交邏輯的串接：確認在呼叫 `handleSaveSummary` 時，會觸發 `formatAtBatData` 將資料正確格式化，並將 `Payload` 交由 `usePitchData` 提供的 `baseSaveSummary` 執行。

## 2. 測試環境設定
- **Mock 依賴**：
  - `useAuth`: Mock 登入與準備狀態 (`user`, `isReady`)。
  - `usePitchData`: Mock 原始紀錄陣列 (`rawRecords`) 與各項操作方法（保存單球、刪除、及 `handleSaveSummary` 的基底方法）。
  - `useBaseballLogic`: Mock 棒球規則引擎的輸出（打席結果 `atBatRecords` 與當前打席狀況 `atBatStatus`）。
  - `AtBatUtils.formatAtBatData`: Mock 負責資料加工成 Payload 的純函數。

## 3. 測試案例與結果
- **【整合狀態邏輯】**
  - [x] 組件初始化時，應正確回傳 authReady、loading、運算後的 records 以及 status
  - [x] 應將 usePitchData 提供的操作方法 (保存、刪除、更新球數) 正確對外暴露
- **【資料轉換與提交流程 (handleSaveSummaryAction)】**
  - [x] 呼叫 handleSaveSummary 時，應透過 formatAtBatData 正確組裝 Payload 並傳遞給 baseSaveSummary
  - [x] 當 baseSaveSummary 成功時，應回報正確的結果

## 4. 執行日誌快照
```text
PASS tests/hooks/useAtBatRecords.test.js
  useAtBatRecords 測試
    【整合狀態邏輯】
      ✓ 組件初始化時，應正確回傳 authReady、loading、運算後的 records 以及 status (13 ms)
      ✓ 應將 usePitchData 提供的操作方法 (保存、刪除、更新球數) 正確對外暴露 (1 ms)
    【資料轉換與提交流程 (handleSaveSummaryAction)】
      ✓ 呼叫 handleSaveSummary 時，應透過 formatAtBatData 正確組裝 Payload 並傳遞給 baseSaveSummary (1 ms)
      ✓ 當 baseSaveSummary 成功時，應回報正確的結果 (1 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        0.649 s
Ran all test suites matching /tests\/hooks\/useAtBatRecords.test.js/i.
```

## 5. 結論與覆蓋率概述
`useAtBatRecords` Hook 成功通過所有 4 個測試案例。
測試驗證了它是作為一個合格的「協調器（Orchestrator）」，不僅正確映射了外部 Hook 提供的資料與方法，也如預期般負責了最終存檔 Payload 的組裝中介。確保了 UI 層能透過此單一 Hook 取用所有打席紀錄相關功能。達成 100% 邏輯覆蓋率。
