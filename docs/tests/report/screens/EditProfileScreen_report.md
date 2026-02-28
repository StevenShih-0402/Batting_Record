# 測試報告：EditProfileScreen.js

## 1. 測試目標
確保 EditProfileScreen 個人資料編輯頁面能正確對應使用者的認證類型（如 Email / Google）進行基本資料的客製化顯示、綁定 Google 帳號的開關操作，以及驗證儲存與按鈕互動的行為。

## 2. 測試環境
- **Component**: `EditProfileScreen`
- **Path**: `src/screens/EditProfileScreen.js`
- **Tools**: Jest, React Native Testing Library
- **Mocks**: 
  - `firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`
  - `src/services/firebaseService`
  - `@react-native-google-signin/google-signin`
  - `src/hooks/useEditProfile`
  - `react-native-safe-area-context`
  - `react-native-paper`

## 3. 測試案例與結果 (Test Cases & Results)

### 3.1 前端元素 (UI Elements)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
| 1 | 基本資料欄位渲染 | 顯示名稱輸入框顯示資料，電子郵件輸入框顯示信箱且為 `disabled` 狀態 | Pass |

### 3.2 畫面渲染邏輯 (Render Logic)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
| 1 | 變更密碼前需輸入舊密碼 | 若使用者輸入新密碼 (`form.password.length > 0`)，則出現「請輸入目前的密碼」輸入框以供防呆驗證 | Pass |

### 3.3 互動邏輯 (Interaction Logic)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
| 1 | 綁定 與 解除綁定 Google 帳號 | 點擊 Google 帳號 Switch 開關切換綁定狀態 (`isGoogleUser`) | Pass |
| 2 | 點擊儲存變更 | 觸發 `actions.handleSave` | Pass |

## 4. 執行紀錄
- **執行時間**: 2026-02-28
- **重試次數**: 3
- **最終結果**: Success
- **備註**: 
成功修復 firebaseService 未 mock 與 RNGoogleSignin Native 模組解析錯誤的兩項依賴問題。
