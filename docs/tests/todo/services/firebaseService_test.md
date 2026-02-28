# 測試規劃：firebaseService_test.md

## 1. 測試目標
驗證 Firebase 服務的初始化邏輯，確保根據配置正確建立 `auth`, `db`, `storage` 實例，並正確導出環境狀態。

## 2. 測試案例 (Test Cases)

### 2.1 【初始化邏輯】
- **第二次調用不應重複初始化 App**
  - **預期結果**: 若 `getApps().length > 0`，應呼叫 `getApp()` 而非 `initializeApp()`。
- **Auth 應使用持久化配置**
  - **預期結果**: 呼叫 `initializeAuth` 時傳入 `ReactNativeAsyncStorage` 作為持久化介面。

### 2.2 【導出值驗證】
- **導出正確的 Firestore 路徑**
  - **預期結果**: `firebaseStatus` 中的 `BATTING_RECORDS_PATH` 與 `AT_BAT_SUMMARY_PATH` 與 `firebaseConfig` 定義一致。
