# usePreferenceUI 測試規劃

**目標路徑:** `src/hooks/ui/usePreferenceUI.js`
**測試路徑:** `tests/hooks/ui/usePreferenceUI.test.js`

## 測試範圍 (Hooks)

`usePreferenceUI` 管理 `PreferenceScreen` (偏好設定頁面) 的狀態與業務邏輯。包含球種增刪 (`pitchTypes`)、主色系變更 (`primaryColor`)、打席/球點自訂欄位的增刪 (`customPitchFields`, `customSummaryFields`)，以及將上述異動儲存回後端的流程。

此 Hook 大量依賴 `PreferencesContext` 與 `AlertContext` 進行資料讀寫與 UI 互動回饋。

### Mocking 策略
- 需要 Mock `AlertContext` 來提供 `showSuccess`, `showError` 以便驗證各種防呆與儲存結果。
- 需要 Mock `PreferencesContext` 提供預設的偏好設定值，以及 `savePreferences`, `isLoading`。
- 需要 Mock `uuid` 模組的 `v4` 函式，確保產生的自訂欄位 ID 可被穩定預測與斷言。

### 單元測試項目 (Unit Tests)

1. **【初始化與取得 Context 資料】**
    - `初始化時，localPitchTypes, localColor, localPitchFields, localSummaryFields 應與 PreferencesContext 提供的值相同`
    - `isLoading 與 isSaving 狀態應正確反映 (預設 isSaving 為 false)`

2. **【球種設定 (Pitch Types)】**
    - `呼叫 addPitchType 時，若新球種包含空白，應消除兩側空白後加入 localPitchTypes，並清空 newPitchType`
    - `若新球種為空字串或只有空白，呼叫 addPitchType 不應改變 localPitchTypes`
    - `若新球種已存在於 localPitchTypes，呼叫 addPitchType 應觸發 showError 並中止新增`
    - `呼叫 removePitchType 傳入指定索引，應能將對應球種從 localPitchTypes 中移除`

3. **【自訂欄位設定 (Custom Fields - addCustomField / removeCustomField)】**
    - `呼叫 addCustomField 時，若 editor 的 label 為空，應觸發 showError 並中止新增`
    - `呼叫 addCustomField 時，若 type 為 dropdown 但 options 為空，應觸發 showError 並中止新增`
    - `若驗證通過且 type 為 dropdown，應正確建立欄位物件 (確保 options 被複製) 並呼叫 editor.reset()`
    - `呼叫 removeCustomField 傳入指定 setList 與 id，應能將該 id 的欄位從清單中移除`

4. **【儲存邏輯 (handleSave)】**
    - `呼叫 handleSave 應先將 isSaving 設為 true`
    - `當 savePreferences 成功回傳 true 時，應觸發 showSuccess，並呼叫 navigation.goBack()`
    - `當 savePreferences 回傳 false 時，應觸發 showError ('儲存失敗')`
    - `當 savePreferences 拋出例外錯誤時，應觸發 showError 顯示錯誤訊息`
    - `無論成功或失敗，最後 isSaving 都應設回 false`
