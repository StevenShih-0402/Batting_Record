狀態：初始為 [ ]、完成為 [x]
注意：狀態只能在測試通過後由流程更新。
測試類型：前端元素、function 邏輯、Mock API、驗證權限...等

---

## [ ] 【前端元素】基本資料欄位渲染
**範例輸入**：`form.displayName` 為「測試用戶」，`user.email` 為 `test@example.com`
**期待輸出**：顯示名稱輸入框顯示「測試用戶」，電子郵件輸入框顯示信箱且為 `disabled` 狀態

---

## [ ] 【介面邏輯】變更密碼前需輸入舊密碼
**範例輸入**：`hasPasswordProvider` 為 `true`，且使用者在「設定新密碼」輸入框打字 (`form.password.length > 0`)
**期待輸出**：畫面出現「請輸入目前的密碼 (驗證身分)」輸入框

---

## [ ] 【使用者互動】綁定與解除綁定 Google 帳號
**範例輸入**：點擊 Google 帳號 Switch 開關
**期待輸出**：若 `isGoogleUser` 為 `true` 則呼叫 `actions.handleUnlinkGoogle`，否則呼叫 `actions.handleLinkGoogle`

---

## [ ] 【功能邏輯】點擊儲存變更
**範例輸入**：點擊「儲存變更」按鈕
**期待輸出**：觸發 `actions.handleSave`
