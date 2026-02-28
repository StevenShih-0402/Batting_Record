# useBaseballLogic 測試規劃

**目標路徑:** `src/hooks/business/useBaseballLogic.js`
**測試路徑:** `tests/hooks/business/useBaseballLogic.test.js`

## 測試範圍 (Hooks)

`useBaseballLogic` 是一個純粹的業務邏輯 Hook。它接收一組原始的投球紀錄 (`rawRecords`)，並負責將其依照時間排序，逐球計算當下的好壞球數 (balls, strikes)，判斷打席是否結束 (isFinished)，並賦予終止結果 (atBatEndOutcome)。最終回傳反轉後（最新在最前面）的顯示用陣列，以及當前的打席狀態統計。

### Mocking 策略
- 無外部依賴。這是一個純粹的計算 Hook，只需要傳入不同的 `rawRecords` Array 即可驗證其純函數特性。

### 單元測試項目 (Unit Tests)

1. **【邊界與例外處理】**
    - `當傳入的 rawRecords 為 null 或 undefined 時，應回傳初始空狀態，避免崩潰`
    - `當傳入空陣列時，應回傳空狀態且打席未結束`

2. **【基礎球數計算與排序邏輯】**
    - `傳入多筆紀錄時，應先依照 createdAt 升序處理，最後回傳的 records 應為降序 (最新在頂部)`
    - `連續輸入兩顆好球與兩顆壞球，狀態應正確記錄 strikes: 2, balls: 2，打席尚未結束`
    - `輸入界外球時，若好球數小於 2 則增加好球數，若已達兩好球則好球數不變 (維持 2)`

3. **【打席結束判定 (出局或上壘)】**
    - `累積三好球時，最後一球應被標記 atBatEndOutcome="三振" 且 isFinished=true`
    - `累積四壞球時，最後一球應被標記 atBatEndOutcome="保送" 且 isFinished=true`
    - `當打擊結果為 "打擊出去" 時，該球應被標記為 atBatEndOutcome="打擊出去" 且 isFinished=true`

4. **【打席結束後的防呆】**
    - `當打席已經結束 (例如已遭三振)，雖然傳入了多餘的後續球數，其 strikes 和 balls 都不應繼續累加，只會維持三振當下的球數`
