# 測試規劃：authService_test.md

## 1. 測試目標
驗證身份驗證服務的各項流程，包含 Google 登入/帳號綁定、Email 註冊/登入（含驗證檢查）、個人資料修改及帳號安全操作。

## 2. 測試案例 (Test Cases)

### 2.1 【Google 登入流程】
- **Google 登入並成功綁定匿名帳號**
  - **情境**: 當前為匿名帳號。
  - **預期結果**: 呼叫 `linkWithCredential`。
- **Google 帳號既有資料時切換登入**
  - **情境**: 綁定時丟出 `auth/credential-already-in-use`。
  - **預期結果**: 呼叫 `signInWithCredential`，回傳 `isUpgrade: false`。

### 2.2 【Email 登入與註冊】
- **Email 登入驗證檢查**
  - **輸入**: 正確帳密，但 `emailVerified` 為 false。
  - **預期結果**: 呼叫 `auth.signOut()`，回傳 user 物件。
- **Email 註冊錯誤處理**
  - **輸入**: 已存在的 Email。
  - **預期結果**: 拋出錯誤 "此 Email 已被註冊"。

### 2.3 【個人資料管理】
- **更新顯示名稱與頭像**
  - **輸入**: `{ displayName: 'New Name' }`。
  - **預期結果**: 呼叫 `updateProfile`。
- **重認證與修改密碼**
  - **輸入**: 正確舊密碼。
  - **預期結果**: 呼叫 `reauthenticateWithCredential` 後呼叫 `updatePassword`。

### 2.4 【登出邏輯】
- **匿名用戶禁止登出**
  - **情境**: `isAnonymous` 為 true。
  - **預期結果**: 回傳 false，不呼叫 `signOut`。
