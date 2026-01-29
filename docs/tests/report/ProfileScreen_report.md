# 測試報告：ProfileScreen

## 1. 測試目標
驗證 `ProfileScreen` 在不同用戶狀態（訪客、已登入、有無頭貼、Email 驗證狀態）下的 UI 渲染與導向/登出互動邏輯。

## 2. 測試環境
- **Component**: `ProfileScreen`
- **Path**: `src/screens/ProfileScreen.js`
- **Tools**: Jest, React Native Testing Library
- **Mocks**: 
  - `useAuth` hook: 模擬 Firebase 認證狀態
  - `firebase/auth`: 模擬 `signOut` 函式
  - `react-native`: 模擬 `Alert`

## 3. 測試案例與結果 (Test Cases & Results)

### 3.1 前端元素 (UI Elements)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
| UI-01 | 訪客用戶顯示正確資訊 | 顯示「訪客用戶」、顯示登入選項、隱藏登出與編輯 | ✅ Passed |
| UI-02 | 已登入用戶 (有頭貼) | 顯示名稱、頭貼圖片、編輯與登出選項 | ✅ Passed |
| UI-03 | 已登入用戶 (無頭貼) | 顯示「未命名用戶」、Avatar Icon | ✅ Passed |
| UI-04 | Email 未驗證警告 | 顯示「驗證電子郵件」選項 | ✅ Passed |

### 3.2 互動邏輯 (Interaction Logic)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
| INT-01 | 點擊登入導向 | 呼叫 `navigation.navigate('Login')` | ✅ Passed |
| INT-02 | 點擊編輯導向 | 呼叫 `navigation.navigate('EditProfile')` | ✅ Passed |
| INT-03 | 點擊登出執行 | 呼叫 `signOut` 並顯示「已登出」彈窗 | ✅ Passed |

### 3.3 業務邏輯 (Business Logic)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
| BUS-01 | 無特定獨立業務邏輯 | N/A | - |

## 4. 執行紀錄
- **執行時間**: 2026-01-28 22:40
- **重試次數**: 0
- **最終結果**: Success
- **備註**: 
測試工具環境已完成初始化，測試案例全數通過。
