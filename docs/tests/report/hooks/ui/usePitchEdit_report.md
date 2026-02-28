# 測試報告：usePitchEdit Hook

## 1. 測試目標與範圍
- **測試對象**：`src/hooks/ui/usePitchEdit.js`
- **覆蓋功能**：
  - 驗證從 `record` 初始化基本表單欄位 (`speed`, `pitchType`, `note`, `result`) 的正確性，特別是數字型態的 `speed` 須轉為字串。
  - 驗證自訂球點欄位 `customPitchValues` 的載入與更新 (`setCustomValue`) 是否正確保留原始結構並更新指定內容。
  - 驗證使用者獨立修改各欄位時狀態是否改變。
  - 驗證儲存 (`handleSave`) 邏輯中，是否正確呼叫傳入的 `onSave` 以及在 Payload 中將 `speed` 正確從字串轉回數值型態 (含防呆：空或無法解析的字串應被轉為 `0`)。

## 2. 測試環境設定
- **Mock 依賴**：
  - 僅依賴外部傳入的 `onSave` 函式，使用 `jest.fn()` 來驗證其是否被正確呼叫且攜帶了預期的參數。
  - 使用 `@testing-library/react-native` 的 `renderHook` 與 `act`。

## 3. 測試案例與結果
- **【初始化與同步 (useEffect)】**
  - [x] 當 isVisible 為 false 時，即使有傳入 record，也不應修改表單狀態 (維持預設值)
  - [x] 當 isVisible 為 true 且傳入完整的 record 時，應將各欄位值正確載入 state (包含數值轉字串的 speed)
  - [x] 當傳入的 record 缺少部分屬性時，對應的 state 應退回預設空字串/空物件
- **【表單輸入變更 (State 更新)】**
  - [x] 呼叫 setSpeed, setPitchType, setNote, setResult 等更新函式，應能獨立變更對應狀態
  - [x] 呼叫 setCustomValue 傳入 fieldId 與 value，應能正確更新 customPitchValues 中的對應屬性
- **【儲存邏輯 (handleSave)】**
  - [x] 呼叫 handleSave 時，應將目前的表單狀態打包呼叫 onSave
  - [x] 儲存時，若 speed 字串可被解析為數字，onSave payload 中的 speed 應為數值型態；若解析失敗或為空，應送出 0

## 4. 執行日誌快照
```text
PASS tests/hooks/ui/usePitchEdit.test.js
  usePitchEdit 測試
    【初始化與同步 (useEffect)】
      ✓ 當 isVisible 為 false 時，即使有傳入 record，也不應修改表單狀態 (維持預設值) (16 ms)
      ✓ 當 isVisible 為 true 且傳入完整的 record 時，應將各欄位值正確載入 state (包含數值轉字串的 speed) (2 ms)
      ✓ 當傳入的 record 缺少部分屬性時，對應的 state 應退回預設空字串/空物件 (1 ms)
    【表單輸入變更 (State 更新)】
      ✓ 呼叫 setSpeed, setPitchType, setNote, setResult 等更新函式，應能獨立變更對應狀態 (2 ms)
      ✓ 呼叫 setCustomValue 傳入 fieldId 與 value，應能正確更新 customPitchValues 中的對應屬性 (1 ms)
    【儲存邏輯 (handleSave)】
      ✓ 呼叫 handleSave 時，應將目前的表單狀態打包呼叫 onSave (1 ms)
      ✓ 儲存時，若 speed 字串可被解析為數字，onSave payload 中的 speed 應為數值型態；若解析失敗或為空，應送出 0 (2 ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        0.573 s
Ran all test suites matching /tests\/hooks\/ui\/usePitchEdit.test.js/i.
Exit code: 0
```

## 5. 結論與覆蓋率概述
`usePitchEdit` Hook 大都為 UI 狀態的同步轉譯與重組件工作，此 7 個單元測試精準涵蓋了從 API/上層傳入資料後的初始化與儲存前的字串/數值轉換。測試順利全數通過，達成 100% 覆蓋。
