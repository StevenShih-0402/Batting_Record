狀態：初始為 [ ]、完成為 [x]
注意：狀態只能在測試通過後由流程更新。
測試類型：前端元素、function 邏輯、Mock API、驗證權限...等

---

## [x] 【UI Render】渲染打席數據輸入畫面 (載入中)
**範例輸入**：`loading = true`
**期待輸出**：顯示 `ActivityIndicator` 與「資料庫連線中...」文字。

---

## [x] 【UI Render】渲染打席數據輸入畫面 (載入完成)
**範例輸入**：`loading = false`, `atBatStatus = { strikes: 1, balls: 2 }`, `atBatRecords = []`
**期待輸出**：顯示「打席數據輸入」標題、九宮格 (PitchGrid)、S/B/P 燈號與球數。

---

## [x] 【UI Render】狀態列顯示正確球數與燈號
**範例輸入**：`atBatStatus = { strikes: 2, balls: 3 }`, `atBatRecords = [rec1, rec2, rec3, rec4, rec5]`
**期待輸出**：好球燈顯示 2 顆、壞球燈顯示 3 顆、總球數 P 顯示 5。

---

## [x] 【UI Render】顯示最新一球結果
**範例輸入**：`atBatRecords = [{ result: '界外', atBatEndOutcome: null }]`, `atBatStatus = { isFinished: false }`
**期待輸出**：畫面顯示「界外」。

---

## [x] 【UI Render】打席結束顯示結算文字 (三振)
**範例輸入**：`atBatStatus = { isFinished: true, strikes: 3, balls: 0 }`, `atBatRecords = [{ result: '三振' }]`
**期待輸出**：畫面顯示「三振」。

---

## [x] 【Interaction】點擊抽屜按鈕開啟側邊欄
**範例輸入**：點擊懸浮抽屜按鈕
**期待輸出**：呼叫 `ui.drawer.toggle()` (或透過動畫確認側邊欄開啟)。

---

## [x] 【Interaction】點擊畫面觸發點選球位
**範例輸入**：點擊九宮格區域
**期待輸出**：觸發 `ui.handleScreenPress`。

---

## [x] 【Interaction】儲存打席彙整
**範例輸入**：側邊欄開啟且有紀錄，點擊「儲存紀錄 (彙整)」
**期待輸出**：開啟 `EndAtBatModal`。
