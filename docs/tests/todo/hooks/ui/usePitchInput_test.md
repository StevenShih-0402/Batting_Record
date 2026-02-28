# usePitchInput 測試規劃

**目標路徑:** `src/hooks/ui/usePitchInput.js`
**測試路徑:** `tests/hooks/ui/usePitchInput.test.js`

## 測試範圍 (Hooks)

`usePitchInput` 管理 `PitchInputModal` (輸入新球點彈出視窗) 的狀態與儲存邏輯。
它接收 `isVisible`、`cellInfo` (座標位置) 以及目前的 `atBatStatus` (好壞球數等)，並在儲存時呼叫 `onSave`。
邏輯包含表單狀態初始化與重置、根據設定檔 (`pitchTypes`, `customPitchFields`) 載入初始值、連動 `useCustomFieldQueue`、依照目前好壞球狀態過濾可選的結果項目 (`getResultOptions`)，以及儲存時的各種防呆與驗證 (`handleSave`)。

### Mocking 策略
- Mock `AlertContext` 的 `useAlert` 以擷取警告視窗 (`showWarning`)。
- Mock `PreferencesContext` 提供預設的球種 (`pitchTypes`) 與自訂欄位設定 (`customPitchFields`) 以利測試 `loadQueues`。
- Mock `./useCustomFieldQueue` 攔截 `getFieldQueue` (載入快選名單) 與 `pushToFieldQueue` (儲存新值至快選名單)。

### 單元測試項目 (Unit Tests)

1. **【初始化與資源載入 (useEffect)】**
    - `當 isVisible 為 false 時，應重置所有表單狀態回預設值`
    - `當 isVisible 為 true 且存在 text 類型的 customPitchFields，應向 getFieldQueue 要求快選列表並存入 fieldQueues`

2. **【表單輸入變更 (State 更新)】**
    - `呼叫表單更新函式 (setPitchType, setResult, setSpeed, setNote) 應能正確變更對應狀態`
    - `呼叫 setCustomValue 傳入 fieldId 與 value，應能正確更新 customValues 中的屬性`

3. **【結果過濾邏輯 (getResultOptions)】**
    - `當好球數為 0 且壞球數為 0 時，應回傳包含所有 PITCH_RESULTS 的選項`
    - `當好球數為 3 時，回傳的選項中不應包含「好球」`
    - `當壞球數為 4 時，回傳的選項中不應包含「壞球」`

4. **【儲存邏輯與防呆 (handleSave)】**
    - `若 atBatStatus.isFinished 為 true，呼叫 handleSave 應彈出警告並中止儲存`
    - `若選擇「好球」且目前 strikes 已達 3，呼叫 handleSave 應彈出警告並中止儲存`
    - `若選擇「壞球」且目前 balls 已達 4，呼叫 handleSave 應彈出警告並中止儲存`
    - `若驗證皆通過，對於 text 型態的自訂欄位，應呼叫 pushToFieldQueue 儲存值`
    - `成功儲存時，應呼叫 onSave 並傳遞正確格式的 payload (包含座標轉換、字串轉數值的 speed)`
