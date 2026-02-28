# useProfileUI 測試規劃

**目標路徑:** `src/hooks/ui/useProfileUI.js`
**測試路徑:** `tests/hooks/ui/useProfileUI.test.js`

## 測試範圍 (Hooks)

`useProfileUI` 是一個極簡的 Hook，目前僅負責管理 `ProfileScreen` 的登出邏輯。它調用 `signOutUser` 服務，並根據結果透過 `AlertContext` 顯示成功、警告或錯誤訊息。

### Mocking 策略
- 需要 Mock `AlertContext` 的 `useAlert` 以驗證 `showSuccess`, `showWarning`, `showError` 的調用。
- 需要 Mock `../../services/authService` 的 `signOutUser` 以模擬不同的登出情境。

### 單元測試項目 (Unit Tests)

1. **【登出邏輯 (handleLogout)】**
    - `當 signOutUser 成功回傳 true 時，應顯示「已登出」的成功訊息`
    - `當 signOutUser 回傳 false 時（如訪客用戶），應顯示警告訊息引導用戶綁定帳號`
    - `當 signOutUser 執行過程發生例外錯誤時，應顯示錯誤訊息並在 console 紀錄錯誤`
