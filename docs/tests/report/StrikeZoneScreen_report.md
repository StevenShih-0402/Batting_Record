# 測試報告：StrikeZoneScreen

## 1. 測試目標
驗證 `StrikeZoneScreen` 的數據載入狀態渲染、九宮格與燈號 UI 的準確性，以及側邊欄抽屜動作、打席彙整彈窗等互動邏輯。

## 2. 測試環境
- **Component**: `StrikeZoneScreen`
- **Path**: `src/screens/StrikeZoneScreen.js`
- **Tools**: Jest, React Native Testing Library
- **Mocks**: 
  - `useAtBatRecords`, `useStrikeZoneUI`: 模擬業務邏輯與介面互動勾子
  - `firebaseService`, `firebase/*`: 全面 Mock 以避免 ESM 相關的 `SyntaxError`
  - `react-native-paper`, `react-native-safe-area-context`: 模擬 UI 框架元件

## 3. 測試案例與結果 (Test Cases & Results)

### 3.1 前端元素 (UI Elements)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
| UI-01 | 渲染打席數據輸入畫面 (載入中) | 顯示「資料庫連線中...」 | ✅ Passed |
| UI-02 | 渲染打席數據輸入畫面 (載入完成) | 顯示標題與九宮格元件 | ✅ Passed |
| UI-03 | 狀態列顯示正確球數與燈號 | 燈號數量與傳入狀態一致 | ✅ Passed |
| UI-04 | 顯示最新一球結果 | 顯示最後一筆紀錄的結果 (如: 界外) | ✅ Passed |
| UI-05 | 打席結束顯示結算文字 (三振) | 根據結束狀態顯示結算文字 | ✅ Passed |

### 3.2 互動邏輯 (Interaction Logic)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
| INT-01 | 點擊抽屜按鈕開啟側邊欄 | 呼叫 `ui.drawer.toggle` | ✅ Passed |
| INT-02 | 點擊畫面觸發點選球位 | 呼叫 `ui.handleScreenPress` | ✅ Passed |
| INT-03 | 儲存打席彙整 | 開啟 `EndAtBatModal` | ✅ Passed |

## 4. 執行紀錄
- **執行時間**: 2026-01-28 23:05
- **重試次數**: 5 (主要處理 Firebase ESM 衝突與 Mock 作用域問題)
- **最終結果**: Success
- **備註**: 
採用了積極的 Mock 策略來排除 Firebase ESM 在 Jest 環境中的解析錯誤，並透過 `testID` 與 `icon-name` 的組合精確定位 UI 互動點。
