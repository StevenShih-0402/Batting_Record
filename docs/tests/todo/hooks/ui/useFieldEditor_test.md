# useFieldEditor 測試規劃

**目標路徑:** `src/hooks/ui/useFieldEditor.js`
**測試路徑:** `tests/hooks/ui/useFieldEditor.test.js`

## 測試範圍 (Hooks)

`useFieldEditor` 是一個純粹管理自訂欄位表單狀態的 Hook。負責管理欄位名稱 (`label`)、類型 (`type`)、下拉選項的新增字串 (`newOption`) 以及選項陣列 (`options`)。

### Mocking 策略
- 無外部依賴。純粹測試 React State 變更與陣列操作。

### 單元測試項目 (Unit Tests)

1. **【初始化與重置邏輯】**
    - `初始化時，預設狀態應為空字串或預設值`
    - `呼叫 reset 時，應將所有狀態恢復為預設值`

2. **【下拉選項管理 (addOption/removeOption)】**
    - `當 newOption 有效且不重複時，呼叫 addOption 應成功加入 options 陣列並清空 newOption`
    - `當 newOption 為空字串或只有空白時，呼叫 addOption 不應修改 options 陣列`
    - `當 newOption 的值已存在於 options 時，呼叫 addOption 不應修改 options 陣列 (避免重複)`
    - `呼叫 removeOption 傳入指定索引時，應將該索引的選項從 options 陣列中移除`
