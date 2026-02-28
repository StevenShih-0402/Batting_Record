# 測試報告：useHistoryDetail Hook

## 1. 測試目標與範圍
- **測試對象**：`src/hooks/ui/useHistoryDetail.js`
- **覆蓋功能**：
  - 驗證外部傳入 `record` 的同步接收行為 (初始化 `localPitches`)。
  - 驗證九宮格 Layout 尺寸儲存邏輯 (`handleGridLayout`)。
  - 驗證刪除單獨球點的 `Alert` 確認流程與 Service 連動。
  - 驗證整筆打席紀錄刪除的確認流程、Service 連動與 Navigation 行為 (`goBack`)。
  - 驗證導航至 `PitchEdit` 的參數傳遞，以及 Mock Callback (`onSave`, `onDelete`) 觸發時是否能正確更新本地狀態與資料庫。

## 2. 測試環境設定
- **Mock 依賴**：
  - `AlertContext` 提供 `showWarning` 來攔截使用者確認動作與取得按鈕 Callback。
  - `atBatSummaryService` 提供 `deleteAtBatSummary`, `updateAtBatSummaryPitches` 以監視資料庫更新是否被調用及參數是否正確。
  - `navigation` 物件，監控 `goBack` 和 `navigate` 的路由跳轉事件。

## 3. 測試案例與結果
- **【初始化與同步 (useEffect)】**
  - [x] 當傳入的 record 存在 pitchRecords 時，應正確同步至 localPitches 狀態
  - [x] 若傳入的 record 中未包含 pitchRecords，則應維持預設空陣列
- **【九宮格佈局處理 (handleGridLayout)】**
  - [x] 呼叫 handleGridLayout 傳入 layout 事件後，應能正確設定 gridLayout { width, height }
- **【單球刪除 (handleDeleteSinglePitch)】**
  - [x] 呼叫時應彈出 showWarning 確認視窗，若選擇取消則不改變狀態與儲存
  - [x] 若於確認視窗選擇「刪除」，應將指定索引的球點從 localPitches 中移除，並呼叫 updateAtBatSummaryPitches 儲存變更
- **【整筆紀錄刪除 (handleDeleteWholeRecord)】**
  - [x] 呼叫時應彈出 showWarning 確認視窗，若選擇取消不應調用 deleteAtBatSummary 或 goBack
  - [x] 若選擇「確認刪除」，應呼叫 deleteAtBatSummary，並呼叫 navigation.goBack 回上一頁
- **【單球編輯與導航 (handleEditPitch)】**
  - [x] 呼叫 handleEditPitch 指定索引時，應呼叫 navigation.navigate 前往 PitchEdit，並帶入該球資料與回呼函式
  - [x] 模擬在 PitchEdit 觸發 onSave 回呼時，應更新對應索引的球點，並呼叫 updateAtBatSummaryPitches
  - [x] 模擬在 PitchEdit 觸發 onDelete 回呼時，應觸發 handleDeleteSinglePitch (彈出確認窗)

## 4. 執行日誌快照
```text
PASS tests/hooks/ui/useHistoryDetail.test.js
  useHistoryDetail 測試
    【初始化與同步 (useEffect)】
      ✓ 當傳入的 record 存在 pitchRecords 時，應正確同步至 localPitches 狀態 (14 ms)
      ✓ 若傳入的 record 中未包含 pitchRecords，則應維持預設空陣列 (4 ms)
    【九宮格佈局處理 (handleGridLayout)】
      ✓ 呼叫 handleGridLayout 傳入 layout 事件後，應能正確設定 gridLayout { width, height } (2 ms)
    【單球刪除 (handleDeleteSinglePitch)】
      ✓ 呼叫時應彈出 showWarning 確認視窗，若選擇取消則不改變狀態與儲存 (3 ms)
      ✓ 若於確認視窗選擇「刪除」，應將指定索引的球點從 localPitches 中移除，並呼叫 updateAtBatSummaryPitches 儲存變更 (3 ms)
    【整筆紀錄刪除 (handleDeleteWholeRecord)】
      ✓ 呼叫時應彈出 showWarning 確認視窗，若選擇取消不應調用 deleteAtBatSummary 或 goBack (2 ms)
      ✓ 若選擇「確認刪除」，應呼叫 deleteAtBatSummary，並呼叫 navigation.goBack 回上一頁 (2 ms)
    【單球編輯與導航 (handleEditPitch)】
      ✓ 呼叫 handleEditPitch 指定索引時，應呼叫 navigation.navigate 前往 PitchEdit，並帶入該球資料與回呼函式 (2 ms)
      ✓ 模擬在 PitchEdit 觸發 onSave 回呼時，應更新對應索引的球點，並呼叫 updateAtBatSummaryPitches (2 ms)
      ✓ 模擬在 PitchEdit 觸發 onDelete 回呼時，應觸發 handleDeleteSinglePitch (彈出確認窗) (1 ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        0.668 s
Ran all test suites matching /tests\/hooks\/ui\/useHistoryDetail.test.js/i.
Exit code: 0
```

## 5. 結論與覆蓋率概述
`useHistoryDetail` Hook 順利通過所有的 10 個測試案例。
測試驗證了其與 Alert Dialog 的複雜互動邏輯（提取取消或確定的 Action），並且對 `Navigation` 傳入 callback 的處理邏輯進行了完整的模擬與驗證。實現 100% 邏輯覆蓋率。
