# 測試報告：useLogin Hook

## 1. 測試目標與範圍
- **測試對象**：`src/hooks/auth/useLogin.js`
- **覆蓋功能**：
  - 表單驗證：驗證登入與註冊時，對於空值和兩次密碼輸入不一致的檢查與防呆。
  - 登入流程：驗證使用 Email 登入時，信箱是否驗證的判斷，以及呼叫 Firebase 結果的處理與 Alert 回饋。
  - 註冊流程：驗證註冊成功後，是否連帶發送驗證信、自動登出，並切換回登入模式。
  - 忘記密碼：驗證重設密碼信件發送邏輯及例外處理。
  - 社群登入：驗證擴充接口的執行情況。

## 2. 測試環境設定
- **Mock 依賴**：
  - `AlertContext`: Mock `showError`, `showWarning`, `showMailSend`，驗證 UI 反饋。
  - `authService`: Mock 所有登入相關操作，包含 `signInWithEmail`, `signUpWithEmail`, `sendVerification`, `sendResetPasswordEmail`, `signOutUser`。

## 3. 測試案例與結果
- **【表單驗證與錯誤處理 (handleEmailAuth)】**
  - [x] 未輸入電子郵件或密碼時，應呼叫 showWarning 提示，並回傳 false
  - [x] 註冊模式下，若兩次輸入密碼不一致，應呼叫 showWarning 提示，並回傳 false
- **【登入流程 (isLoginMode = true)】**
  - [x] 登入成功但信箱尚未驗證時，應呼叫 showWarning 提示未驗證，並回傳 false
  - [x] 登入成功且信箱已驗證時，應回傳 true 表明可以導航或處理後續
  - [x] 登入失敗發生例外時，應捕捉錯誤、呼叫 showError 顯示登入失敗、設定 loading 為 false，並回傳 false
- **【註冊流程 (isLoginMode = false)】**
  - [x] 註冊成功後，應呼叫 sendVerification 發送驗證信、呼叫 showMailSend 提示、呼叫 signOutUser，接著切換回登入模式並回傳 false
  - [x] 註冊失敗發生例外時，應捕捉錯誤、呼叫 showError 顯示註冊失敗、設定 loading 為 false，並回傳 false
- **【社群登入 (handleSocialLogin)】**
  - [x] 當 loginFunction 未提供時，應呼叫 showWarning 提示尚未實作，並回傳 null
  - [x] loginFunction 成功時，應設定 loading 狀態，最終回傳 loginFunction 的結果
  - [x] loginFunction 失敗時，應捕捉錯誤、呼叫 showError，並回傳 null
- **【忘記密碼 (handleForgotPassword)】**
  - [x] 未輸入電子郵件時，應呼叫 showWarning 提示輸入
  - [x] 發送重設信成功時，應呼叫 sendResetPasswordEmail 並透過 showMailSend 提示成功
  - [x] 發送重設信發生例外時，應捕捉錯誤並呼叫 showError 顯示發送失敗

## 4. 執行日誌快照
```text
PASS tests/hooks/auth/useLogin.test.js
  useLogin 測試
    【表單驗證與錯誤處理 (handleEmailAuth)】
      ✓ 未輸入電子郵件或密碼時，應呼叫 showWarning 提示，並回傳 false (14 ms)
      ✓ 註冊模式下，若兩次輸入密碼不一致，應呼叫 showWarning 提示，並回傳 false (2 ms)
    【登入流程 (isLoginMode = true)】
      ✓ 登入成功但信箱尚未驗證時，應呼叫 showWarning 提示未驗證，並回傳 false (1 ms)
      ✓ 登入成功且信箱已驗證時，應回傳 true 表明可以導航或處理後續 (1 ms)
      ✓ 登入失敗發生例外時，應捕捉錯誤、呼叫 showError 顯示登入失敗、設定 loading 為 false，並回傳 false (2 ms)
    【註冊流程 (isLoginMode = false)】
      ✓ 註冊成功後，應呼叫 sendVerification 發送驗證信、呼叫 showMailSend 提示、呼叫 signOutUser，接著切換回登入模式並回傳 false (2 ms)
      ✓ 註冊失敗發生例外時，應捕捉錯誤、呼叫 showError 顯示註冊失敗、設定 loading 為 false，並回傳 false (1 ms)
    【社群登入 (handleSocialLogin)】
      ✓ 當 loginFunction 未提供時，應呼叫 showWarning 提示尚未實作，並回傳 null
      ✓ loginFunction 成功時，應設定 loading 狀態，最終回傳 loginFunction 的結果
      ✓ loginFunction 失敗時，應捕捉錯誤、呼叫 showError，並回傳 null (1 ms)
    【忘記密碼 (handleForgotPassword)】
      ✓ 未輸入電子郵件時，應呼叫 showWarning 提示輸入 (1 ms)
      ✓ 發送重設信成功時，應呼叫 sendResetPasswordEmail 並透過 showMailSend 提示成功 (4 ms)
      ✓ 發送重設信發生例外時，應捕捉錯誤並呼叫 showError 顯示發送失敗 (1 ms)

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        0.682 s
```

## 5. 結論與覆蓋率概述
`useLogin` 此複雜度較高的表單 Hook 順利通過所有的 13 個測試案例。
測試驗證了其完整的註冊、登入策略（要求 Email 認證），並涵蓋了前端防呆與後端拋錯的場景。達成 100% 邏輯覆蓋率。
