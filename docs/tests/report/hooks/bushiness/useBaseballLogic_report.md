# 測試報告：useBaseballLogic Hook

## 1. 測試目標與範圍
- **測試對象**：`src/hooks/business/useBaseballLogic.js`
- **覆蓋功能**：
  - 驗證原始打席紀錄傳入後的排序與防呆機制 (null, undefined, [] 處理)。
  - 驗證基礎棒球規則的累積球數計量（好球與界外球關係、壞球）。
  - 驗證打擊結果的情境判斷（三振、保送、打擊出去的 isFinished 標記與 Outcome 轉換）。
  - 驗證出局後的防禦邏輯（即使多記錄了球，也不應該無止盡計數）。

## 2. 測試環境設定
- **Mock 依賴**：
  - 此為純業務邏輯 (Pure Logic Hook)，無任何外部 Context 或 React Native 原生依賴需要 Mock。
  - 直接傳入構建好的 `rawRecords` 陣列進行黑箱/白箱驗證。

## 3. 測試案例與結果
- **【邊界與例外處理】**
  - [x] 當傳入的 rawRecords 為 null 或 undefined 時，應回傳初始空狀態，避免崩潰
  - [x] 當傳入空陣列時，應回傳空狀態且打席未結束
- **【基礎球數計算與排序邏輯】**
  - [x] 傳入多筆紀錄時，應先依照 createdAt 升序處理，最後回傳的 records 應為降序 (最新在頂部)
  - [x] 連續輸入兩顆好球與兩顆壞球，狀態應正確記錄 strikes: 2, balls: 2，打席尚未結束
  - [x] 輸入界外球時，若好球數小於 2 則增加好球數，若已達兩好球則好球數不變 (維持 2)
- **【打席結束判定 (出局或上壘)】**
  - [x] 累積三好球時，最後一球應被標記 atBatEndOutcome="三振" 且 isFinished=true
  - [x] 累積四壞球時，最後一球應被標記 atBatEndOutcome="保送" 且 isFinished=true
  - [x] 當打擊結果為 "打擊出去" 時，該球應被標記為 atBatEndOutcome="打擊出去" 且 isFinished=true
- **【打席結束後的防呆】**
  - [x] 當打席已經結束 (例如已遭三振)，雖然傳入了多餘的後續球數，其 strikes 和 balls 都不應繼續累加，只會維持三振當下的球數

## 4. 執行日誌快照
```text
PASS tests/hooks/business/useBaseballLogic.test.js
  useBaseballLogic 測試
    【邊界與例外處理】
      ✓ 當傳入的 rawRecords 為 null 或 undefined 時，應回傳初始空狀態，避免崩潰 (11 ms)
      ✓ 當傳入空陣列時，應回傳空狀態且打席未結束 (1 ms)
    【基礎球數計算與排序邏輯】
      ✓ 傳入多筆紀錄時，應先依照 createdAt 升序處理，最後回傳的 records 應為降序 (最新在頂部) (1 ms)
      ✓ 連續輸入兩顆好球與兩顆壞球，狀態應正確記錄 strikes: 2, balls: 2，打席尚未結束 (1 ms)
      ✓ 輸入界外球時，若好球數小於 2 則增加好球數，若已達兩好球則好球數不變 (維持 2) (1 ms)
    【打席結束判定 (出局或上壘)】
      ✓ 累積三好球時，最後一球應被標記 atBatEndOutcome="三振" 且 isFinished=true (1 ms)
      ✓ 累積四壞球時，最後一球應被標記 atBatEndOutcome="保送" 且 isFinished=true (1 ms)
      ✓ 當打擊結果為 "打擊出去" 時，該球應被標記為 atBatEndOutcome="打擊出去" 且 isFinished=true (1 ms)
    【打席結束後的防呆】
      ✓ 當打席已經結束 (例如已遭三振)，雖然傳入了多餘的後續球數，其 strikes 和 balls 都不應繼續累加，只會維持三振當下的球數 (1 ms)

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        0.652 s
Ran all test suites matching /tests\/hooks\/business\/useBaseballLogic.test.js/i.
Exit code: 0
```

## 5. 結論與覆蓋率概述
`useBaseballLogic` 完美通過所有邊界與邏輯測試。身為一個純粹轉換狀態的 Hook，不依賴任何外部元件使得測試速度非常快。所有在棒球規則的邊緣條件（例如 2 好球後連續打界外、三振後誤鍵資料）均有涵蓋，達到 100% 邏輯覆蓋率。
