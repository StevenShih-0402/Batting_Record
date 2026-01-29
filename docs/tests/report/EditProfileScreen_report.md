# 測試報告：EditProfileScreen

## 1. 測試目標
驗證 `EditProfileScreen` 的表單渲染、安全性設定的條件顯示及各項互動邏輯（頭像選取、儲存、刪除帳號）。

## 2. 測試環境
- **Component**: `EditProfileScreen`
- **Path**: `src/screens/EditProfileScreen.js`
- **Tools**: Jest, React Native Testing Library
- **Mocks**: 
  - `useEditProfile` hook: 模擬表單狀態與操作
  - `firebaseService`, `authService`: 模擬後端服務
  - `react-native-paper`, `react-native-safe-area-context`: 模擬 UI 框架以避免渲染錯誤

## 3. 測試案例與結果 (Test Cases & Results)

### 3.1 前端元素 (UI Elements)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
| UI-01 | 渲染基本資料表單 | 正確顯示名稱與禁用電子郵件 | ✅ Passed |
| UI-02 | 渲染頭像區域 | 顯示頭像相關元件 | ✅ Passed |
| UI-03 | 安全性設定 (Email 用戶) | 顯示密碼修改區域 | ✅ Passed |
| UI-04 | 安全性設定 (Google 用戶) | 隱藏密碼修改區域 | ✅ Passed |

### 3.2 互動邏輯 (Interaction Logic)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
| INT-01 | 更新顯示名稱 | 呼叫 `form.setDisplayName` | ✅ Passed |
| INT-02 | 更新密碼 | 呼叫 `form.setPassword` | ✅ Passed |
| INT-03 | 點擊頭像觸發圖片選擇 | 呼叫 `form.pickImage` | ✅ Passed |
| INT-04 | 點擊儲存按鈕 | 呼叫 `actions.handleSave` | ✅ Passed |
| INT-05 | 點擊刪除帳號按鈕 | 呼叫 `actions.handleDeleteAccount` | ✅ Passed |

## 4. 執行紀錄
- **執行時間**: 2026-01-28 22:50
- **重試次數**: 3 (環境 Mock 調整)
- **最終結果**: Success
- **備註**: 
由於 React 19 與部分套件的 CJS/ESM 衝突，測試中採取了較為徹底的 UI 框架 Mock 策略，以專注於組件邏輯驗證。
