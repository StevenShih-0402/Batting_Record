# 測試報告：PreferenceScreen Component

## 1. 測試目標與範圍
- **測試對象**：`src/screens/PreferenceScreen.js`
- **覆蓋功能**：
  - 核心區段渲染（主題色、自訂球種、自訂欄位、儲存按鈕）。
  - 自訂球種列表顯示。
  - 自訂欄位編輯器之靜態元素渲染（標籤文字）。
  - 新增自訂欄位功能的 Hook 連動驗證。
  - 儲存變更按鈕與 `handleSave` Hook 連動驗證。

## 2. 測試環境設定
- **Mock 依賴**：
  - `@react-navigation/native`: `useNavigation`。
  - `usePreferenceUI`: 模擬偏好設定狀態與 Action。
  - `useFieldEditor`: 模擬欄位編輯器狀態。
  - `firebase/*`, `AsyncStorage`, `uuid`: 透過 Jest 全域 Mock 隔離外部依賴，避免 ESM 轉譯錯誤。

## 3. 測試案例與結果
- **【前端元素】**
  - [x] 應該正確渲染偏好設定所有的基本元件
- **【互動邏輯】**
  - [x] 渲染新增球種區域
  - [x] 顯示已有的球種 Chip
- **【自訂欄位邏輯】**
  - [x] 渲染自訂欄位編輯器中的欄位名稱文字
  - [x] 點擊新增此欄位按鈕應呼叫 addCustomField
- **【功能邏輯】**
  - [x] 點擊儲存變更應呼叫 handleSave

## 4. 執行日誌快照
```text
PASS tests/screens/PreferenceScreen.test.js
  PreferenceScreen 測試
    【前端元素】
      ✓ 應該正確渲染偏好設定所有的基本元件 (261 ms)
    【互動邏輯】
      ✓ 渲染新增球種區域 (57 ms)
      ✓ 顯示已有的球種 Chip (49 ms)
    【自訂欄位邏輯】
      ✓ 渲染自訂欄位編輯器中的欄位名稱文字 (54 ms)
      ✓ 點擊新增此欄位按鈕應呼叫 addCustomField (47 ms)
    【功能邏輯】
      ✓ 點擊儲存變更應呼叫 handleSave (54 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        1.957 s
Ran all test suites matching /tests\/screens\/PreferenceScreen.test.js/i.
Exit code: 0
```

## 5. 結論與覆蓋率概述
`PreferenceScreen` 通過所有呈現與基本互動測試。
針對 `react-native-paper` 的 Outlined TextInput label 渲染特性調整了斷言，並透過 Jest 配置與 Module Mock 成功解決了 ESM 導致的執行環境問題。組件與 Hook 的整合點運作正常。
