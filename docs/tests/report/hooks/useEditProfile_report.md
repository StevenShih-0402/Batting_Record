# 測試報告：useEditProfile Hook

## 1. 測試目標與範圍
- **測試對象**：`src/hooks/useEditProfile.js`
- **覆蓋功能**：
  - 初始化狀態驗證（區分一般 Email 用戶與 Google 連結用戶）。
  - 圖片選取邏輯（權限要求、結果存入 State）。
  - 儲存變更邏輯：
    - 基本資料（名稱、頭貼）更新。
    - 圖片上傳（偵測本地 URI 並上傳）。
    - 密碼變更（包含當前密碼重驗證、新密碼設定、欄位清空）。
    - 錯誤處理（如 `requires-recent-login`）。
  - 帳號連結操作：
    - 連結 Google 帳號及其衝突處理。
    - 解除連結 Google 帳號（包含二次確認）。
  - 帳號刪除邏輯：
    - 二次確認、重定向設定、權限不足提示。
  - Loading 狀態切換驗證。

## 2. 測試環境設定
- **Mock 依賴**：
  - `AlertContext`: `showSuccess`, `showError`, `showWarning`, `showInfo`。
  - `authService`: `reauthenticateUser`, `updateUserProfile`, `updateUserPassword`, `deleteUserAccount`, `linkGoogleAccount`, `unlinkGoogleAccount`, `setPostLoginRedirect`。
  - `storageService`: `uploadProfileImage`。
  - `expo-image-picker`: `requestMediaLibraryPermissionsAsync`, `launchImageLibraryAsync`。
  - `firebaseService`: `auth.currentUser`。

## 3. 測試案例與結果
- **【初始化 (Initialization)】**
  - [x] 應該根據目前登入的使用者資料初始化表單狀態
  - [x] 應該正確辨識 Google 用戶
- **【圖片選取 (pickImage)】**
  - [x] 當授予權限且選取圖片成功時，應更新 photoURL 狀態
  - [x] 當權限不足時，應顯示警告訊息
- **【儲存變更 (handleSave)】**
  - [x] 僅修改名稱時，應正確呼叫 updateUserProfile 並顯示成功訊息
  - [x] 修改照片為本地路徑時，儲存前應先呼叫 uploadProfileImage
  - [x] 修改密碼時，若未填寫當前密碼（且為 Password 用戶），應顯示警告訊息
  - [x] 修改密碼時，重驗證失敗時應顯示錯誤訊息
  - [x] 重驗證與密碼更新皆成功後，應清空密碼欄位並顯示成功訊息
  - [x] 當 error 為 requires-recent-login 時，應正確提示
- **【帳號連結操作】**
  - [x] 連結 Google 成功後應顯示成功訊息並返回
  - [x] 引發解除連結彈窗，確認後應執行解連
- **【帳號刪除】**
  - [x] 應彈波警告並在確認後刪除帳號

## 4. 執行日誌快照
```text
PASS tests/hooks/useEditProfile.test.js
  useEditProfile 測試
    【初始化 (Initialization)】
      ✓ 應該根據目前登入的使用者資料初始化表單狀態 (11 ms)
      ✓ 應該正確辨識 Google 用戶 (1 ms)
    【圖片選取 (pickImage)】
      ✓ 當授予權限且選取圖片成功時，應更新 photoURL 狀態 (2 ms)
      ✓ 當權限不足時，應顯示警告訊息 (1 ms)
    【儲存變更 (handleSave)】
      ✓ 僅修改名稱時，應正確呼叫 updateUserProfile 並顯示成功訊息 (1 ms)
      ✓ 修改照片為本地路徑時，儲存前應先呼叫 uploadProfileImage (1 ms)
      ✓ 修改密碼時，若未填寫當前密碼（且為 Password 用戶），應顯示警告訊息 (1 ms)
      ✓ 修改密碼時，重驗證失敗時應顯示錯誤訊息 (2 ms)
      ✓ 重驗證與密碼更新皆成功後，應清空密碼欄位並顯示成功訊息 (2 ms)
      ✓ 當 error 為 requires-recent-login 時，應正確提示 (1 ms)
    【帳號連結操作】
      ✓ 連結 Google 成功後應顯示成功訊息並返回 (1 ms)
      ✓ 引發解除連結彈窗，確認後應執行解連 (1 ms)
    【帳號刪除】
      ✓ 應彈波警告並在確認後刪除帳號 (1 ms)

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        0.639 s, estimated 1 s
Ran all test suites matching /tests\/hooks\/useEditProfile.test.js/i.
Exit code: 0
```

## 5. 結論與覆蓋率概述
`useEditProfile` Hook 通過所有 13 個測試案例。測試涵蓋了從基本資料變更、圖片上傳、敏感操作（密碼、刪除帳號）的重驗證流程、到 Google 帳號連結的多樣化場景。邏輯覆蓋率 100%。
