# 測試規劃：pitchService_test.md

## 1. 測試目標
驗證投球紀錄的即時監聽、CRUD 操作，以及在不同身份下的分發邏輯。

## 2. 測試案例 (Test Cases)

### 2.1 【即時監聽與排序】
- **未準備就緒時的處理**
  - **輸入**: `firebaseStatus.isReady` 為 false。
  - **預期結果**: `setLoadingCallback(true)`，返回空函式。
- **讀取紀錄並依時間降冪排序**
  - **預期結果**: `onSnapshot` 回傳資料後，`setRecordsCallback` 接收到的數組中，最新的球應在索引 0。

### 2.2 【CRUD 操作】
- **存儲新球紀錄**
  - **預期結果**: 呼叫 `addDoc` 時包含 `userId` 與 `serverTimestamp()`。
- **更新與刪除紀錄**
  - **預期結果**: 呼叫 `updateDoc` 或 `deleteDoc` 於指定的 `id` 與路徑。

### 2.3 【身分處理】
- **無 user 時嘗試匿名認證**
  - **預期結果**: 若 `user` 為 null，呼叫 `signInAnonymously`。
- **特定 User 的查詢過濾**
  - **情境**: 有傳入 `user` 對象。
  - **預期結果**: `query` 應包含 `where('userId', '==', user.uid)`。
