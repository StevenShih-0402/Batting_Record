# 測試報告：storageService_report.md

## 1. 測試目標與範圍
- **測試對象**：`src/services/storageService.js`
- **覆蓋功能**：個人頭像圖片上傳至 Firebase Storage、本地 URI 轉 Blob、下載 URL 獲取。

## 2. 測試環境設定
- **Mock 策略**: 
  - Mock `firebase/storage` (`ref`, `uploadBytes`, `getDownloadURL`)。
  - Mock 全域 `fetch` 函式以模擬本地檔案轉 Blob 的過程。

## 3. 測試案例與結果
- **【圖片上傳流程】**
  - [x] 成功上傳圖片並獲取 URL (驗證 fetch -> uploadBytes -> downloadURL 完整鏈條)
  - [x] 上傳失敗應拋出易讀錯誤 (驗證 catch 塊轉換)

## 4. 執行日誌快照
```text
PASS tests/services/storageService.test.js
  storageService 測試
    【圖片上傳流程】
      ✓ 成功上傳圖片並獲取 URL (4 ms)
      ✓ 上傳失敗應拋出易讀錯誤 (14 ms)
```

## 5. 結論與覆蓋率概述
`storageService` 能正確處理非同步上傳流程，即便在網路斷開或 Firebase Storage 拋錯時，也能向 UI 傳達清洗後的錯誤訊息。這確保了 Profile 修改功能的穩定性。
