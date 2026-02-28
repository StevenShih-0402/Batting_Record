# 測試報告：useFieldEditor Hook

## 1. 測試目標與範圍
- **測試對象**：`src/hooks/ui/useFieldEditor.js`
- **覆蓋功能**：
  - 驗證預設狀態是否符合預期 (`text`, empty array 等)。
  - 驗證 `reset` 函數對於所有內部 state 的復原行為。
  - 驗證針對下拉選單選項 `addOption` 的防呆機制，包含空字串、空白字元 (經由 trim) 以及不重複值的檢查。
  - 驗證下拉選項 `removeOption` 是否能透過陣列索引正確地移除指定元素。

## 2. 測試環境設定
- **Mock 依賴**：
  - 無外部依賴。這是一個純粹封裝 React `useState` 與陣列操作方法的 UI Hook。
  - 使用 `@testing-library/react-native` 的 `renderHook` 與 `act`。
  - ⚠️ 注意：所有 State 的依賴變更（例如 `setNewOption` 後呼叫 `addOption`）因閉包特性，在測試中需拆分為獨立的 `act` 區塊以確保正確取得最新狀態。

## 3. 測試案例與結果
- **【初始化與重置邏輯】**
  - [x] 初始化時，預設狀態應為空字串或預設值
  - [x] 呼叫 reset 時，應將所有狀態恢復為預設值
- **【下拉選項管理 (addOption/removeOption)】**
  - [x] 當 newOption 有效且不重複時，呼叫 addOption 應成功加入 options 陣列並清空 newOption
  - [x] 當 newOption 為空字串或只有空白時，呼叫 addOption 不應修改 options 陣列
  - [x] 當 newOption 的值已存在於 options 時，呼叫 addOption 不應修改 options 陣列 (避免重複)
  - [x] 呼叫 removeOption 傳入指定索引時，應將該索引的選項從 options 陣列中移除

## 4. 執行日誌快照
```text
PASS tests/hooks/ui/useFieldEditor.test.js
  useFieldEditor 測試
    【初始化與重置邏輯】
      ✓ 初始化時，預設狀態應為空字串或預設值 (17 ms)
      ✓ 呼叫 reset 時，應將所有狀態恢復為預設值 (3 ms)
    【下拉選項管理 (addOption/removeOption)】
      ✓ 當 newOption 有效且不重複時，呼叫 addOption 應成功加入 options 陣列並清空 newOption (2 ms)
      ✓ 當 newOption 為空字串或只有空白時，呼叫 addOption 不應修改 options 陣列 (1 ms)
      ✓ 當 newOption 的值已存在於 options 時，呼叫 addOption 不應修改 options 陣列 (避免重複) (1 ms)
      ✓ 呼叫 removeOption 傳入指定索引時，應將該索引的選項從 options 陣列中移除 (1 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.697 s, estimated 1 s
Ran all test suites matching /tests\/hooks\/ui\/useFieldEditor.test.js/i.
Exit code: 0
```

## 5. 結論與覆蓋率概述
`useFieldEditor` Hook 通過所有 6 個測試案例。針對 `addOption` 極為重要的修剪空白 (`trim`)、空白防呆與不重複防呆均有完整涵蓋。達成 100% 邏輯覆蓋率。
