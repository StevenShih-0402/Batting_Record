# 測試規劃：PitchInputScreen_test.md

## 1. 測試目標
驗證 PitchInputScreen 輸入單一球結果的邏輯，包含動態載入自訂欄位、儲存時同步 Queue 以及最終呼叫儲存 API 的行為。

## 2. 測試案例 (Test Cases)

### 2.1 【前端元素】
- **渲染單一球紀錄輸入畫面**
  - **預期結果**: 顯示標題(例如九宮格位子或九宮格外)、球種下拉選單、結果下拉選單、球速輸入、備註輸入以及「儲存打席球數」按鈕。

### 2.2 【互動邏輯】
- **渲染動態自訂欄位 (文字與下拉)**
  - **預期結果**: 當傳入不同類型的 customPitchFields 時，畫面需正確渲染 TextInput 或是 SelectionDropdown。
- **點擊文字型欄位的 Queue 快速選項**
  - **輸入**: 點擊某個近期輸入過的紀錄內容 (Chip)。
  - **預期結果**: 該文字會自動填入對應的 Text Input 狀態中。

### 2.3 【功能邏輯】
- **點擊儲存並返回**
  - **輸入**: 填妥所有資訊後點擊「儲存打席球數」。
  - **預期結果**: 呼叫 `handleSaveWithQueue` -> `pushToFieldQueue` -> `handleSave`，並在完成後調用 `onSave` 以及 `navigation.goBack()`。
