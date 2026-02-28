狀態：初始為 [ ]、完成為 [x]
注意：狀態只能在測試通過後由流程更新。
測試類型：前端元素、function 邏輯、Mock API、驗證權限...等

---

## [ ] 【畫面渲染】無資料狀態顯示
**範例輸入**：`filteredHistory` 為空陣列
**期待輸出**：畫面顯示「尚無歷史紀錄」

---

## [ ] 【畫面渲染】歷史紀錄列表呈現與自訂欄位
**範例輸入**：`filteredHistory` 包含單筆紀錄，且有 `customSummaryValues` 與對應的 `customSummaryFields`
**期待輸出**：卡片標題正確顯示 `atBatLabel`，內容包含「日期：...」、「球數：...」以及組裝過後的自訂欄位文字

---

## [ ] 【使用者互動】點擊卡片跳轉詳情頁
**範例輸入**：點擊歷史紀錄中的項目卡片
**期待輸出**：觸發 `navigation.navigate('HistoryDetail', { record: item })`

---

## [ ] 【前端元素】篩選按鈕狀態變化
**範例輸入**：`isFilterActive` 為 `true`
**期待輸出**：懸浮按鈕變更顏色 (primaryContainer)，且顯示 Badge
