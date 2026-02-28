# 測試規劃：storageService_test.md

## 1. 測試目標
驗證圖片上傳流程，包含本地 URI 的轉化、Storage 路徑建立及下載 URL 的獲取。

## 2. 測試案例 (Test Cases)

### 2.1 【圖片上傳流程】
- **成功上傳圖片並獲取 URL**
  - **輸入**: `uri="file://test.jpg"`, `uid="user123"`。
  - **預期結果**: 
    1. 呼叫 `fetch(uri)`。
    2. 呼叫 `ref` 於 `profiles/user123/avatar.jpg`。
    3. 呼叫 `uploadBytes` 並最終回傳 `getDownloadURL` 的結果。
- **上傳失敗應拋出易讀錯誤**
  - **情境**: `uploadBytes` 拋出例外。
  - **預期結果**: 拋出錯誤內容為 "上傳頭像失敗，請稍後再試"。
