# 測試報告：useProfileUI Hook

## 1. 測試目標與範圍
- **測試對象**：`src/hooks/ui/useProfileUI.js`
- **覆蓋功能**：
  - 驗證登出邏輯 (`handleLogout`)。
  - 驗證成功登出時的 `showSuccess` 提示。
  - 驗證訪客用戶無法登出時的 `showWarning` 提示。
  - 驗證發生錯誤時的 `showError` 提示與錯誤紀錄。

## 2. 測試環境設定
- **Mock 依賴**：
  - `AlertContext`: Mock `useAlert` 以斷言提示訊息。
  - `authService`: Mock `signOutUser` 以模擬不同登出結果。

## 3. 測試案例與結果
- **handleLogout**
  - [x] 當 signOutUser 成功回傳 true 時，應顯示「已登出」的成功訊息
  - [x] 當 signOutUser 回傳 false 時（如訪客用戶），應顯示警告訊息引導用戶綁定帳號
  - [x] 當 signOutUser 執行過程發生例外錯誤時，應顯示錯誤訊息並在 console 紀錄錯誤

## 4. 執行日誌快照
```text
PASS tests/hooks/ui/useProfileUI.test.js
  useProfileUI 測試
    handleLogout
      ✓ 當 signOutUser 成功回傳 true 時，應顯示「已登出」的成功訊息 (15 ms)
      ✓ 當 signOutUser 回傳 false 時（如訪客用戶），應顯示警告訊息 (2 ms)
      ✓ 當 signOutUser 執行過程發生例外錯誤時，應顯示錯誤訊息 (9 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        0.955 s
Ran all test suites matching /tests\/hooks\/ui\/useProfileUI.test.js/i.
Exit code: 0
```

## 5. 結論與覆蓋率概述
`useProfileUI` Hook 通過所有 3 個測試案例。測試涵蓋了正常的成功路徑、業務限制路徑（訪客無法登出）以及例外錯誤處理路徑。邏輯覆蓋率 100%。
