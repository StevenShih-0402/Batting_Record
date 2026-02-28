# 測試規劃：AtBatUtils_test.md

## 1. 測試目標
驗證 `formatAtBatData` 函數能否正確處理投球紀錄，輸出符合預期的打席摘要格式，並正確判斷三振、保送等結果。

## 2. 測試案例 (Test Cases)

### 2.1 【基本功能】
- **傳入完整資料應正確格式化**
  - **輸入**: 標題 "Test At-Bat", 備註 "Nice game", 兩球紀錄 (r1: 1S, r2: 2S)。
  - **預期結果**: `atBatLabel` 為 "Test At-Bat", `totalPitches` 為 2, `finalOutcome` 為 "已彙整"。
- **未傳入標題應使用預設值**
  - **輸入**: `title` 為空。
  - **預期結果**: `atBatLabel` 為 "未命名打席"。

### 2.2 【邊界條件與極端值】
- **空紀錄處理**
  - **輸入**: `records` 為空數組。
  - **預期結果**: `totalPitches` 為 0, `finalBalls/Strikes` 為 0, `pitchRecords` 為空。
- **無效紀錄對象處理**
  - **輸入**: `records` 包含 null 或 undefined。
  - **預期結果**: `pitchRecords` 應回傳預設值對象 (如 `speed`: 0, `cellNumber`: 0)，且不報錯。

### 2.3 【結果邏輯判斷】
- **三振判斷**
  - **輸入**: 最後一球的 `runningStrikes` 為 3。
  - **預期結果**: `finalOutcome` 為 "三振"。
- **保送判斷**
  - **輸入**: 最後一球的 `runningBalls` 為 4。
  - **預期結果**: `finalOutcome` 為 "保送"。

### 2.4 【時間處理】
- **開始時間取自第一球**
  - **輸入**: `records` 有兩球，第一球 (最後一個 index) 有 `createdAt`。
  - **預期結果**: `startAt` 等於該 `createdAt`。
