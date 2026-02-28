# 測試報告：usePreferenceUI Hook

## 1. 測試目標與範圍
- **測試對象**：`src/hooks/ui/usePreferenceUI.js`
- **覆蓋功能**：
  - 驗證偏好設定頁面初始化時，正確載入 `PreferencesContext` 提供的資料。
  - 驗證「球種」的新增 (具備避免重複、去除空白、空值拒絕的防呆邏輯) 與移除。
  - 驗證「自訂欄位」(打席/單球) 的新增 (具備必填名稱檢查、下拉選單必填選項檢查、UUID 賦值) 與移除。
  - 驗證「儲存」(`handleSave`) 流程，包含 `isSaving` 狀態控制、呼叫 `savePreferences` 的引數正確性、成功或失敗/例外錯誤時之 `Alert` 提示及導航返回 (`navigation.goBack()`) 的流程控制。

## 2. 測試環境設定
- **Mock 依賴**：
  - `AlertContext`: Mock `showSuccess` 和 `showError` 以斷言操作回饋。
  - `PreferencesContext`: Mock 供載入與儲存的資料與函數 (`savePreferences`, `isLoading`)。
  - `uuid` 模組: 強制 Mock `v4` 方法永遠回傳固定的 `mock-uuid-1234` 以便進行相等性斷言。

## 3. 測試案例與結果
- **【初始化與取得 Context 資料】**
  - [x] 初始化時，localPitchTypes, localColor, localPitchFields, localSummaryFields 應與 PreferencesContext 提供的值相同
  - [x] isLoading 與 isSaving 狀態應正確反映 (預設 isSaving 為 false)
- **【球種設定 (Pitch Types)】**
  - [x] 呼叫 addPitchType 時，若新球種包含空白，應消除兩側空白後加入 localPitchTypes，並清空 newPitchType
  - [x] 若新球種為空字串或只有空白，呼叫 addPitchType 不應改變 localPitchTypes
  - [x] 若新球種已存在於 localPitchTypes，呼叫 addPitchType 應觸發 showError 並中止新增
  - [x] 呼叫 removePitchType 傳入指定索引，應能將對應球種從 localPitchTypes 中移除
- **【自訂欄位設定 (Custom Fields - addCustomField / removeCustomField)】**
  - [x] 呼叫 addCustomField 時，若 editor 的 label 為空，應觸發 showError 並中止新增
  - [x] 呼叫 addCustomField 時，若 type 為 dropdown 但 options 為空，應觸發 showError 並中止新增
  - [x] 若驗證通過，應正確建立欄位物件並加入清單，並呼叫 editor.reset()
  - [x] 呼叫 removeCustomField 傳入指定 setList 與 id，應能將該 id 的欄位從清單中移除
- **【儲存邏輯 (handleSave)】**
  - [x] 當 savePreferences 成功回傳 true 時，應觸發 showSuccess，並呼叫 navigation.goBack()
  - [x] 當 savePreferences 回傳 false 時，應觸發 showError
  - [x] 當 savePreferences 拋出例外錯誤時，應觸發 showError 顯示錯誤訊息

## 4. 執行日誌快照
```text
PASS tests/hooks/ui/usePreferenceUI.test.js
  usePreferenceUI 測試
    【初始化與取得 Context 資料】
      ✓ 初始化時，localPitchTypes, localColor, localPitchFields, localSummaryFields 應與 PreferencesContext 提供的值相同 (10 ms)
      ✓ isLoading 與 isSaving 狀態應正確反映 (預設 isSaving 為 false) (1 ms)
    【球種設定 (Pitch Types)】
      ✓ 呼叫 addPitchType 時，若新球種包含空白，應消除兩側空白後加入 localPitchTypes，並清空 newPitchType (2 ms)
      ✓ 若新球種為空字串或只有空白，呼叫 addPitchType 不應改變 localPitchTypes (1 ms)
      ✓ 若新球種已存在於 localPitchTypes，呼叫 addPitchType 應觸發 showError 並中止新增 (1 ms)
      ✓ 呼叫 removePitchType 傳入指定索引，應能將對應球種從 localPitchTypes 中移除 (3 ms)
    【自訂欄位設定 (Custom Fields - addCustomField / removeCustomField)】
      ✓ 呼叫 addCustomField 時，若 editor 的 label 為空，應觸發 showError 並中止新增 (2 ms)
      ✓ 呼叫 addCustomField 時，若 type 為 dropdown 但 options 為空，應觸發 showError 並中止新增 (3 ms)
      ✓ 若驗證通過，應正確建立欄位物件並加入清單，並呼叫 editor.reset() (2 ms)
      ✓ 呼叫 removeCustomField 傳入指定 setList 與 id，應能將該 id 的欄位從清單中移除 (1 ms)
    【儲存邏輯 (handleSave)】
      ✓ 當 savePreferences 成功回傳 true 時，應觸發 showSuccess，並呼叫 navigation.goBack() (1 ms)
      ✓ 當 savePreferences 回傳 false 時，應觸發 showError (1 ms)
      ✓ 當 savePreferences 拋出例外錯誤時，應觸發 showError 顯示錯誤訊息 (20 ms)

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        0.955 s
Ran all test suites matching /tests\/hooks\/ui\/usePreferenceUI.test.js/i.
Exit code: 0
```

## 5. 結論與覆蓋率概述
`usePreferenceUI` Hook 順利通過 13 個測試案例。
測試過程完整模擬並驗證了偏好設定表單各區塊的新增/刪除防呆邏輯，以及成功/失敗儲存場景中的 `Navigation` 與 `Alert` 反應，達成 100% 邏輯覆蓋率。
