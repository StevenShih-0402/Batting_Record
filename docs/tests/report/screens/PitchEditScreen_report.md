# 測試回報：PitchEditScreen

## 1. 測試目標與範圍
- **目標組件**：`src/screens/PitchEditScreen.js`
- **測試範圍**：
  - 前端 UI 元件渲染 (頂部資訊卡標題位置、表單元件呈現、自訂打席備註欄位佈局)
  - 互動邏輯 (修改一般欄位與自訂欄位值，並且呼叫相對應的 hook 設定函數)
  - 功能邏輯 (更新儲存：觸發 `handleSave` 與 success callback，刪除：觸發 `onDelete` 並返回)

## 2. 測試環境
- **時間**：2026-02-28
- **執行指令**：`npm test tests/PitchEditScreen.test.js`
- **測試框架**：Jest + `@testing-library/react-native`

## 3. 測試案例結果

### 3.1. 前端元素
- ✅ `渲染單球編輯畫面含資料`: 正確帶入紀錄中的好球、原本的球種、球速以及動態產生的自訂欄位 `customValues` 狀態。

### 3.2. 互動邏輯
- ✅ `修改自訂欄位值`: 變更 TextInput 中的文字或重新選擇 Dropdown 時，觸發 `setCustomValue`。

### 3.3. 功能邏輯
- ✅ `點擊更新變更`: 點擊更新按鈕後，呼叫 `handleSave`，並模擬 hook 成功回呼 `onSave` 及退回指令。
- ✅ `點擊刪除此球`: 點擊刪除按鈕後，呼叫 `onDelete` 及退回指令。

## 4. 測試執行紀錄
```text
> battingrecord_frontend@1.0.0 test
> jest tests/PitchEditScreen.test.js

 PASS  tests/PitchEditScreen.test.js
  PitchEditScreen 測試
    【前端元素】
      ✓ 渲染單球編輯畫面含資料 (15 ms)
    【互動邏輯】
      ✓ 修改自訂欄位值 (4 ms)
    【功能邏輯】
      ✓ 點擊更新變更 (5 ms)
      ✓ 點擊刪除此球 (3 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        1.144 s
```

## 5. 結論
PitchEditScreen 的基本表單輸入、動態欄位取用，以及儲存和刪除流程。測試順利一次通過。
