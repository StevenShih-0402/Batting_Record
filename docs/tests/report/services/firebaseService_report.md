# 測試報告：firebaseService_report.md

## 1. 測試目標與範圍
- **測試對象**：`src/services/firebaseService.js`
- **覆蓋功能**：Firebase App 初始化、Auth/Firestore/Storage 實例建立、全域路徑與狀態導出。

## 2. 測試環境設定
- **Mock 策略**: 
  - 徹底 Mock `firebase/app`, `firebase/firestore`, `firebase/auth`, `firebase/storage`。
  - Mock `firebaseConfig` 以隔離真實環境變數。

## 3. 測試案例與結果
- **【單例模式驗證】**
  - [x] 成功初始化 App (驗證 `initializeApp` 被呼叫)
  - [x] 實例正確連動 (驗證 `auth`, `db`, `storage` 導出的 Mock 類型)
- **【路徑導出】**
  - [x] 導出正確的 Firestore 路徑 (BATTING_RECORDS_PATH, AT_BAT_SUMMARY_PATH)

## 4. 執行日誌快照
```text
PASS tests/services/firebaseService.test.js
  firebaseService 測試
    【初始化邏輯】
      ✓ 第一次調用應初始化 App (1 ms)
      ✓ 導出實例應正確連動 (2 ms)
    【導出值驗證】
      ✓ 導出正確的 Firestore 路徑 (1 ms)
```

## 5. 結論與覆蓋率概述
`firebaseService` 作為整個專案的基礎設施層，其初始化邏輯與路徑導出均符合預期。測試確保了在 App 啟動時能正確配置 Firebase 並提供統一的存取路徑給其他 Service 使用。
