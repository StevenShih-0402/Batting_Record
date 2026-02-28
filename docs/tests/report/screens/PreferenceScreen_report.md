# 測試回報：PreferenceScreen

## 1. 測試目標與範圍
- **目標組件**：`src/screens/PreferenceScreen.js`
- **測試範圍**：
  - 前端 UI 元件渲染 (主題顏色區塊、自訂球種清單、自訂欄位表單與列表)
  - 互動邏輯 (選擇主題色、新增/刪除自訂球種)
  - 自訂欄位邏輯 (新增/刪除文字與下拉選單型自訂欄位)
  - 儲存功能邏輯 (點擊儲存並呼叫 API)

## 2. 測試環境
- **時間**：2026-02-28
- **執行指令**：`npm test tests/PreferenceScreen.test.js`
- **測試框架**：Jest + `@testing-library/react-native`

## 3. 測試案例結果

### 3.1. 前端元素
- ✅ `渲染偏好設定畫面基本元件`: 顯示所有區段與儲存按鈕。

### 3.2. 互動邏輯
- ✅ `選擇主題顏色`: 確認 UI 元素渲染。
- ✅ `新增自訂球種`: 確認新球種加入至清單中。
- ✅ `刪除自訂球種`: 確認球種從清單移除。

### 3.3. 自訂欄位邏輯
- ✅ `新增文字型自訂欄位`: 確認輸入欄位名稱建立文字型自訂欄位。
- ✅ `新增下拉選單型自訂欄位與選項`: 確認下拉選項被加為動態欄位。
- ✅ `刪除自訂欄位`: 確認動態欄位從設定清單移除。

### 3.4. 功能邏輯
- ✅ `儲存變更`: 點擊儲存後，確認 `savePreferences`、`showSuccess` 與 `navigation.goBack` 均被正確調用。

## 4. 測試執行紀錄
```text
> battingrecord_frontend@1.0.0 test
> jest tests/PreferenceScreen.test.js

 PASS  tests/PreferenceScreen.test.js
  PreferenceScreen 測試
    【前端元素】
      ✓ 渲染偏好設定畫面基本元件 (10 ms)
    【互動邏輯】
      ✓ 選擇主題顏色 (1 ms)
      ✓ 新增自訂球種 (8 ms)
      ✓ 刪除自訂球種 (3 ms)
    【自訂欄位邏輯】
      ✓ 新增文字型自訂欄位 (3 ms)
      ✓ 新增下拉選單型自訂欄位與選項 (2 ms)
      ✓ 刪除自訂欄位 (2 ms)
    【功能邏輯】
      ✓ 儲存變更 (2 ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        1.111 s
```

## 5. 結論
PreferenceScreen 測試全數通過，自訂欄位的 UI 狀態管理及偏好更新邏輯運作正常。
