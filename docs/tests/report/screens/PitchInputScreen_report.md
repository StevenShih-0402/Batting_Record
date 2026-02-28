# 測試回報：PitchInputScreen

## 1. 測試目標與範圍
- **目標組件**：`src/screens/PitchInputScreen.js`
- **測試範圍**：
  - 前端 UI 元件渲染 (標題、球種、結果、球速、備註、自訂打席備註欄位)
  - 互動邏輯 (渲染動態自訂欄位、點擊文字型欄位的 Queue 快選選項自動填入)
  - 儲存功能邏輯 (點擊儲存按鈕將欄位值推送至 Queue 並呼叫儲存 API 返回)

## 2. 測試環境
- **時間**：2026-02-28
- **執行指令**：`npm test tests/PitchInputScreen.test.js`
- **測試框架**：Jest + `@testing-library/react-native`

## 3. 測試案例結果

### 3.1. 前端元素
- ✅ `渲染單一球紀錄輸入畫面`: 顯示標題及所有預設與自訂欄位。

### 3.2. 互動邏輯
- ✅ `渲染動態自訂欄位 (文字與下拉)`: 正確渲染動態建立的 customPitchFields。
- ✅ `點擊文字型欄位的 Queue 快速選項`: 點擊歷史文字 chip 時，成功將文字設定至輸入框狀態。

### 3.3. 功能邏輯
- ✅ `點擊儲存並返回`: 確認能夠寫入 Queue 並調用 `handleSave`。

## 4. 測試執行紀錄
```text
> battingrecord_frontend@1.0.0 test
> jest tests/PitchInputScreen.test.js

 PASS  tests/PitchInputScreen.test.js
  PitchInputScreen 測試
    【前端元素】
      ✓ 渲染單一球紀錄輸入畫面 (45 ms)
    【互動邏輯】
      ✓ 渲染動態自訂欄位 (文字與下拉) (15 ms)
      ✓ 點擊文字型欄位的 Queue 快速選項 (5 ms)
    【功能邏輯】
      ✓ 點擊儲存並返回 (11 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        1.144 s
```

## 5. 結論
PitchInputScreen 測試全數通過，包含 `usePitchInput` 初始化狀態與 `useCustomFieldQueue` 互動均符合預期。
