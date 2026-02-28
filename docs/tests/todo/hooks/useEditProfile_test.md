# useEditProfile 測試規劃

**目標路徑:** `src/hooks/useEditProfile.js`
**測試路徑:** `tests/hooks/useEditProfile.test.js`

## 測試範圍 (Hooks)

`useEditProfile` 管理使用者個人資料編輯頁面的狀態與邏輯，包含選取頭貼、修改顯示名稱、變更密碼、連結/解除 Google 帳號以及刪除帳號。

### Mocking 策略
- Mock `expo-image-picker`: 模擬圖片選取流程。
- Mock `../services/authService`: 模擬所有身分驗證相關的操作（重新驗證、更新資料、更新密碼、刪除帳號、連結/解連 Google）。
- Mock `../services/storageService`: 模擬圖片上傳。
- Mock `../context/AlertContext`: 驗證各種 Alert 提示的正確性。
- Mock `../services/firebaseService`: 提供 `auth.currentUser` 的假資料。

### 單元測試項目 (Unit Tests)

1. **【初始化 (Initialization)】**
    - `應該根據目前登入的使用者資料（displayName, photoURL）初始化表單狀態`
    - `應該正確辨識使用者是否為 Google 用戶及是否具備密碼登入方式 (isGoogleUser, hasPasswordProvider)`

2. **【圖片選取 (pickImage)】**
    - `當授予權限且選取圖片成功時，應更新 photoURL 狀態`
    - `當權限不足時，應顯示警告訊息`
    - `當選取過程取消時，不應更新 photoURL`

3. **【儲存變更 (handleSave)】**
    - **基本資料更新**: `僅修改名稱或照片時，應正確呼叫 updateUserProfile 並顯示成功訊息`
    - **密碼變更 (Email 用戶)**: `修改密碼時，若未填寫當前密碼，應顯示警告訊息`
    - **密碼變更 (重驗證)**: `修改密碼時，應呼叫 reauthenticateUser，驗證失敗時應顯示錯誤訊息`
    - **密碼變更 (成功)**: `重驗證與密碼更新皆成功後，應清空密碼欄位並顯示成功訊息`
    - **圖片上傳**: `若 photoURL 是本地路徑 (file://)，儲存前應先呼叫 uploadProfileImage`

4. **【帳號連結操作 (Google Link/Unlink)】**
    - **連結 Google**: `呼叫 handleLinkGoogle 成功後應顯示成功訊息並返回`
    - **連結 Google (衝突)**: `若 Google 帳號已被使用，應正確顯示錯誤提示`
    - **解除連結**: `呼叫 handleUnlinkGoogle 應先跳出確認警告，使用者確認後才執行解連並返回`

5. **【帳號刪除 (handleDeleteAccount)】**
    - `呼叫時應顯示危險操作警告`
    - `使用者確認刪除後，應呼叫 deleteUserAccount 並顯示成功訊息`
    - `若需要重新登入 (requires-recent-login)，應顯示對應的安全性提示`

6. **【載入狀態 (Loading State)】**
    - `在執行非同步動作時，loading 狀態應正確切換`
