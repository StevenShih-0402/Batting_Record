# 測試計畫：登入畫面 (LoginScreen)

## 1. 測試目標
驗證登入畫面的 UI 呈現、使用者互動及業務邏輯處理是否正確。

## 2. 測試環境
- **Component**: `LoginScreen`
- **Path**: `src/screens/LoginScreen.js`
- **Tools**: Jest, React Native Testing Library
- **Mocks**: 
    - `useLogin` (Custom Hook)
    - `@expo/vector-icons`
    - `react-native-paper`
    - `@react-native-google-signin/google-signin`
    - `react-native-safe-area-context`

## 3. 測試案例 (Test Cases)

### 3.1 前端元素 (UI Elements)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
| UI-001 | 渲染登入畫面基本元件 | 包含標題、Email/密碼輸入框、按鈕等皆正確顯示 | [x] |
| UI-002 | 顯示 Google 社群登入按鈕 | Google 登入按鈕正確顯示 | [x] |

### 3.2 互動邏輯 (Interaction Logic)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
| INT-001 | 切換登入/註冊模式 | 點擊切換連結後，`isLoginMode` 狀態改變 | [x] |
| INT-002 | 密碼顯示切換 | 點擊眼睛圖示後，`showPassword` 狀態改變 | [x] |

### 3.3 業務邏輯 (Business Logic)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
| BIZ-001 | Email 輸入更新 | 輸入文字後，`setEmail` 被呼叫 | [x] |
| BIZ-002 | 密碼 輸入更新 | 輸入文字後，`setPassword` 被呼叫 | [x] |
| BIZ-003 | 執行 Email 認證 (登入/註冊) | 點擊按鈕後，`handleEmailAuth` 被呼叫 | [x] |
| BIZ-004 | 執行 Google 社群登入 | 點擊 Google 按鈕後，`handleSocialLogin` 被呼叫 | [x] |

## 4. 執行紀錄
- **執行時間**: 2026-01-28
- **執行結果**: All Passed
- **備註**: 
    - 使用了 Full Mock 對 `react-native-paper` 進行模擬以避免環境 crash。
    - 對 `LoginScreen.js` 增加了 `testID` 以利於測試選取。