狀態：初始為 [ ]、完成為 [x]
注意：狀態只能在測試通過後由流程更新。
測試類型：前端元素、function 邏輯、Mock API、驗證權限...等

---

## [ ] 【前端元素】顯示載入狀態
**範例輸入**：`loading` 狀態為 `true`
**期待輸出**：畫面顯示 `ActivityIndicator` 與「資料庫連線中...」文字

---

## [ ] 【前端元素】正確渲染好壞球與總球數燈號
**範例輸入**：`atBatStatus` 為 `{ strikes: 2, balls: 1 }`，`atBatRecords` 長度為 5
**期待輸出**：好球燈顯示2顆亮起，壞球燈顯示1顆亮起，總球數 (P) 顯示 5

---

## [ ] 【前端元素】最新紀錄文字顯示
**範例輸入**：`atBatStatus.isFinished` 為 `true` 且 `balls >= 4`
**期待輸出**：畫面顯示「保送」字樣

---

## [ ] 【使用者互動】點擊歷史列表按鈕導航
**範例輸入**：使用者點擊右下角的 `clipboard-list` 懸浮按鈕
**期待輸出**：觸發 `navigation.navigate('BattingList')`
