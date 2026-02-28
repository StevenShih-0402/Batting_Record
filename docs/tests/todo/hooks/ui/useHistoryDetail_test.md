# useHistoryDetail 測試規劃

**目標路徑:** `src/hooks/ui/useHistoryDetail.js`
**測試路徑:** `tests/hooks/ui/useHistoryDetail.test.js`

## 測試範圍 (Hooks)

`useHistoryDetail` 管理 `HistoryDetailScreen` (歷史紀錄詳情頁) 的 UI 狀態與互動業務邏輯。包含球點列表 (`localPitches`)、九宮格佈局 (`gridLayout`) 尺寸，以及處理單球刪除、編輯單球與整筆紀錄刪除的行為。會與 `AlertContext` 以及 `atBatSummaryService` (Firebase 連線) 互動，還有導航 (navigation)。

### Context / Service Mocking 策略
- 需要 Mock `../../context/AlertContext` 的 `useAlert` 提供 `showWarning` 來驗證刪除確認框的叫用。
- 需要 Mock `../../services/atBatSummaryService` 的 `deleteAtBatSummary` 與 `updateAtBatSummaryPitches` 以追蹤後端資料操作。
- 需要 Mock `navigation.goBack` 與 `navigation.navigate` 以追蹤路由轉換行為。

### 單元測試項目 (Unit Tests)

1. **【初始化與同步 (useEffect)】**
    - `當傳入的 record 存在 pitchRecords 時，應正確同步至 localPitches 狀態`
    - `若傳入的 record 中未包含 pitchRecords，則應維持預設空陣列`

2. **【九宮格佈局處理 (handleGridLayout)】**
    - `呼叫 handleGridLayout 傳入 layout 事件後，應能正確設定 gridLayout { width, height }`

3. **【單球刪除 (handleDeleteSinglePitch)】**
    - `呼叫時應彈出 showWarning 確認視窗`
    - `若於確認視窗選擇取消，不應改變 localPitches 或調用 Service`
    - `若於確認視窗選擇「刪除」，應將指定索引的球點從 localPitches 中移除，並呼叫 updateAtBatSummaryPitches 儲存變更`

4. **【整筆紀錄刪除 (handleDeleteWholeRecord)】**
    - `呼叫時應彈出 showWarning 確認視窗`
    - `若選擇取消，不應調用 deleteAtBatSummary 或 goBack`
    - `若選擇「確認刪除」，應呼叫 deleteAtBatSummary 刪除當前 record.id 的紀錄，並呼叫 navigation.goBack 回上一頁`

5. **【單球編輯與導航 (handleEditPitch)】**
    - `呼叫 handleEditPitch 指定索引時，應呼叫 navigation.navigate 前往 'PitchEdit'，並帶入該球資料與回呼函式`
    - `模擬在 PitchEdit 觸發 onSave 回呼時，應更新對應索引的球點資料至 localPitches，並呼叫 updateAtBatSummaryPitches 儲存變更`
    - `模擬在 PitchEdit 觸發 onDelete 回呼時，應等同於呼叫 handleDeleteSinglePitch (可設計為斷言 showWarning 被觸發)`
