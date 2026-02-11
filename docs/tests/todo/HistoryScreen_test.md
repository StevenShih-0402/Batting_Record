狀態：初始為 [ ]、完成為 [x]
注意：狀態只能在測試通過後由流程更新。
測試類型：前端元素、function 邏輯、Mock API、驗證權限...等

---

## [x] 【UI Render】渲染打席歷史紀錄畫面 (載入中)
**範例輸入**：`loading = true`
**期待輸出**：顯示 `ActivityIndicator`。

---

## [x] 【UI Render】渲染打席歷史紀錄畫面 (無資料)
**範例輸入**：`loading = false`, `history = []`
**期待輸出**：顯示「打席歷史紀錄」標題、顯示「尚無歷史紀錄」文字。

---

## [x] 【UI Render】渲染打席歷史紀錄列表 (有資料)
**範例輸入**：`loading = false`, `history = [{ id: '1', atBatLabel: '打席 1', date: '2026-01-28', totalPitches: 5, summaryNote: '測試' }]`
**期待輸出**：正確顯示打席標籤「打席 1」、日期與球數資訊。

---

## [x] 【UI Render】打席標籤退回機制
**範例輸入**：`item = { id: '2', atBatLabel: '', finalOutcome: '三振', date: '2026-01-28', totalPitches: 3 }`
**期待輸出**：標題顯示「打席結果：三振」。

---

## [x] 【Interaction】點擊打席紀錄卡片
**範例輸入**：點擊列表中的 Card
**期待輸出**：呼叫 `setSelectedRecord` 並開啟 `HistoryDataModal` (visible={true})。

---

## [x] 【Interaction】關閉詳情 Modal
**範例輸入**：`modalVisible = true`, 呼叫 `handleCloseModal`
**期待輸出**：`modalVisible` 變為 `false`，`selectedRecord` 變為 `null`。

---

## [x] 【Interaction】刪除打席紀錄
**範例輸入**：觸發 `handleDeleteAtBat('doc123')`
**期待輸出**：呼叫 `deleteAtBatSummary('doc123')`。

---

## [x] 【Interaction】更新打席球數紀錄
**範例輸入**：觸發 `handleUpdatePitches('doc456', [...])`
**期待輸出**：呼叫 `updateAtBatSummaryPitches('doc456', [...])`。
