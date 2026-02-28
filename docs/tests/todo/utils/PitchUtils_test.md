# 測試規劃：PitchUtils_test.md

## 1. 測試目標
驗證 `getCellNumber` 函數能否將螢幕座標準確轉換為 1-9 的九宮格編號及比例（relX, relY），並正確處理狀態列補償與範圍判定。

## 2. 測試案例 (Test Cases)

### 2.1 【坐標轉換與九宮格判定】
- **九宮格正中心點**
  - **輸入**: `pageX=150, pageY=175` (假設 gridLayout: x=100, y=100, w=100, h=100, 考慮 -25 補償)。
  - **預期結果**: `cellNumber` 為 5, `isInside` 為 true, `relX` 為 0.5, `relY` 為 0.5。
- **左上角頂點 (Cell 1)**
  - **輸入**: `pageX=100, pageY=125`。
  - **預期結果**: `cellNumber` 為 1, `isInside` 為 true。
- **右下角頂點 (Cell 9)**
  - **輸入**: `pageX=200, pageY=225`。
  - **預期結果**: `cellNumber` 為 9, `isInside` 為 true。

### 2.2 【範圍外判定】
- **點擊在九宮格左側**
  - **輸入**: `pageX=50` (gridLayout.x=100)。
  - **預期結果**: `isInside` 為 false, `cellNumber` 為 0。
- **點擊在九宮格上方 (StatusBar 區域)**
  - **輸入**: `pageY=110` (gridLayout.y=100, 考慮 -25 後變為負數)。
  - **預期結果**: `isInside` 為 false。

### 2.3 【邊界條件與錯誤處理】
- **無效的 Layout 資訊**
  - **輸入**: `gridLayout` 為 null 或寬高為 0。
  - **預期結果**: 回傳 `{ cellNumber: 0, isInside: false, relX: 0, relY: 0 }`。
- **浮點數精確位移**
  - **輸入**: 點擊在 Cell 1 與 Cell 2 的交界處 (例如 `relX_px` 剛好等於 `cellWidth`)。
  - **預期結果**: 應回傳 Cell 2 (由 `Math.floor` 與 `GRID_CELL_SIZE - 1` 保障範圍)。
