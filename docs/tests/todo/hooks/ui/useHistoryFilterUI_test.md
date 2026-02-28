# useHistoryFilterUI 測試規劃

**目標路徑:** `src/hooks/ui/useHistoryFilterUI.js`
**測試路徑:** `tests/hooks/ui/useHistoryFilterUI.test.js`

## 測試範圍 (Hooks)

`useHistoryFilterUI` 管理 `HistoryFilterScreen` (歷史紀錄篩選彈出視窗) 的 UI 表單狀態。它接收初始的篩選條件 (`initialFilters`)，並提供修改 `customFields` 的方法，最後在使用者點擊「套用」或「清除」時，觸發傳入的 callbacks (`onApply`, `onClear`) 並關閉視窗 (`navigation.goBack`)。

### Mocking 策略
- 需要 Mock 傳入的 `onApply`, `onClear` 回呼函式。
- 需要 Mock 傳入的 `navigation` 物件，監聽 `goBack` 的呼叫。
- 由於此 Hook 只有純粹的狀態邏輯，無任何外部 Context 或 Service 依賴。

### 單元測試項目 (Unit Tests)

1. **【初始化與屬性同步 (useEffect)】**
    - `當傳入 initialFilters 時，應正確初始化 localFilters 狀態`
    - `若未傳入 initialFilters，應使用預設的空字串/空物件結構作為初始狀態`
    - `當 initialFilters 發生變化時，localFilters 應同步更新`

2. **【自訂欄位變更 (handleCustomFieldChange)】**
    - `呼叫 handleCustomFieldChange 傳入 fieldId 和 value 時，應能正確更新 localFilters.customFields 中的對應數值`
    - `若多次變更不同 fieldId，customFields 內的其他屬性應被保留 (淺層複製正確)`

3. **【套用過濾條件 (handleApply)】**
    - `呼叫 handleApply 時，若有提供 onApply，應將當前的 localFilters 作為參數傳遞給 onApply`
    - `呼叫 handleApply 後，無論是否有 onApply，皆應呼叫 navigation.goBack()`

4. **【清除過濾條件 (handleClear)】**
    - `呼叫 handleClear 時，若有提供 onClear，應呼叫 onClear (無參數)`
    - `呼叫 handleClear 後，無論是否有 onClear，皆應呼叫 navigation.goBack()`
