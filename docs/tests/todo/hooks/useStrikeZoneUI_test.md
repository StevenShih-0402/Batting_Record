# useStrikeZoneUI 測試規劃

**目標路徑:** `src/hooks/useStrikeZoneUI.js`
**測試路徑:** `tests/hooks/useStrikeZoneUI.test.js`

## 測試範圍 (Hooks)

`useStrikeZoneUI` 是 `StrikeZoneScreen` 的核心邏輯 Hook，負責處理複雜的 UI 互動，包括座標轉換、抽屜動畫、手勢操作以及與多個彈窗（新增/編輯球點）的連動。

### Mocking 策略
- Mock `react-native`: `Animated`, `PanResponder` (特別是 `Animated.timing` 的行為)。
- Mock `../constants/Layout`: 提供視窗寬度等數值。
- Mock `../utils/PitchUtils`: `getCellNumber` (核心座標運算)。
- Mock `../context/AlertContext`: `showWarning`。
- Mock `navigation`: 導航回調。
- Mock 傳入的 Action 函式: `handleSavePitch`, `handleUpdatePitch`, `handleDeletePitch`。

### 單元測試項目 (Unit Tests)

1. **【抽屜動畫邏輯 (Drawer Animation)】**
    - `toggleDrawer 應根據目前狀態計算 targetValue 並觸發 Animated.timing`
    - `動畫結束後應正確更新 isDrawerOpen 狀態`

2. **【佈局運算 (Layout Handling)】**
    - `handleGridLayout 應能處理 event 並透過 gridRef.current.measureInWindow 取得絕對座標`
    - `當取得座標成功時，應更新 gridLayout 狀態`

3. **【螢幕點擊與座標轉換 (Screen Press)】**
    - `當 atBatStatus.isFinished 為 true 時，點擊螢幕應彈出警告並中止動作`
    - `當 gridLayout 已就緒且寬高大於 0 時，點擊螢幕應呼叫 getCellNumber 進行座標轉換`
    - `轉換成功後，應更新 selectedCellInfo 並導航至 PitchInput 頁面，傳遞正確的 params (cellInfo, atBatStatus, onSave)`

4. **【球點操作 Action (Save/Update/Delete)】**
    - **新增球點**: `onSavePitchAction 應觸發 isSaving 狀態並呼叫 handleSavePitch`
    - **更新球點**: `onUpdatePitchAction 應在成功後清空 editingRecord 並切換 isSaving`
    - **刪除球點**: `onDeletePitchAction 應呼叫 handleDeletePitch 並清空 editingRecord`

5. **【編輯導向 (handleEditPress)】**
    - `呼叫 handleEditPress 時，應設定編輯對象並導航至 PitchEdit 頁面，傳遞正確的 onSave/onDelete 回呼`

6. **【手勢操作 (PanResponder - 基本驗證)】**
    - `驗證 panResponder 的 onMoveShouldSetPanResponder 在抽屜開啟且向右滑動時回傳 true`
    - `驗證 onPanResponderMove 會隨位移更新 slideAnim 的值`
    - `驗證 onPanResponderRelease 會根據滑動距離或速度決定關閉或彈回抽屜`
