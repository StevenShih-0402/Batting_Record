# 測試報告：LoginScreen.js

## 1. 測試目標
確保 LoginScreen 登入與註冊頁面能正確依照模式顯示對應的輸入欄位（例如確認密碼與忘記密碼），並驗證切換模式與密碼顯示的互動邏輯及發送登入/註冊驗證的行為。

## 2. 測試環境
- **Component**: `LoginScreen`
- **Path**: `src/screens/LoginScreen.js`
- **Tools**: Jest, React Native Testing Library
- **Mocks**: 
  - `firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`
  - `@react-native-google-signin/google-signin`
  - `src/hooks/auth/useLogin`
  - `src/services/authService`
  - `src/context/AlertContext`
  - `react-native-safe-area-context`
  - `react-native-paper`
  - `@expo/vector-icons`

## 3. 測試案例與結果 (Test Cases & Results)

### 3.1 前端元素 (UI Elements)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
| 1 | 預設顯示登入模式與隱藏確認密碼 | 標題顯示「歡迎回來」，有「忘記密碼」，沒有「確認密碼」欄位 | Pass |

### 3.2 互動邏輯 (Interaction Logic)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
| 1 | 切換至註冊模式 | 標題變為「建立新帳戶」，顯示「確認密碼」欄位，隱藏「忘記密碼」 | Pass |
| 2 | 輸入密碼能切換顯示/隱藏 | 點擊眼睛 icon 觸發 `setShowPassword` 狀態切換 | Pass |

### 3.3 業務邏輯 (Business Logic)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
| 1 | 點擊主要按鈕觸發驗證 | 呼叫 `actions.handleEmailAuth()` 並在成功後 `navigation.goBack()` | Pass |

## 4. 執行紀錄
- **執行時間**: 2026-02-28
- **重試次數**: 2
- **最終結果**: Success
- **備註**: 
修復 Firebase 與 @react-native-google-signin/google-signin 造成的 Native 模組解析錯誤。