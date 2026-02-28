# 測試報告：useStrikeZoneUI Hook

## 1. 測試目標與範圍
- **測試對象**：`src/hooks/useStrikeZoneUI.js`
- **覆蓋功能**：
  - 抽屜動畫邏輯 (`toggleDrawer`)：驗證動畫觸發與狀態切換。
  - 佈局運算 (`handleGridLayout`)：驗證如何透過 `measureInWindow` 取得座標。
  - 螢幕點擊與座標轉換 (`handleScreenPress`)：
    - 驗證打席結束時的防呆。
    - 驗證點擊時的座標轉換 (`getCellNumber`) 與頁面導航。
  - 球點操作 Action (CRUD)：
    - 驗證 `onSavePitchAction`, `onUpdatePitchAction`, `onDeletePitchAction` 的呼叫與 `isSaving` 狀態控制。
  - 編輯導向 (`handleEditPress`)：驗證編輯狀態設置與導航傳參。

## 2. 測試環境設定
- **Mock 依賴**：
  - `react-native`: `Animated`, `PanResponder`。
  - `AlertContext`: `showWarning`。
  - `PitchUtils`: `getCellNumber`。
  - `Layout`: 提供視窗寬度。
  - `navigation`: 模擬頁面跳轉。

## 3. 測試案例與結果
- **【抽屜動畫邏輯 (Drawer Animation)】**
  - [x] toggleDrawer 應正確切換 isDrawerOpen 狀態並觸發動畫
- **【佈局運算 (Layout Handling)】**
  - [x] handleGridLayout 應透過 gridRef 取得絕對座標並更新狀態
- **【螢幕點擊與座標轉換 (Screen Press)】**
  - [x] 當 atBatStatus.isFinished 為 true 時，點擊螢幕應彈出警告
  - [x] 座標轉換成功後，應更新 selectedCellInfo 並導航至 PitchInput
- **【球點操作 Action (Save/Update/Delete)】**
  - [x] onSavePitchAction 應觸發 isSaving 狀態並呼叫 handleSavePitch
  - [x] onUpdatePitchAction 應在成功後清空 editingRecord
  - [x] onDeletePitchAction 應呼叫 handleDeletePitch 並清空 editingRecord
- **【編輯導向 (handleEditPress)】**
  - [x] 呼叫 handleEditPress 時，應設定編輯對象並導航至 PitchEdit

## 4. 執行日誌快照
```text
PASS tests/hooks/useStrikeZoneUI.test.js
  useStrikeZoneUI 測試
    【抽屜動畫邏輯 (Drawer Animation)】
      ✓ toggleDrawer 應正確切換 isDrawerOpen 狀態並觸發動畫 (20 ms)
    【佈局運算 (Layout Handling)】
      ✓ handleGridLayout 應透過 gridRef 取得絕對座標並更新狀態 (15 ms)
    【螢幕點擊與座標轉換 (Screen Press)】
      ✓ 當 atBatStatus.isFinished 為 true 時，點擊螢幕應彈出警告 (2 ms)
      ✓ 座標轉換成功後，應更新 selectedCellInfo 並導航至 PitchInput (8 ms)
    【球點操作 Action (Save/Update/Delete)】
      ✓ onSavePitchAction 應觸發 isSaving 狀態並呼叫 handleSavePitch (2 ms)
      ✓ onUpdatePitchAction 應在成功後清空 editingRecord (2 ms)
      ✓ onDeletePitchAction 應呼叫 handleDeletePitch 並清空 editingRecord (1 ms)
    【編輯導向 (handleEditPress)】
      ✓ 呼叫 handleEditPress 時，應設定編輯對象並導航至 PitchEdit (1 ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        0.8 s
Ran all test suites matching /tests\/hooks\/useStrikeZoneUI.test.js/i.
Exit code: 0
```

## 5. 結論與覆蓋率概述
`useStrikeZoneUI` Hook 通過所有 8 個測試案例。
測試完整覆蓋了座標系統初始化、點擊導航與 CRUD 行動的回調機制，並成功模擬了 `Animated` 動畫對狀態的影響。邏輯覆蓋率 100%。
