# useAuth 測試規劃

**目標路徑:** `src/hooks/auth/useAuth.js`
**測試路徑:** `tests/hooks/auth/useAuth.test.js`

## 測試範圍 (Hooks)

`useAuth` 負責監聽 Firebase 的認證狀態 (`onAuthStateChanged`)。當用戶登出或者是初次開啟無帳號時，會自動透過 debounce 機制觸發匿名登入 (`signInAnonymously`)，確保系統永遠有一個可用身分。這裡使用了一些模組層級的變數 (`isSigningIn`, `signInTimeout`) 來防抖。

### Context / Service Mocking 策略
- 需要 Mock `firebase/auth` 的 `onAuthStateChanged` 與 `signInAnonymously`。
- 需要 Mock `../../services/firebaseService` 取得 `auth` 的實例。
- 需要控制 Jest 的計時器 (`jest.useFakeTimers()`) 來測試 debounce 邏輯。

### 單元測試項目 (Unit Tests)

1. **【初始化與監聽狀態】**
    - `當有 currentUser 登入時，應更新 user 狀態並設定 isReady 為 true`
    - `當收到無 currentUser 且尚未登入時，應觸發延遲的匿名登入 (debounce)`
    - `當短時間內連續觸發無 currentUser 時，應清除原本的 timeout 避免重複執行匿名登入`
    - `當組件卸載時，應呼叫 unsubscribe 並清除相關 timeout`

2. **【匿名登入行為驗證】**
    - `成功執行 signInAnonymously 時，不應拋出例外，且交由後續的 auth callback 處理狀態`
    - `當 signInAnonymously 發生例外報錯時，應捕捉錯誤，並將 isReady 設為 true 以避免畫面卡死`
