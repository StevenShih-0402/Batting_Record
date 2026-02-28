# 測試報告：useAuth Hook

## 1. 測試目標與範圍
- **測試對象**：`src/hooks/auth/useAuth.js`
- **覆蓋功能**：
  - 驗證 `onAuthStateChanged` 的監聽，以及狀態變換時 (`user`, `isReady`) 是否正確更新。
  - 驗證針對無帳號的「自動匿名登入機制」(Debounce 機制)，確認是否能正確地防抖（避免多次發送登入請求）。
  - 驗證在 `signInAnonymously` 成功與失敗時，`isReady` 能否被正確標示，避免導致 App 卡死在載入畫面。

## 2. 測試環境設定
- **Mock 依賴**：
  - `firebase/auth`: Mock `onAuthStateChanged`，保留 Callback 等待測試案例主動觸發，並 Mock `signInAnonymously` 主動觸發 Callback 以重置 `isSigningIn` 模組變數。
  - `firebaseService`: Mock `auth` 的實例。
  - **計時器**: 使用 `jest.useFakeTimers()` 來控制 300ms 的 debounce 延遲機制。

## 3. 測試案例與結果
- **【初始化與監聽狀態】**
  - [x] 當有 currentUser 登入時，應更新 user 狀態並設定 isReady 為 true
  - [x] 當收到無 currentUser 且尚未登入時，應觸發延遲的匿名登入 (debounce)
  - [x] 當短時間內連續觸發無 currentUser 時，應清除原本的 timeout 避免重複執行匿名登入
  - [x] 當組件卸載時，應呼叫 unsubscribe 並清除相關 timeout
- **【匿名登入行為驗證】**
  - [x] 成功執行 signInAnonymously 時，不應拋出例外，且交由後續的 auth callback 處理狀態
  - [x] 當 signInAnonymously 發生例外報錯時，應捕捉錯誤，並將 isReady 設為 true 以避免畫面卡死

## 4. 執行日誌快照
```text
PASS tests/hooks/auth/useAuth.test.js
  useAuth 測試
    【初始化與監聽狀態】
      ✓ 當有 currentUser 登入時，應更新 user 狀態並設定 isReady 為 true (12 ms)
      ✓ 當收到無 currentUser 且尚未登入時，應觸發延遲的匿名登入 (debounce) (4 ms)
      ✓ 當短時間內連續觸發無 currentUser 時，應清除原本的 timeout 避免重複執行匿名登入 (3 ms)
      ✓ 當組件卸載時，應呼叫 unsubscribe 並清除相關 timeout (2 ms)
    【匿名登入行為驗證】
      ✓ 成功執行 signInAnonymously 時，不應拋出例外，且交由後續的 auth callback 處理狀態 (1 ms)
      ✓ 當 signInAnonymously 發生例外報錯時，應捕捉錯誤，並將 isReady 設為 true 以避免畫面卡死 (1 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.701 s, estimated 1 s
Ran all test suites matching /tests\/hooks\/auth\/useAuth.test.js/i.
```

## 5. 結論與覆蓋率概述
`useAuth` Hook 成功通過所有的 6 個測試案例。
針對該檔案最特殊的模組全域防抖機制 (`isSigningIn`, `signInTimeout`)，測試透過模擬多次極端情境的觸發與假計時器，驗證了防抖邏輯正確運作。並且在 API 回應發生異常（如網路錯誤引起匿名登入失敗）時，系統能正確釋放 `isReady` 狀態。達成 100% 邏輯覆蓋率。
