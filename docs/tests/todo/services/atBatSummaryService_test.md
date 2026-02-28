# 測試規劃：atBatSummaryService_test.md

## 1. 測試目標
驗證 `atBatSummaryService` 的業務邏輯，包含打席彙整的寫入、逐球紀錄的批量刪除、歷史紀錄的讀取與排序，以及刪除/更新功能。

## 2. 測試案例 (Test Cases)

### 2.1 【彙整與清除】
- **成功彙整並清空紀錄**
  - **輸入**: `summaryData`, `user`, `recordIds=['id1', 'id2']`。
  - **預期結果**: 呼叫 `addDoc` 寫入摘要，呼叫 `writeBatch.delete` 兩次並 `commit`。
- **無紀錄時僅寫入摘要**
  - **輸入**: `recordIds=[]`。
  - **預期結果**: 僅呼叫 `addDoc`，不執行 `writeBatch`。

### 2.2 【讀取歷史摘要】
- **根據 userId 監聽歷史紀錄**
  - **輸入**: `userId="test_uid"`。
  - **預期結果**: 建立包含 `where("userId", "==", "test_uid")` 的查詢並呼叫 `onSnapshot`。
- **資料讀取後的正確轉換與排序**
  - **輸入**: Snapshot 返回三筆資料，`startAt` 分別為不同時間。
  - **預期結果**: 回傳給 `setRecordsCallback` 的資料應依 `startAt` 降冪排列，且包含格式化後的 `date` 字串。

### 2.3 【修改與刪除】
- **刪除打席摘要**
  - **輸入**: `docId="summary_123"`。
  - **預期結果**: 呼叫 `deleteDoc` 於正確的路徑。
- **更新打席中的球種紀錄**
  - **輸入**: `docId`, `newPitchRecords=[...]`。
  - **預期結果**: 呼叫 `updateDoc`，更新 `pitchRecords` 與重算的 `totalPitches`。
