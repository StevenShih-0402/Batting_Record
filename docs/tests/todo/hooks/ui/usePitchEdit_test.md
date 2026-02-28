# usePitchEdit 測試規劃

**目標路徑:** `src/hooks/ui/usePitchEdit.js`
**測試路徑:** `tests/hooks/ui/usePitchEdit.test.js`

## 測試範圍 (Hooks)

`usePitchEdit` 管理 `PitchEditModal` (單一球點編輯彈出視窗) 的表單狀態與儲存邏輯。
它接收 `record` (原始球點資料)、`isVisible` (視窗是否開啟)、以及 `onSave` (儲存回呼函式)。
主要職責為：根據傳入的 `record` 與 `isVisible` 同步本地表單狀態 (球速、球種、備註、結果、自訂欄位)，並在使用者點擊儲存時，將所有狀態打包送給 `onSave`。

### Mocking 策略
- 無外部強依賴，只需 Mock 傳入的 `onSave` 函式。

### 單元測試項目 (Unit Tests)

1. **【初始化與同步 (useEffect)】**
    - `當 isVisible 為 false 時，即使有傳入 record，也不應修改表單狀態 (維持預設值)`
    - `當 isVisible 為 true 且傳入完整的 record 時，應將各欄位值正確載入 state (包含數值轉字串的 speed)`
    - `當傳入的 record 缺少部分屬性時，對應的 state 應退回預設空字串/空物件`

2. **【表單輸入變更 (State 更新)】**
    - `呼叫 setSpeed, setPitchType, setNote, setResult 等更新函式，應能獨立變更對應狀態`
    - `呼叫 setCustomValue 傳入 fieldId 與 value，應能正確更新 customPitchValues 中的對應屬性`

3. **【儲存邏輯 (handleSave)】**
    - `呼叫 handleSave 時，應將目前的表單狀態打包呼叫 onSave`
    - `儲存時，若 speed 字串可被解析為數字，onSave payload 中的 speed 應為數值型態；若解析失敗或為空，應送出 0`
