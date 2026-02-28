# useLogin 測試規劃

**目標路徑:** `src/hooks/auth/useLogin.js`
**測試路徑:** `tests/hooks/auth/useLogin.test.js`

## 測試範圍 (Hooks)

`useLogin` 負責封裝登入與註冊頁面的表單狀態（包含 email, password, confirmPassword 等），負責處理 `handleEmailAuth` 的登入與註冊切換、驗證邏輯，以及社交登入 `handleSocialLogin` 與忘記密碼 `handleForgotPassword` 功能。它會高度依賴 `authService` 與 `AlertContext`。

### Context / Service Mocking 策略
- 需要 Mock `../../context/AlertContext`，捕捉 `showError`, `showWarning`, `showMailSend` 的呼叫。
- 需要 Mock `../../services/authService` 的所有與登入相關操作：`signInWithEmail`, `signUpWithEmail`, `sendVerification`, `sendResetPasswordEmail`, `signOutUser`。

### 單元測試項目 (Unit Tests)

1. **【表單驗證與錯誤處理 (handleEmailAuth)】**
    - `未輸入電子郵件或密碼時，應呼叫 showWarning 提示，並回傳 false`
    - `註冊模式下，若兩次輸入密碼不一致，應呼叫 showWarning 提示，並回傳 false`

2. **【登入流程 (isLoginMode = true)】**
    - `登入成功但信箱尚未驗證時，應呼叫 showWarning 提示未驗證，並回傳 false`
    - `登入成功且信箱已驗證時，應回傳 true 表明可以導航或處理後續`
    - `登入失敗發生例外時，應捕捉錯誤、呼叫 showError 顯示登入失敗、設定 loading 為 false，並回傳 false`

3. **【註冊流程 (isLoginMode = false)】**
    - `註冊成功後，應呼叫 sendVerification 發送驗證信、呼叫 showMailSend 提示、呼叫 signOutUser，接著切換回登入模式並回傳 false`
    - `註冊失敗發生例外時，應捕捉錯誤、呼叫 showError 顯示註冊失敗、設定 loading 為 false，並回傳 false`

4. **【社群登入 (handleSocialLogin)】**
    - `當 loginFunction 未提供時，應呼叫 showWarning 提示尚未實作，並回傳 null`
    - `loginFunction 成功時，應設定 loading 狀態，最終回傳 loginFunction 的結果`
    - `loginFunction 失敗時，應捕捉錯誤、呼叫 showError，並回傳 null`

5. **【忘記密碼 (handleForgotPassword)】**
    - `未輸入電子郵件時，應呼叫 showWarning 提示輸入`
    - `發送重設信成功時，應呼叫 sendResetPasswordEmail 並透過 showMailSend 提示成功`
    - `發送重設信發生例外時，應捕捉錯誤並呼叫 showError 顯示發送失敗`
